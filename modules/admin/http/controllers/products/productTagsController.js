const { sequelize, models } = require("../../../../../database/models");
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
} = require("../../request/products/productTagsRequest");
const { validationResult } = require("express-validator");

const dataModel = models.ProductTags;

const invalidateAll = async (req, id) => {
  if (id) await invalidateCache(req, cacheKeys.productTagsItem(id));
  await invalidateCache(req, cacheKeys.productTagsListPattern());
};

class ProductTagController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.productTagsList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Product tag list retrieved successfully from cache",
        );
      }

      const result = await paginate(dataModel, req, {
        where: {},
        order: [["sort_order", "ASC"]],
        searchFields: ["title", "title_ar"],
      });

      await setCache(req, listCacheKey, result);
      sendSuccessResponse(
        res,
        result,
        "Product tag list retrieved successfully",
      );
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  // Flat list for product form selects
  static async getActive(req, res) {
    try {
      const result = await dataModel.findAll({
        where: { is_active: true },
        order: [["sort_order", "ASC"]],
        attributes: ["id", "title", "title_ar", "is_global"],
      });
      sendSuccessResponse(
        res,
        result,
        "Product tag list retrieved successfully",
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
      const itemCacheKey = cacheKeys.productTagsItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Product tag retrieved successfully",
        );
      }

      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Product tag");

      await setCache(req, itemCacheKey, item);
      sendSuccessResponse(res, item, "Product tag retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    await Promise.all(validationRequestPost.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const item = await dataModel.create(req.body);
      await invalidateAll(req);
      sendSuccessResponse(res, item, "Product tag created successfully", 201);
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
      if (!item) return sendNotFoundError(res, "Product tag");

      await item.update(req.body);

      await invalidateAll(req, id);
      const updated = await dataModel.findByPk(id);
      sendSuccessResponse(res, updated, "Product tag updated successfully");
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
        return sendNotFoundError(res, "Product tag");
      }

      // Paranoid delete keeps the row, so drop the product links explicitly.
      await item.setProducts([], { transaction: t });
      await item.destroy({ transaction: t });
      await t.commit();

      await invalidateAll(req, id);
      sendSuccessResponse(res, { id }, "Product tag deleted successfully");
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = ProductTagController;
