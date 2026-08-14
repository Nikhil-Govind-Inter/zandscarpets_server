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
} = require("../../request/siteSettings/socialMediaRequest");
const { validationResult } = require("express-validator");

const dataModel = models.SocialMedia;
const fileFields = ["media_path"];

class SocialMediaController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.socialMediaList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Social media list retrieved successfully from cache",
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
        "Social media list retrieved successfully",
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

      const itemCacheKey = cacheKeys.socialMediaItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Social media item retrieved successfully",
        );
      }

      const item = await dataModel.findByPk(id);
      if (!item) {
        return sendNotFoundError(res, "Social media item");
      }

      await setCache(req, itemCacheKey, item);

      sendSuccessResponse(
        res,
        item,
        "Social media item retrieved successfully",
      );
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

      await invalidateCache(req, cacheKeys.socialMediaListPattern());

      sendSuccessResponse(
        res,
        item,
        "Social media item created successfully",
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
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    try {
      const { id } = req.params;

      const item = await dataModel.findByPk(id);
      if (!item) {
        return sendNotFoundError(res, "Social media item");
      }

      await handleFileUploadUpdate(req, item, fileFields);

      await item.update(req.body);

      await invalidateCache(req, cacheKeys.socialMediaItem(id));
      await invalidateCache(req, cacheKeys.socialMediaListPattern());

      sendSuccessResponse(res, item, "Social media item updated successfully");
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
        return sendNotFoundError(res, "Social media item");
      }

      if (item.media_path) {
        await deleteOldFile(item.media_path);
      }

      await item.destroy();

      await invalidateCache(req, cacheKeys.socialMediaItem(id));
      await invalidateCache(req, cacheKeys.socialMediaListPattern());

      sendSuccessResponse(res, null, "Social media item deleted successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = SocialMediaController;
