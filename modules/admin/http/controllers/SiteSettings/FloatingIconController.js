const { models } = require("../../../../../database/models");
const {
  handleFileUploadUpdate,
  deleteOldFile,
  handleFileUploadStore,
} = require("../../middleware/multerMiddleware");
const {
  sendSuccessResponse,
  sendErrorResponse,
  sendNotFoundError,
  sendValidationError,
} = require("../../traits/responseHandler");
const { paginate } = require("../../traits/datatablePaginationHelper");
const { getCache, setCache, invalidateCache, cacheKeys } = require("../../traits/cacheHelper");
const {
  validationRequestPost,
  validateId,
} = require("../../request/siteSettings/floatingIconRequest");
const { validationResult } = require("express-validator");

const dataModel = models.FloatingIcon;
const fileFields = ["media_path"];

// Public API responses are cached per language under this pattern
const FRONTEND_CACHE_PATTERN = "frontend:cache:floating-icon:*";

class FloatingIconController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.floatingIconList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Floating icons list retrieved successfully from cache",
        );
      }

      const result = await paginate(dataModel, req, {
        order: [
          ["sort_order", "ASC"],
          ["id", "ASC"],
        ],
        searchFields: ["link", "media_alt"],
      });

      await setCache(req, listCacheKey, result);

      sendSuccessResponse(
        res,
        result,
        "Floating icons list retrieved successfully",
      );
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

      const itemCacheKey = cacheKeys.floatingIconItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Floating icon retrieved successfully",
        );
      }

      const item = await dataModel.findByPk(id);
      if (!item) {
        return sendNotFoundError(res, "Floating icon");
      }

      await setCache(req, itemCacheKey, item);

      sendSuccessResponse(res, item, "Floating icon retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    try {
      await Promise.all(validationRequestPost.map((v) => v.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationError(res, errors);

      handleFileUploadStore(req, fileFields);

      const item = await dataModel.create(req.body);

      await invalidateCache(req, cacheKeys.floatingIconListPattern());
      await invalidateCache(req, FRONTEND_CACHE_PATTERN);

      sendSuccessResponse(res, item, "Floating icon created successfully", 201);
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    await Promise.all(
      [...validateId, ...validationRequestPost].map((v) => v.run(req)),
    );
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    try {
      const { id } = req.params;

      const item = await dataModel.findByPk(id);
      if (!item) {
        return sendNotFoundError(res, "Floating icon");
      }

      await handleFileUploadUpdate(req, item, fileFields);

      await item.update(req.body);

      await invalidateCache(req, cacheKeys.floatingIconItem(id));
      await invalidateCache(req, cacheKeys.floatingIconListPattern());
      await invalidateCache(req, FRONTEND_CACHE_PATTERN);

      sendSuccessResponse(res, item, "Floating icon updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async destroy(req, res) {
    await Promise.all(validateId.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }
    try {
      const { id } = req.params;

      const item = await dataModel.findByPk(id);
      if (!item) {
        return sendNotFoundError(res, "Floating icon");
      }

      if (item.media_path) {
        await deleteOldFile(item.media_path);
      }

      await item.destroy();

      await invalidateCache(req, cacheKeys.floatingIconItem(id));
      await invalidateCache(req, cacheKeys.floatingIconListPattern());
      await invalidateCache(req, FRONTEND_CACHE_PATTERN);

      sendSuccessResponse(res, { id }, "Floating icon deleted successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = FloatingIconController;
