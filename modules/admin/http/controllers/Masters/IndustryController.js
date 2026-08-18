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
} = require("../../request/masters/industryRequest");
const { validationResult } = require("express-validator");

const dataModel = models.Industry;

class IndustryController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.industryList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Industry list retrieved successfully from cache",
        );
      }

      const result = await paginate(dataModel, req, {
        order: [["sort_order", "ASC"]],
        searchFields: ["title", "slug"],
      });

      await setCache(req, listCacheKey, result);
      sendSuccessResponse(res, result, "Industry list retrieved successfully");
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
      const itemCacheKey = cacheKeys.industryItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached)
        return sendSuccessResponse(
          res,
          cached,
          "Industry item retrieved successfully",
        );

      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Industry item");

      await setCache(req, itemCacheKey, item);
      sendSuccessResponse(res, item, "Industry item retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    try {
      await Promise.all(validationRequestPost.map((v) => v.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationError(res, errors);

      const { slug } = req.body;

      const isItemExist = await dataModel.findOne({
        where: { slug: slug },
        attrubutes: ["slug"],
      });
      if (isItemExist)
        return sendErrorResponse(res, `${req.body.title} already exist`);

      const item = await dataModel.create(req.body);

      await invalidateCache(req, cacheKeys.industryListPattern());
      sendSuccessResponse(res, item, "Industry item created successfully", 201);
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
      if (!item) return sendNotFoundError(res, "Industry item");

      if (item.slug !== req.body.slug) {
        const isItemExist = await dataModel.findOne({
          where: { slug: req.body.slug },
          attrubutes: ["slug"],
        });
        if (isItemExist)
          return sendErrorResponse(res, `${req.body.title} already exist`);
      }

      await item.update(req.body);

      await invalidateCache(req, cacheKeys.industryItem(id));
      await invalidateCache(req, cacheKeys.industryListPattern());

      sendSuccessResponse(res, item, "Industry item updated successfully");
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
      if (!item) return sendNotFoundError(res, "Industry item");

      await item.destroy();

      await invalidateCache(req, cacheKeys.industryItem(id));
      await invalidateCache(req, cacheKeys.industryListPattern());

      sendSuccessResponse(
        res,
        { id: id },
        "Industry item deleted successfully",
      );
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = IndustryController;
