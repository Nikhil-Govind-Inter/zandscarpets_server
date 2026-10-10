const { sequelize, models } = require("../../../../../database/models");
const { generateSlug, generateUniqueSlug, assertNoDuplicate } = require("../../../../../utils/slugHelper");
const { sendSuccessResponse, sendErrorResponse, sendNotFoundError, sendValidationError } = require("../../traits/responseHandler");
const { paginate } = require("../../traits/datatablePaginationHelper");
const { validationRequestPost, validateId } = require("../../request/products/attributeRequest");
const { validationResult } = require("express-validator");

const dataModel = models.Attributes;

const valuesInclude = {
  model: models.AttributeValues,
  as: "attributeValues",
  attributes: ["id", "value", "value_ar", "slug", "media_path", "media_alt", "media_alt_ar", "color_code", "is_active", "sort_order"],
  required: false,
};

const normalizeSlug = async (req, item, { excludeId, transaction } = {}) => {
  const slug = req.body.slug;
  const sourceTitle = req.body.title || item?.title;
  if (!slug || !String(slug).trim()) {
    req.body.slug = await generateUniqueSlug(dataModel, sourceTitle, {
      excludeId,
      transaction,
    });
    return;
  }
  req.body.slug = generateSlug(slug);
  if (!item || item.slug !== req.body.slug) {
    await assertNoDuplicate(dataModel, {
      field: "slug",
      value: req.body.slug,
      excludeId,
      transaction,
    });
  }
};

class AttributeController {
  static async list(req, res) {
    try {
      const result = await paginate(dataModel, req, {
        where: {},
        order: [["sort_order", "ASC"]],
        searchFields: ["title", "title_ar", "slug"],
        include: [valuesInclude],
      });

      sendSuccessResponse(res, result, "Attribute list retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  // Flat list for product form selects
  static async getActive(req, res) {
    try {
      const result = await dataModel.findAll({
        // where: { is_active: true },
        order: [["sort_order", "ASC"]],
        attributes: ["id", "title", "title_ar", "type", "slug"],
      });
      sendSuccessResponse(res, result, "Attribute list retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getById(req, res) {
    await Promise.all(validateId.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const { id } = req.params;
      const item = await dataModel.findByPk(id, {
        include: [valuesInclude],
        order: [[{ model: models.AttributeValues, as: "attributeValues" }, "sort_order", "ASC"]],
      });
      if (!item) return sendNotFoundError(res, "Attribute");

      sendSuccessResponse(res, item, "Attribute retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    await Promise.all(validationRequestPost.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      await assertNoDuplicate(dataModel, {
        field: "title",
        value: req.body.title,
      });
      await normalizeSlug(req);
      const item = await dataModel.create(req.body);

      const created = await dataModel.findByPk(item.id, {
        include: [valuesInclude],
      });
      sendSuccessResponse(res, created, "Attribute created successfully", 201);
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    await Promise.all([...validateId, ...validationRequestPost].map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const { id } = req.params;
      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Attribute");

      await assertNoDuplicate(dataModel, {
        field: "title",
        value: req.body.title,
        excludeId: id,
      });
      await normalizeSlug(req, item, { excludeId: id });
      await item.update(req.body);

      const updated = await dataModel.findByPk(id, { include: [valuesInclude] });
      sendSuccessResponse(res, updated, "Attribute updated successfully");
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
        return sendNotFoundError(res, "Attribute");
      }

      // Soft-delete its values too so nothing references an inactive attribute.
      await models.AttributeValues.destroy({
        where: { attribute_id: id },
        transaction: t,
      });
      await item.destroy({ transaction: t });
      await t.commit();

      sendSuccessResponse(res, { id }, "Attribute deleted successfully");
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = AttributeController;
