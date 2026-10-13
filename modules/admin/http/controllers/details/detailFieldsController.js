const { sequelize, models } = require("../../../../../database/models");
const { generateSlug, generateUniqueSlug, assertNoDuplicate } = require("../../../../../utils/slugHelper");
const {
  sendSuccessResponse,
  sendErrorResponse,
  sendNotFoundError,
  sendValidationError,
  sendConflictError,
} = require("../../traits/responseHandler");
const { paginate } = require("../../traits/datatablePaginationHelper");
const { validationRequestPost, validateId } = require("../../request/details/detailFieldsRequest");
const { validationResult } = require("express-validator");

const dataModel = models.DetailFields;

const normalizeSlug = async (req, item, { excludeId, transaction } = {}) => {
  const slug = req.body.slug;
  const sourceTitle = req.body.name || item?.name;
  if (!slug || !String(slug).trim()) {
    req.body.slug = await generateUniqueSlug(dataModel, sourceTitle, { excludeId, transaction });
    return;
  }
  req.body.slug = generateSlug(slug);
  if (!item || item.slug !== req.body.slug) {
    await assertNoDuplicate(dataModel, { field: "slug", value: req.body.slug, excludeId, transaction });
  }
};

// Any mapping of this field that already has at least one item.
const fieldHasItems = async (fieldId, transaction) => {
  const count = await models.DetailItems.count({
    include: [
      {
        model: models.DetailMappings,
        as: "mapping",
        attributes: [],
        where: { field_id: fieldId },
        required: true,
      },
    ],
    transaction,
  });
  return count > 0;
};

class DetailFieldsController {
  static async list(req, res) {
    try {
      const result = await paginate(dataModel, req, {
        order: [["sort_order", "ASC"]],
        searchFields: ["name", "slug"],
      });
      return sendSuccessResponse(res, result, "Detail field list retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  // Flat active list for "add field" pickers.
  static async getActive(req, res) {
    try {
      const items = await dataModel.findAll({
        where: { is_active: true },
        order: [["sort_order", "ASC"]],
        attributes: ["id", "name", "slug", "type", "allows_multiple"],
      });
      return sendSuccessResponse(res, items, "Detail field list retrieved successfully");
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
      if (!item) return sendNotFoundError(res, "Detail field");
      return sendSuccessResponse(res, item, "Detail field retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    await Promise.all(validationRequestPost.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      await assertNoDuplicate(dataModel, { field: "name", value: req.body.name, transaction: t });
      await normalizeSlug(req, null, { transaction: t });

      const item = await dataModel.create(
        {
          name: req.body.name,
          slug: req.body.slug,
          type: req.body.type,
          allows_multiple: req.body.allows_multiple ?? false,
          sort_order: req.body.sort_order ?? 0,
          is_active: req.body.is_active ?? true,
        },
        { transaction: t },
      );

      await t.commit();
      return sendSuccessResponse(res, item, "Detail field created successfully", 201);
    } catch (error) {
      if (!t.finished) await t.rollback();
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    await Promise.all([...validateId, ...validationRequestPost].map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const item = await dataModel.findByPk(id, { transaction: t });
      if (!item) {
        await t.rollback();
        return sendNotFoundError(res, "Detail field");
      }

      // Type cannot change once any mapping of this field already holds
      // items — this is enforced here, not as a DB constraint (see model
      // comment in detailFields.js for why Sequelize can't express this
      // declaratively).
      if (req.body.type && req.body.type !== item.type) {
        if (await fieldHasItems(id, t)) {
          await t.rollback();
          return sendValidationError(res, [
            { path: "type", msg: "Cannot change type: this field already has content" },
          ]);
        }
      }

      await assertNoDuplicate(dataModel, {
        field: "name",
        value: req.body.name,
        excludeId: id,
        transaction: t,
      });
      await normalizeSlug(req, item, { excludeId: id, transaction: t });

      await item.update(
        {
          name: req.body.name,
          slug: req.body.slug,
          type: req.body.type,
          allows_multiple: req.body.allows_multiple,
          sort_order: req.body.sort_order,
          is_active: req.body.is_active,
        },
        { transaction: t },
      );

      await t.commit();
      const updated = await dataModel.findByPk(id);
      return sendSuccessResponse(res, updated, "Detail field updated successfully");
    } catch (error) {
      if (!t.finished) await t.rollback();
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
        return sendNotFoundError(res, "Detail field");
      }

      // Block (don't cascade) while any product/variant still maps this
      // field — the admin must remove those mappings first.
      const mappingCount = await models.DetailMappings.count({
        where: { field_id: id },
        transaction: t,
      });
      if (mappingCount > 0) {
        await t.rollback();
        return sendConflictError(
          res,
          "Detail field",
          "Cannot delete a field that is still mapped to products or variants",
        );
      }

      await item.destroy({ transaction: t });
      await t.commit();
      return sendSuccessResponse(res, { id }, "Detail field deleted successfully");
    } catch (error) {
      if (!t.finished) await t.rollback();
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = DetailFieldsController;
