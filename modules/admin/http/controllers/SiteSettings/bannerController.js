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
} = require("../../request/siteSettings/bannerRequest");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

const dataModel = models.Banners;
const fileFields = ["desktop_media_path", "mobile_media_path"];

class BannerController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.bannersList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Banners list retrieved successfully from cache",
        );
      }

      const result = await paginate(dataModel, req, {
        order: [["id", "ASC"]],
        // page title
        searchFields: ["title", "sub_title", "page.page"],
        include: [{ model: models.Page, as: "page", attributes: ["page"] }],
      });

      await setCache(req, listCacheKey, result);
      sendSuccessResponse(res, result, "Banners list retrieved successfully");
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
      const itemCacheKey = cacheKeys.bannersItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached)
        return sendSuccessResponse(
          res,
          cached,
          "Banner item retrieved successfully",
        );

      const item = await dataModel.findByPk(id, {
        include: [{ model: models.Page, as: "page" }],
      });
      if (!item) return sendNotFoundError(res, "Banner item");

      await setCache(req, itemCacheKey, item);
      sendSuccessResponse(res, item, "Banner item retrieved successfully");
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
        where: { page_id: req.body.page_id },
        include: [{ model: models.Page, as: "page" }],
        attrubutes: ["page_id"],
      });
      if (isItemExist)
        return sendErrorResponse(
          res,
          `${isItemExist?.page?.page} banner already exist`,
        );

      handleFileUploadStore(req, fileFields);

      const item = await dataModel.create(req.body);

      await invalidateCache(req, cacheKeys.bannersListPattern());

      sendSuccessResponse(res, item, "Banner item created successfully", 201);
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
      if (!item) return sendNotFoundError(res, "Banner item");

      // IT SHOULD except currwnt edit id

      const isItemExist = await dataModel.findOne({
        where: {
          page_id: req.body.page_id,
          id: {
            [Op.ne]: req.params.id,
          },
        },
        include: [
          {
            model: models.Page,
            as: "page",
            attributes: ["page"],
          },
        ],
        attributes: ["id", "page_id"],
      });

      if (isItemExist)
        return sendErrorResponse(
          res,
          `${isItemExist?.page?.page} banner already exist`,
        );

      await handleFileUploadUpdate(req, item, fileFields);
      await item.update(req.body);

      await invalidateCache(req, cacheKeys.bannersItem(id));
      await invalidateCache(req, cacheKeys.bannersListPattern());

      sendSuccessResponse(res, item, "Banner item updated successfully");
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
      if (!item) return sendNotFoundError(res, "Banner item");

      if (item.desktop_media_path) await deleteOldFile(item.desktop_media_path);
      if (item.mobile_media_path) await deleteOldFile(item.mobile_media_path);

      await item.destroy();

      await invalidateCache(req, cacheKeys.bannersItem(id));
      await invalidateCache(req, cacheKeys.bannersListPattern());

      sendSuccessResponse(res, { id: id }, "Banner item deleted successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = BannerController;
