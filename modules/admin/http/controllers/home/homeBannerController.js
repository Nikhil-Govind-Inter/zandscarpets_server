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
} = require("../../request/home/homeBannerRequest");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

const dataModel = models.HomeBanner;
const fileFields = ["media_path"];

class HomeBannerController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.homeBannerList(req);
      const cached = await getCache(req, listCacheKey);
      // if (cached) {
      //   return sendSuccessResponse(
      //     res,
      //     cached,
      //     "Home banner retrieved successfully from cache",
      //   );
      // }

      const result = await paginate(dataModel, req, {
        order: [["sort_order", "ASC"]],
        searchFields: ["title","industry.title"],
        include: [{ model: models.Industry, as: "industry", attributes: ["title"] }],
      });

      await setCache(req, listCacheKey, result);
      sendSuccessResponse(res, result, "Home banner retrieved successfully");
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
      const itemCacheKey = cacheKeys.homeBannerItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached)
        return sendSuccessResponse(
          res,
          cached,
          "Home banner retrieved successfully",
        );

      const item = await dataModel.findByPk(id, {
        include: [{ model: models.Industry, as: "industry" }],
      });
      if (!item) return sendNotFoundError(res, "Home banner");

      await setCache(req, itemCacheKey, item);
      sendSuccessResponse(res, item, "Home banner retrieved successfully");
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
        where: {
          industry_id: req.body.industry_id,
        },
        attrubutes: ["page_slug"],
      });

      if (isItemExist)
        return sendErrorResponse(res, `${req.body.page} already exist`);

      handleFileUploadStore(req, fileFields);
      const item = await dataModel.create(req.body);

      await invalidateCache(req, cacheKeys.homeBannerListPattern());
      sendSuccessResponse(res, item, "Home banner created successfully", 201);
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
      if (!item) return sendNotFoundError(res, "Home banner");


      const isItemExist = await dataModel.findOne({
        where: {
          industry_id: req.body.industry_id,
          id: {
            [Op.ne]: id,
          },
        },
        attrubutes: ["page_slug"],
      });

      if (isItemExist)
        return sendErrorResponse(res, `${req.body.page} already exist`);

      await handleFileUploadUpdate(req, item, fileFields);
      await item.update(req.body);

      await invalidateCache(req, cacheKeys.homeBannerItem(id));
      await invalidateCache(req, cacheKeys.homeBannerListPattern());

      sendSuccessResponse(res, item, "Home banner updated successfully");
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
      if (!item) return sendNotFoundError(res, "Home banner");

      if (item.media_path) await deleteOldFile(item.media_path);

      await item.destroy();

      await invalidateCache(req, cacheKeys.homeBannerItem(id));
      await invalidateCache(req, cacheKeys.homeBannerListPattern());

      sendSuccessResponse(res, { id: id }, "Home banner deleted successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = HomeBannerController;
