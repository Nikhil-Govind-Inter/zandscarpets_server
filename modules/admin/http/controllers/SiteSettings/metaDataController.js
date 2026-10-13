const { models } = require("../../../../../database/models");
const { Op } = require("sequelize");
const { handleFileUploadUpdate, deleteOldFile, handleFileUploadStore } = require("../../middleware/multerMiddleware");
const { sendSuccessResponse, sendErrorResponse, sendNotFoundError, sendValidationError, sendConflictError } = require("../../traits/responseHandler");
const { paginate } = require("../../traits/datatablePaginationHelper");
const { validationRequestPost, validateId } = require("../../request/siteSettings/metaDataRequest");
const { validationResult } = require("express-validator");

const dataModel = models.MetaData;

const TYPES = ["page", "product", "product-variant", "blog"];

// Maps the validated body to its single target column so we can look for an
// existing meta item for the same page/product/variant/blog. validationRequestPost
// guarantees exactly one of the four is set.
const buildTargetWhere = (body) => {
  if (body.page_name) return { page_name: body.page_name };
  if (body.product_id) return { product_id: body.product_id };
  if (body.variant_id) return { variant_id: body.variant_id };
  if (body.blog_id) return { blog_id: body.blog_id };
  return null;
};

const targetNoun = (type) => {
  const nouns = {
    page: "page",
    product: "product",
    "product-variant": "product variant",
    blog: "blog post",
  };
  return nouns[type] || "target";
};

class MetaDataController {
  static async list(req, res) {
    try {
      const where = {};
      const { type, page_name } = req.query;
      if (type && TYPES.includes(type)) where.type = type;
      if (page_name) where.page_name = page_name;
      const productId = parseInt(req.query.product_id, 10);
      if (Number.isInteger(productId) && productId > 0) where.product_id = productId;
      const variantId = parseInt(req.query.variant_id, 10);
      if (Number.isInteger(variantId) && variantId > 0) where.variant_id = variantId;
      const blogId = req.query.blog_id ? String(req.query.blog_id).trim() : "";
      if (blogId) where.blog_id = blogId;

      const result = await paginate(dataModel, req, {
        where,
        include: [
          { model: models.Products, as: "product", attributes: ["id", "title"] },
          { model: models.ProductVariants, as: "variant", attributes: ["id", "label"] },
        ],
        order: [
          ["page_name", "ASC"],
          ["id", "DESC"],
        ],
        searchFields: ["page_name", "blog_id", "meta_title", "product.title", "variant.label"],
      });

      sendSuccessResponse(res, result, "Meta data list retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getById(req, res) {
    await Promise.all(validateId.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }
    try {
      const { id } = req.params;

      const item = await dataModel.findByPk(id, {
        include: [
          { model: models.Products, as: "product", attributes: ["id", "title"] },
          { model: models.ProductVariants, as: "variant", attributes: ["id", "label"] },
        ],
      });
      if (!item) {
        return sendNotFoundError(res, "Meta data item");
      }

      sendSuccessResponse(res, item, "Meta data item retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    try {
      await Promise.all(validationRequestPost.map((v) => v.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationError(res, errors.array());

      const targetWhere = buildTargetWhere(req.body);
      if (targetWhere) {
        const existing = await dataModel.findOne({ where: targetWhere });
        if (existing) {
          return sendConflictError(
            res,
            "Meta data",
            `Meta data already exists for this ${targetNoun(req.body.type)}. Please edit the existing record instead of creating a duplicate.`,
          );
        }
      }

      const item = await dataModel.create(req.body);

      sendSuccessResponse(res, item, "Meta data item created successfully", 201);
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    await Promise.all([...validateId, ...validationRequestPost].map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    try {
      const { id } = req.params;

      const item = await dataModel.findByPk(id);
      if (!item) {
        return sendNotFoundError(res, "Meta data item");
      }

      const targetWhere = buildTargetWhere(req.body);
      if (targetWhere) {
        const existing = await dataModel.findOne({
          where: { ...targetWhere, id: { [Op.ne]: id } },
        });
        if (existing) {
          return sendConflictError(
            res,
            "Meta data",
            `Meta data already exists for this ${targetNoun(req.body.type)}. Please edit the existing record instead of creating a duplicate.`,
          );
        }
      }

      await item.update(req.body);

      sendSuccessResponse(res, item, "Meta data item updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = MetaDataController;
