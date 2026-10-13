// Every per-entity bulk-upload controller (template/validate/commit) follows
// the exact same shape — only the config, validator and importer differ.
// This factory builds that controller once so each entity file is just
// wiring, not copy-pasted request handling.

const { sequelize, models } = require("../../../database/models");
const { sendSuccessResponse, sendErrorResponse, sendValidationError } = require("../http/traits/responseHandler");
const { parseWorkbook } = require("./parser");
const { buildTemplate } = require("./templates");
const { saveValidation, loadValidation, deleteValidation } = require("./validationStore");
const { acquireImportLock } = require("./advisoryLock");
const { messages } = require("./messages");

// opts:
//   config          - entity's config/*.config.js
//   validateFn       - async (rows, { models, transaction }) => { errors, warnings, normalizedRows }
//   importFn         - async (normalizedRows, { models, sequelize, transaction }) => { created, skipped }
//   buildReferenceData (optional) - async () => ({ "Label": [values] })
function buildBulkUploadController({ entity, config, validateFn, importFn, buildReferenceData }) {
  return {
    async template(req, res) {
      try {
        const referenceData = buildReferenceData ? await buildReferenceData() : undefined;
        const buffer = await buildTemplate(config, referenceData);

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=${entity}-template.xlsx`);
        res.send(Buffer.from(buffer));
      } catch (error) {
        return sendErrorResponse(res, error);
      }
    },

    async validate(req, res) {
      try {
        if (!req.file) {
          return sendValidationError(res, [{ field: "file", message: "No file uploaded" }]);
        }

        const parsed = await parseWorkbook(req.file.buffer, config);
        if (!parsed.ok) {
          return sendSuccessResponse(res, {
            status: "failed",
            errors: parsed.errors,
            warnings: [],
            summary: { created: 0, skipped: 0 },
          });
        }

        const t = await sequelize.transaction();
        let result;
        try {
          result = await validateFn(parsed.rows, { models, transaction: t });
        } finally {
          await t.rollback(); // validate never writes — always roll back the read snapshot
        }

        if (result.errors.length > 0) {
          return sendSuccessResponse(res, {
            status: "failed",
            errors: result.errors,
            warnings: result.warnings,
            summary: { created: 0, skipped: 0 },
          });
        }

        // Store the structurally-parsed raw rows (not the normalized output)
        // so commit can re-run full validation against fresh DB state with
        // the exact field shapes validateFn expects (spec §9 pt. 6).
        const validationId = await saveValidation(req, { entity, rawRows: parsed.rows });

        // Entities that support upsert (Categories, for now) tag each
        // normalized row with `mode: "create" | "update"` — split the
        // preview summary accordingly; entities without that field just
        // report everything as a create, same as before.
        const updatedCount = result.normalizedRows.filter((r) => r.mode === "update").length;
        const createdCount = result.normalizedRows.length - updatedCount;

        return sendSuccessResponse(res, {
          status: "passed",
          validationId,
          errors: [],
          warnings: result.warnings,
          summary: { created: createdCount, ...(updatedCount > 0 ? { updated: updatedCount } : {}), skipped: 0 },
          preview: result.normalizedRows.slice(0, 10),
        });
      } catch (error) {
        return sendErrorResponse(res, error);
      }
    },

    async commit(req, res) {
      try {
        const { validationId } = req.body;
        if (!validationId) {
          return sendValidationError(res, [{ field: "validationId", message: "validationId is required" }]);
        }

        const stored = await loadValidation(req, validationId);
        if (!stored || stored.entity !== entity) {
          return sendValidationError(res, [{ field: "validationId", message: messages.VALIDATION_EXPIRED() }]);
        }

        const t = await sequelize.transaction();
        try {
          await acquireImportLock(t, entity);

          // Re-validate against current DB state inside the lock — data can
          // have changed since /validate ran (spec §9 pt. 6).
          const revalidated = await validateFn(stored.rawRows, { models, transaction: t });
          if (revalidated.errors.length > 0) {
            await t.rollback();
            return sendSuccessResponse(res, {
              status: "failed",
              errors: revalidated.errors,
              warnings: revalidated.warnings,
              summary: { created: 0, skipped: 0 },
            });
          }

          // Passed through as-is (created/skipped, plus an optional
          // `updated` for entities that support upsert, e.g. Categories) —
          // no per-entity branching needed here.
          const importResult = await importFn(revalidated.normalizedRows, {
            models,
            sequelize,
            transaction: t,
          });

          await t.commit();
          await deleteValidation(req, validationId);

          return sendSuccessResponse(res, importResult, `${entity} imported successfully`);
        } catch (error) {
          await t.rollback();
          throw error;
        }
      } catch (error) {
        return sendErrorResponse(res, error);
      }
    },
  };
}

module.exports = { buildBulkUploadController };
