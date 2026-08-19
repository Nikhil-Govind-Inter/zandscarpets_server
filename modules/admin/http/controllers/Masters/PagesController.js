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
} = require("../../request/masters/pagesRequest");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

const dataModel = models.Page;

class PagesController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.pagesList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Pages list retrieved successfully from cache",
        );
      }

      const result = await paginate(dataModel, req, {
        order: [["page", "ASC"]],
        searchFields: ["page", "page_slug"],
      });

      await setCache(req, listCacheKey, result);
      sendSuccessResponse(res, result, "Pages list retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getActivePages(req, res) {
    try {
      const cacheKey = cacheKeys.activePages();
      const cached = await getCache(req, cacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Pages list retrieved successfully from cache",
        );
      }

      const result = await dataModel.findAll({
        where: {
          is_active: true,
        },
        order: [["page", "ASC"]],
      });

      await setCache(req, cacheKey, result);
      sendSuccessResponse(res, result, "Pages list retrieved successfully");
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
      const itemCacheKey = cacheKeys.pagesItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached)
        return sendSuccessResponse(
          res,
          cached,
          "Page item retrieved successfully",
        );

      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Page item");

      await setCache(req, itemCacheKey, item);
      sendSuccessResponse(res, item, "Page item retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    try {
      await Promise.all(validationRequestPost.map((v) => v.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationError(res, errors);

      const isItemExist = await dataModel.findOne({
        where: { page_slug: req.body.page_slug, deleted_at: null },
        attrubutes: ["page_slug"],
      });
      if (isItemExist)
        return sendErrorResponse(res, `${req.body.page} already exist`);

      const item = await dataModel.create(req.body);

      await invalidateCache(req, cacheKeys.pagesListPattern());
      sendSuccessResponse(res, item, "Page item created successfully", 201);
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
      if (!item) return sendNotFoundError(res, "Page item");

      // except current id

      const isItemExist = await dataModel.findOne({
        where: {
          page_slug: req.body.page_slug,
          id: {
            [Op.ne]: id,
          },
        },
        attrubutes: ["page_slug"],
      });

      if (isItemExist)
        return sendErrorResponse(res, `${req.body.page} already exist`);

      await item.update(req.body);

      await invalidateCache(req, cacheKeys.pagesItem(id));
      await invalidateCache(req, cacheKeys.pagesListPattern());
      await invalidateCache(req, cacheKeys.bannersListPattern());
      await invalidateCache(req, cacheKeys.metaDataListPattern());

      sendSuccessResponse(res, item, "Page item updated successfully");
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
      if (!item) return sendNotFoundError(res, "Page item");

      await item.destroy();

      await invalidateCache(req, cacheKeys.pagesItem(id));
      await invalidateCache(req, cacheKeys.pagesListPattern());
      await invalidateCache(req, cacheKeys.bannersListPattern());

      sendSuccessResponse(res, { id: id }, "Page item deleted successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = PagesController;
