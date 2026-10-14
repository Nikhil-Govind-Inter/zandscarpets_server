const { sequelize, models } = require("../../../../../database/models");
const { deleteOldFile } = require("../../middleware/multerMiddleware");
const { deleteOrphanMedia } = require("../../../../../services/detailsOrphanMediaCleanupService");
const {
  sendSuccessResponse,
  sendErrorResponse,
  sendNotFoundError,
  sendValidationError,
  sendConflictError,
} = require("../../traits/responseHandler");
const { paginate } = require("../../traits/datatablePaginationHelper");
const {
  MEDIA_KINDS,
  validationRequestPost,
  validationRequestPatch,
  listQuery,
  validateId,
} = require("../../request/details/mediaRequest");
const { MAX_IMAGE_SIZE_BYTES, MAX_VIDEO_SIZE_BYTES } = require("./mediaLimits");
const { validationResult } = require("express-validator");

const formatMb = (bytes) => `${(bytes / (1024 * 1024)).toFixed(0)}MB`;

// Trims a text field and normalizes a cleared/blank value to null, never a
// stray empty string — applied uniformly to alt_text/title/description.
const normalizeText = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
};

const dataModel = models.Media;

// Trust the uploaded file's own mimetype to decide image vs video, never a
// client-supplied field — this is what lets detail_items' image/video field
// matching stay meaningful.
const kindFromMimetype = (mimetype) => {
  if (!mimetype) return null;
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  return null;
};

class MediaController {
  static async list(req, res) {
    await Promise.all(listQuery.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const where = {};
      if (MEDIA_KINDS.includes(req.query.kind)) where.kind = req.query.kind;

      const result = await paginate(dataModel, req, {
        where,
        order: [["id", "DESC"]],
        searchFields: ["alt_text"],
      });
      return sendSuccessResponse(res, result, "Media list retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getById(req, res) {
    await Promise.all(validateId.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const item = await dataModel.findByPk(req.params.id);
      if (!item) return sendNotFoundError(res, "Media");
      return sendSuccessResponse(res, item, "Media retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  // Upload a new media row. Expects a `file` field (required) and an
  // optional `thumbnail` field (videos only). `createUploadMiddleware` has
  // already written the normalized relative paths onto req.body.file /
  // req.body.thumbnail, but it leaves the raw multer file objects on
  // req.files so we can read mimetype/size here.
  static async create(req, res) {
    await Promise.all(validationRequestPost.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const uploaded = req.files?.file?.[0];
    if (!uploaded) {
      return sendValidationError(res, [{ path: "file", msg: "A file is required" }]);
    }

    const kind = kindFromMimetype(uploaded.mimetype);
    if (!kind) {
      await deleteOldFile(req.body.file);
      return sendValidationError(res, [
        { path: "file", msg: "File must be an image or a video" },
      ]);
    }

    // The outer multer ceiling (routes/details/media.js) only guards against
    // the larger of the two limits (video) — enforce the tighter per-kind
    // limit here, since multer can't vary its limit by mimetype within one
    // instance. Clean up anything already written to disk before rejecting.
    const limit = kind === "image" ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;
    if (uploaded.size > limit) {
      await deleteOldFile(req.body.file);
      if (req.body.thumbnail) await deleteOldFile(req.body.thumbnail);
      return sendValidationError(res, [
        { path: "file", msg: `${kind === "image" ? "Image" : "Video"} files must be ${formatMb(limit)} or smaller` },
      ]);
    }

    // A video's thumbnail is itself an image — hold it to the image limit.
    const uploadedThumbnail = req.files?.thumbnail?.[0];
    if (uploadedThumbnail && uploadedThumbnail.size > MAX_IMAGE_SIZE_BYTES) {
      await deleteOldFile(req.body.file);
      await deleteOldFile(req.body.thumbnail);
      return sendValidationError(res, [
        { path: "thumbnail", msg: `Thumbnail images must be ${formatMb(MAX_IMAGE_SIZE_BYTES)} or smaller` },
      ]);
    }

    const t = await sequelize.transaction();
    try {
      const item = await dataModel.create(
        {
          kind,
          location: req.body.file,
          mime_type: uploaded.mimetype,
          size_bytes: uploaded.size,
          alt_text: normalizeText(req.body.alt_text),
          title: normalizeText(req.body.title),
          description: normalizeText(req.body.description),
          thumbnail_location: kind === "video" ? req.body.thumbnail || null : null,
        },
        { transaction: t },
      );

      await t.commit();
      return sendSuccessResponse(res, item, "Media uploaded successfully", 201);
    } catch (error) {
      if (!t.finished) await t.rollback();
      await deleteOldFile(req.body.file);
      if (req.body.thumbnail) await deleteOldFile(req.body.thumbnail);
      return sendErrorResponse(res, error);
    }
  }

  // Metadata-only edit (alt text / title / description). Re-uploading a
  // file is always delete + re-add (create a new Media row, remove the old
  // one) to avoid orphaning files — this never touches location/kind.
  static async update(req, res) {
    await Promise.all([...validateId, ...validationRequestPatch].map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const item = await dataModel.findByPk(req.params.id);
      if (!item) return sendNotFoundError(res, "Media");

      // Only overwrite a field if its key was actually present in the
      // request — but when present, an empty/blank value genuinely clears
      // it to null, it never falls back to the old value. Applied the same
      // way to all three metadata fields.
      const fields = {};
      for (const field of ["alt_text", "title", "description"]) {
        if (Object.prototype.hasOwnProperty.call(req.body, field)) {
          fields[field] = normalizeText(req.body[field]);
        }
      }

      await item.update(fields);
      return sendSuccessResponse(res, item, "Media updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async destroy(req, res) {
    await Promise.all(validateId.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const item = await dataModel.findByPk(id, { transaction: t });
      if (!item) {
        await t.rollback();
        return sendNotFoundError(res, "Media");
      }

      const itemCount = await models.DetailItems.count({ where: { media_id: id }, transaction: t });
      if (itemCount > 0) {
        await t.rollback();
        return sendConflictError(
          res,
          "Media",
          "Remove this media from its detail items before deleting it",
        );
      }

      const { location, thumbnail_location } = item;
      await item.destroy({ transaction: t });
      await t.commit();

      await deleteOldFile(location);
      if (thumbnail_location) await deleteOldFile(thumbnail_location);

      return sendSuccessResponse(res, { id }, "Media deleted successfully");
    } catch (error) {
      if (!t.finished) await t.rollback();
      return sendErrorResponse(res, error);
    }
  }

  static async cleanupOrphans(req, res) {
    try {
      const result = await deleteOrphanMedia({});
      return sendSuccessResponse(res, result, `Removed ${result.deleted} orphaned media file(s)`);
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = MediaController;
