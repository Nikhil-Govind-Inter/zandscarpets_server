const { models } = require("../../../../../database/models");
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
} = require("../../request/products/productFaqRequest");
const { validationResult } = require("express-validator");

const dataModel = models.ProductFaq;

const productInclude = [
  { model: models.Products, as: "product", attributes: ["id", "title"] },
];

const invalidateAll = async (req, id) => {
  if (id) await invalidateCache(req, cacheKeys.productFaqsItem(id));
  await invalidateCache(req, cacheKeys.productFaqsListPattern());
  // Product responses embed this resource, so drop cached products too.
  await invalidateCache(req, "admin:cache:products:*");
};

class ProductFaqController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.productFaqsList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Product FAQ list retrieved successfully from cache",
        );
      }

      const where = {};
      const productId = parseInt(req.query.product_id, 10);
      if (Number.isInteger(productId) && productId > 0) {
        where.product_id = productId;
      }

      const result = await paginate(dataModel, req, {
        where,
        order: [["sort_order", "ASC"]],
        searchFields: ["question"],
        include: productInclude,
      });

      await setCache(req, listCacheKey, result);
      sendSuccessResponse(res, result, "Product FAQ list retrieved successfully");
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
      const itemCacheKey = cacheKeys.productFaqsItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Product FAQ retrieved successfully",
        );
      }

      const item = await dataModel.findByPk(id, { include: productInclude });
      if (!item) return sendNotFoundError(res, "Product FAQ");

      await setCache(req, itemCacheKey, item);
      sendSuccessResponse(res, item, "Product FAQ retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    await Promise.all(validationRequestPost.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const product = await models.Products.findByPk(req.body.product_id);
      if (!product) {
        return sendValidationError(res, [
          { path: "product_id", msg: "Product not found" },
        ]);
      }

      const item = await dataModel.create(req.body);
      await invalidateAll(req);

      const created = await dataModel.findByPk(item.id, {
        include: productInclude,
      });
      sendSuccessResponse(res, created, "Product FAQ created successfully", 201);
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
      if (!item) return sendNotFoundError(res, "Product FAQ");

      const product = await models.Products.findByPk(req.body.product_id);
      if (!product) {
        return sendValidationError(res, [
          { path: "product_id", msg: "Product not found" },
        ]);
      }

      await item.update(req.body);

      await invalidateAll(req, id);
      const updated = await dataModel.findByPk(id, { include: productInclude });
      sendSuccessResponse(res, updated, "Product FAQ updated successfully");
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
      if (!item) return sendNotFoundError(res, "Product FAQ");

      await item.destroy();

      await invalidateAll(req, id);
      sendSuccessResponse(res, { id }, "Product FAQ deleted successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = ProductFaqController;