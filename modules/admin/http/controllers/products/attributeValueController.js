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
  validationRequestPost,
  validateId,
} = require("../../request/products/attributeValueRequest");
const { validationResult } = require("express-validator");

const dataModel = models.AttributeValues;
const fileFields = ["media_path"];

// Which fields a value must carry for each attribute type.
// - text:  value + arabic value
// - icon:  icon image + alt text (en/ar)
// - color: name (en/ar) plus either a color bar (color_code) or an uploaded
//          color photo (media_path) with its alt text (en/ar)
const isEmpty = (value) =>
  value === undefined || value === null || String(value).trim() === "";

// Returns the validation errors (path + message) required for the attribute's
// type, or [] when the body satisfies it.
const missingForType = (attribute, body) => {
  const errors = [];
  const require = (path, msg, missing) => {
    if (missing) errors.push({ path, msg });
  };

  switch (attribute.type) {
    case "text":
      require("value", "Value is required", isEmpty(body.value));
      require("value_ar", "Value (Arabic) is required", isEmpty(body.value_ar));
      break;
    case "icon":
      require("media_path", "Icon image is required", isEmpty(body.media_path));
      require("media_alt", "Image alt is required", isEmpty(body.media_alt));
      require(
        "media_alt_ar",
        "Image alt (Arabic) is required",
        isEmpty(body.media_alt_ar),
      );
      break;
    case "color":
      require("value", "Name is required", isEmpty(body.value));
      require("value_ar", "Name (Arabic) is required", isEmpty(body.value_ar));
      if (!isEmpty(body.media_path)) {
        // Photo mode — the image needs alt text.
        require("media_alt", "Image alt is required", isEmpty(body.media_alt));
        require(
          "media_alt_ar",
          "Image alt (Arabic) is required",
          isEmpty(body.media_alt_ar),
        );
      } else {
        // Color bar mode — a hex color is required.
        require(
          "color_code",
          "Provide a color (color bar) or upload a color photo",
          isEmpty(body.color_code),
        );
      }
      break;
    default:
      break;
  }

  return errors;
};

const attributeInclude = {
  model: models.Attributes,
  as: "attribute",
  attributes: ["id", "title", "title_ar", "type", "slug"],
};

const normalizeSlug = async (req, item, { excludeId, transaction } = {}) => {
  const slug = req.body.slug;
  const source = req.body.value || item?.value;
  // Attribute values are unique per attribute, so scope slug lookups to the
  // parent attribute (the DB index is (attribute_id, lower(slug))).
  const attributeId =
    Number(req.body.attribute_id) || item?.attribute_id || null;
  const scope = attributeId ? { attribute_id: attributeId } : undefined;

  if (!slug || !String(slug).trim()) {
    req.body.slug = await generateUniqueSlug(dataModel, source, {
      excludeId,
      transaction,
      scope,
    });
    return;
  }
  req.body.slug = generateSlug(slug);
  if (
    !item ||
    item.slug !== req.body.slug ||
    item.attribute_id !== attributeId
  ) {
    await assertNoDuplicate(dataModel, {
      field: "slug",
      value: req.body.slug,
      excludeId,
      transaction,
      scope,
    });
  }
};

class AttributeValueController {
  static async list(req, res) {
    try {
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
      const item = await dataModel.findByPk(id, { include: [attributeInclude] });
      if (!item) return sendNotFoundError(res, "Attribute value");

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

      await assertNoDuplicate(dataModel, {
        field: "value",
        value: req.body.value,
        scope: { attribute_id: req.body.attribute_id },
      });
      await normalizeSlug(req);

      const item = await dataModel.create(req.body);

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
        // Honor an explicit media_path (including "" when switching a color
        // value from photo to bar); only fall back when it wasn't sent.
        media_path:
          req.body.media_path !== undefined
            ? req.body.media_path
            : incomingMedia || item.media_path,
      };
      const missing = missingForType(attribute, bodyForType);
      if (missing.length) {
        return sendValidationError(res, missing);
      }

      await assertNoDuplicate(dataModel, {
        field: "value",
        value: req.body.value,
        excludeId: id,
        scope: { attribute_id: attributeId },
      });

      await handleFileUploadUpdate(req, item, fileFields);
      await normalizeSlug(req, item, { excludeId: id });
      await item.update(req.body);

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

      sendSuccessResponse(res, { id }, "Attribute value deleted successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = AttributeValueController;