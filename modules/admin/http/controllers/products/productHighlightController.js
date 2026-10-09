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
} = require("../../request/products/productHighlightRequest");
const { validationResult } = require("express-validator");

const dataModel = models.ProductHighlights;

// Category responses embed highlights, so any highlight write must bust them too.
const invalidateRelated = async (req) => {
  await invalidateCache(req, cacheKeys.productHighlightsListPattern());
  await invalidateCache(req, cacheKeys.productCategoriesListPattern());
  await invalidateCache(req, cacheKeys.productCategoriesItemPattern());
};

class ProductHighlightController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.productHighlightsList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Product highlight list retrieved successfully from cache",
        );
      }

      const result = await paginate(dataModel, req, {
        order: [["sort_order", "ASC"]],
        searchFields: ["title", "title_ar"],
      });

      await setCache(req, listCacheKey, result);
      sendSuccessResponse(
        res,
        result,
        "Product highlight list retrieved successfully",
      );
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getActive(req, res) {
    try {
      const result = await dataModel.findAll({
        where: { is_active: true },
        order: [["sort_order", "ASC"]],
        attributes: ["id", "title", "title_ar"],
      });

      sendSuccessResponse(
        res,
        result,
        "Product highlight list retrieved successfully",
      );
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getById(req, res) {
    await Promise.all(validateId.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const { id } = req.params;
      const itemCacheKey = cacheKeys.productHighlightsItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached)
        return sendSuccessResponse(
          res,
          cached,
          "Product highlight retrieved successfully",
        );

      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Product highlight");

      await setCache(req, itemCacheKey, item);
      sendSuccessResponse(res, item, "Product highlight retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    try {
      await Promise.all(validationRequestPost.map((v) => v.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationError(res, errors.array());

      const item = await dataModel.create(req.body);

      await invalidateRelated(req);
      sendSuccessResponse(
        res,
        item,
        "Product highlight created successfully",
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
      if (!item) return sendNotFoundError(res, "Product highlight");

      await item.update(req.body);

      await invalidateCache(req, cacheKeys.productHighlightsItem(id));
      await invalidateRelated(req);

      sendSuccessResponse(res, item, "Product highlight updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async destroy(req, res) {
    await Promise.all(validateId.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const { id } = req.params;
      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Product highlight");

      // Paranoid delete keeps the row, so drop the category links explicitly.
      await item.setCategories([]);
      await item.destroy();

      await invalidateCache(req, cacheKeys.productHighlightsItem(id));
      await invalidateRelated(req);

      sendSuccessResponse(
        res,
        { id: id },
        "Product highlight deleted successfully",
      );
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = ProductHighlightController;
