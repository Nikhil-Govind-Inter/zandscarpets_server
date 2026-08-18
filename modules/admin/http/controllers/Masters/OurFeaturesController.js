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
} = require("../../request/masters/ourFeaturesRequest");
const { validationResult } = require("express-validator");

const dataModel = models.OurFeatures;

class OurFeaturesController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.ourFeaturesList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Our Features list retrieved successfully from cache",
        );
      }

      const result = await paginate(dataModel, req, {
        order: [["sort_order", "ASC"]],
        searchFields: ["title"],
      });

      await setCache(req, listCacheKey, result);
      sendSuccessResponse(res, result, "Our Features list retrieved successfully");
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
      const itemCacheKey = cacheKeys.ourFeaturesItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached)
        return sendSuccessResponse(
          res,
          cached,
          "Our Feature item retrieved successfully",
        );

      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Our Feature item");

      await setCache(req, itemCacheKey, item);
      sendSuccessResponse(res, item, "Our Feature item retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    try {
      await Promise.all(validationRequestPost.map((v) => v.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationError(res, errors);

      const item = await dataModel.create(req.body);

      await invalidateCache(req, cacheKeys.ourFeaturesListPattern());
      sendSuccessResponse(res, item, "Our Feature item created successfully", 201);
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
      if (!item) return sendNotFoundError(res, "Our Feature item");

      await item.update(req.body);

      await invalidateCache(req, cacheKeys.ourFeaturesItem(id));
      await invalidateCache(req, cacheKeys.ourFeaturesListPattern());

      sendSuccessResponse(res, item, "Our Feature item updated successfully");
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
      if (!item) return sendNotFoundError(res, "Our Feature item");

      await item.destroy();

      await invalidateCache(req, cacheKeys.ourFeaturesItem(id));
      await invalidateCache(req, cacheKeys.ourFeaturesListPattern());

      sendSuccessResponse(res, { id: id }, "Our Feature item deleted successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = OurFeaturesController;
