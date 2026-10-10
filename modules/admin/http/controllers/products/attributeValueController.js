const { Op } = require("sequelize");
const { sequelize, models } = require("../../../../../database/models");
const {
  handleFileUploadUpdate,
  handleFileUploadStore,
  deleteOldFile,
} = require("../../middleware/multerMiddleware");
const {
  generateSlug,
  generateUniqueSlug,
  assertNoDuplicate,
} = require("../../../../../utils/slugHelper");
const {
  sendSuccessResponse,
  sendErrorResponse,
  sendNotFoundError,
  sendValidationError,
} = require("../../traits/responseHandler");
const { paginate } = require("../../traits/datatablePaginationHelper");
const {
  getCache,
  setCache,
  invalidateCache,
  cacheKeys,
} = require("../../traits/cacheHelper");
const {
  validationRequestPost,
  validateId,
} = require("../../request/products/attributeValueRequest");
const { validationResult } = require("express-validator");

const dataModel = models.AttributeValues;
const fileFields = ["media_path"];

// Which fields a value must carry for each attribute type.
// - text:  name + arabic name
// - icon:  icon image
// - color: a color bar (color_code) OR an uploaded color photo (media_path)
const isEmpty = (value) =>
  value === undefined || value === null || String(value).trim() === "";

// Returns the validation errors (path + message) required for the attribute's
// type, or [] when the body satisfies it.
const missingForType = (attribute, body) => {
  switch (attribute.type) {
    case "text":
      return [
        ["value", "Value is required"],
        ["value_ar", "Value (Arabic) is required"],
      ]
        .filter(([field]) => isEmpty(body[field]))
        .map(([path, msg]) => ({ path, msg }));
    case "icon":
      return isEmpty(body.media_path)
        ? [{ path: "media_path", msg: "Icon image is required" }]
        : [];
    case "color":
      return isEmpty(body.color_code) && isEmpty(body.media_path)
        ? [
            {
              path: "color_code",
              msg: "Provide a color (color bar) or upload a color photo",
            },
          ]
        : [];
    default:
      return [];
  }
};

const attributeInclude = {
  model: models.Attributes,
  as: "attribute",
  attributes: ["id", "title", "title_ar", "type", "slug"],
};

const invalidateAll = async (req, id) => {
  if (id) await invalidateCache(req, cacheKeys.attributeValuesItem(id));
  await invalidateCache(req, cacheKeys.attributeValuesListPattern());
  // Attribute responses embed this resource, so drop cached attributes too.
  await invalidateCache(req, cacheKeys.attributesListPattern());
};

const normalizeSlug = async (req, item, { excludeId, transaction } = {}) => {
  const slug = req.body.slug;
  const source = req.body.value || item?.value;
  if (!slug || !String(slug).trim()) {
    req.body.slug = await generateUniqueSlug(dataModel, source, {
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

class AttributeValueController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.attributeValuesList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Attribute values list retrieved successfully from cache",
        );
      }

      const where = {};
      const attributeId = parseInt(req.query.attribute_id, 10);
      if (Number.isInteger(attributeId) && attributeId > 0) {
        where.attribute_id = attributeId;
      }

      const result = await paginate(dataModel, req, {
        where,
        order: [["sort_order", "ASC"]],
        searchFields: ["value", "value_ar", "slug"],
        include: [attributeInclude],
      });

      await setCache(req, listCacheKey, result);
      sendSuccessResponse(
        res,
        result,
        "Attribute values list retrieved successfully",
      );
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  // Flat list for product form selects
  static async getActive(req, res) {
    try {
      const where = { is_active: true };
      const attributeId = parseInt(req.query.attribute_id, 10);
      if (Number.isInteger(attributeId) && attributeId > 0) {
        where.attribute_id = attributeId;
      }

      const result = await dataModel.findAll({
        where,
        order: [["sort_order", "ASC"]],
        attributes: [
          "id",
          "attribute_id",
          "value",
          "value_ar",
          "slug",
          "media_path",
          "color_code",
        ],
      });
      sendSuccessResponse(
        res,
        result,
        "Attribute values list retrieved successfully",
      );
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
      const itemCacheKey = cacheKeys.attributeValuesItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Attribute value retrieved successfully",
        );
      }

      const item = await dataModel.findByPk(id, { include: [attributeInclude] });
      if (!item) return sendNotFoundError(res, "Attribute value");

      await setCache(req, itemCacheKey, item);
      sendSuccessResponse(res, item, "Attribute value retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    await Promise.all(validationRequestPost.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const attribute = await models.Attributes.findByPk(req.body.attribute_id);
      if (!attribute) {
        return sendValidationError(res, [
          { path: "attribute_id", msg: "Attribute not found" },
        ]);
      }

      // Stage uploads first so media_path is set before the type check.
      handleFileUploadStore(req, fileFields);

      const missing = missingForType(attribute, req.body);
      if (missing.length) {
        // Roll back the staged upload(s) since we're rejecting the request.
        await Promise.all(
          fileFields.map((field) =>
            req.files?.[field]?.[0]?.path
              ? deleteOldFile(req.files[field][0].path)
              : Promise.resolve(),
          ),
        );
        return sendValidationError(res, missing);
      }

      await normalizeSlug(req);

      const item = await dataModel.create(req.body);

      await invalidateAll(req);
      const created = await dataModel.findByPk(item.id, {
        include: [attributeInclude],
      });
      sendSuccessResponse(
        res,
        created,
        "Attribute value created successfully",
        201,
      );
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    await Promise.all(
      [...validateId, ...validationRequestPost].map((v) => v.run(req)),
    );
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const { id } = req.params;
      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Attribute value");

      const attributeId = req.body.attribute_id || item.attribute_id;
      const attribute = await models.Attributes.findByPk(attributeId);
      if (!attribute) {
        return sendValidationError(res, [
          { path: "attribute_id", msg: "Attribute not found" },
        ]);
      }

      const incomingMedia = req.files?.media_path?.[0]?.path;
      const bodyForType = {
        ...req.body,
        media_path: req.body.media_path || incomingMedia || item.media_path,
      };
      const missing = missingForType(attribute, bodyForType);
      if (missing.length) {
        return sendValidationError(res, missing);
      }

      await handleFileUploadUpdate(req, item, fileFields);
      await normalizeSlug(req, item, { excludeId: id });
      await item.update(req.body);

      await invalidateAll(req, id);
      const updated = await dataModel.findByPk(id, {
        include: [attributeInclude],
      });
      sendSuccessResponse(res, updated, "Attribute value updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async destroy(req, res) {
    await Promise.all(validateId.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const { id } = req.params;
      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Attribute value");

      await item.destroy();
      await deleteOldFile(item.media_path);
      await invalidateAll(req, id);

      sendSuccessResponse(res, { id }, "Attribute value deleted successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = AttributeValueController;