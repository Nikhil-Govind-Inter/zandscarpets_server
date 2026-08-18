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
const {
  getCache,
  setCache,
  invalidateCache,
  cacheKeys,
} = require("../../traits/cacheHelper");
const {
  validationRequestPost,
  validateId,
} = require("../../request/siteSettings/metaDataRequest");
const { validationResult } = require("express-validator");

const dataModel = models.MetaData;

class MetaDataController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.metaDataList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Meta data list retrieved successfully from cache",
        );
      }

      const result = await paginate(dataModel, req, {
        include: [
          { model: models.Page, as: "page", attributes: ["page"] },
        ],
        order: [[{ model: models.Page, as: "page" }, "page", "ASC"]],
        searchFields: ["page.page", "meta_title"],
      });

      await setCache(req, listCacheKey, result);

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

      const itemCacheKey = cacheKeys.metaDataItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Meta data item retrieved successfully",
        );
      }

      const item = await dataModel.findByPk(id, {
        include: [
          { model: models.Page, as: "page", attributes: ["id", "page", "page_slug"] },
        ],
      });
      if (!item) {
        return sendNotFoundError(res, "Meta data item");
      }

      await setCache(req, itemCacheKey, item);

      sendSuccessResponse(res, item, "Meta data item retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  // static async create(req, res) {
  //   try {
  //     await Promise.all(validationRequestPost.map((v) => v.run(req)));
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) return sendValidationError(res, errors);

  //     const item = await dataModel.create(req.body);

  //     await invalidateCache(req, cacheKeys.metaDataListPattern());

  //     sendSuccessResponse(
  //       res,
  //       item,
  //       "Meta data item created successfully",
  //       201,
  //     );
  //   } catch (error) {
  //     return sendErrorResponse(res, error);
  //   }
  // }

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
        return sendNotFoundError(res, "Meta data item");
      }

      await item.update(req.body);

      await invalidateCache(req, cacheKeys.metaDataItem(id));
      await invalidateCache(req, cacheKeys.metaDataListPattern());

      sendSuccessResponse(res, item, "Meta data item updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = MetaDataController;
