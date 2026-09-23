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
} = require("../../request/about/milestonesRequest");
const { validationResult } = require("express-validator");

const dataModel = models.Milestones;

class MilestonesController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.milestonesList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(res, cached, "Milestones list retrieved successfully from cache");
      }

      const result = await paginate(dataModel, req, {
        order: [["sort_order", "ASC"]],
        searchFields: ["label", "value"],
      });

      await setCache(req, listCacheKey, result);
      sendSuccessResponse(res, result, "Milestones list retrieved successfully");
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
      const itemCacheKey = cacheKeys.milestonesItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached)
        return sendSuccessResponse(res, cached, "Milestone item retrieved successfully");

      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Milestone item");

      await setCache(req, itemCacheKey, item);
      sendSuccessResponse(res, item, "Milestone item retrieved successfully");
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

      await invalidateCache(req, cacheKeys.milestonesListPattern());
      sendSuccessResponse(res, item, "Milestone item created successfully", 201);
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
      if (!item) return sendNotFoundError(res, "Milestone item");

      await item.update(req.body);

      await invalidateCache(req, cacheKeys.milestonesItem(id));
      await invalidateCache(req, cacheKeys.milestonesListPattern());

      sendSuccessResponse(res, item, "Milestone item updated successfully");
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
      if (!item) return sendNotFoundError(res, "Milestone item");

      await item.destroy();

      await invalidateCache(req, cacheKeys.milestonesItem(id));
      await invalidateCache(req, cacheKeys.milestonesListPattern());

      sendSuccessResponse(res, { id: id }, "Milestone item deleted successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = MilestonesController;
