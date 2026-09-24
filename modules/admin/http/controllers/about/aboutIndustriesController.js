const { sequelize, models } = require("../../../../../database/models");
const {
  handleFileUploadUpdate,
  deleteOldFile,
  handleFileUploadStore,
} = require("../../middleware/multerMiddleware");
const {
  sendSuccessResponse,
  sendErrorResponse,
  sendNotFoundError,
} = require("../../traits/responseHandler");
const { paginate } = require("../../traits/datatablePaginationHelper");
const {
  getCache,
  setCache,
  invalidateCache,
  cacheKeys,
} = require("../../traits/cacheHelper");
const {
  invalidateCache: invalidateFrontendCache,
  cacheKeys: frontendCacheKeys,
} = require("../../../../frontend/http/traits/cacheHelper");
const {
  validationRequestPost,
  validateId,
} = require("../../request/about/aboutIndustriesRequest");
const {
  updateValidationCheck,
  createValidationCheck,
  idValidationCheck,
} = require("../../traits/validationHelper");

const dataModel = models.AboutIndustries;
const fileFields = ["media_path"];

class AboutIndustriesController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.aboutIndustriesList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(res, cached, "Industries retrieved successfully from cache");
      }
      const result = await paginate(dataModel, req, {
        order: [["sort_order", "ASC"]],
        searchFields: ["title", "title_ar", "description", "media_alt"],
      });
      await setCache(req, listCacheKey, result);
      sendSuccessResponse(res, result, "Industries retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getById(req, res) {
    await idValidationCheck(req, res, validateId);
    try {
      const { id } = req.params;
      const itemCacheKey = cacheKeys.aboutIndustriesItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached) return sendSuccessResponse(res, cached, "Industry retrieved successfully");

      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Industry");

      await setCache(req, itemCacheKey, item);
      sendSuccessResponse(res, item, "Industry retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    await createValidationCheck(req, res, validationRequestPost);
    const t = await sequelize.transaction();
    try {
      handleFileUploadStore(req, fileFields);
      const item = await dataModel.create(req.body, { transaction: t });
      await t.commit();
      await invalidateCache(req, cacheKeys.aboutIndustriesListPattern());
      await invalidateFrontendCache(req, frontendCacheKeys.aboutPattern());
      sendSuccessResponse(res, item, "Industry created successfully", 201);
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    await updateValidationCheck(req, res, validationRequestPost, validateId);
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const item = await dataModel.findByPk(id);
      if (!item) {
        await t.rollback();
        return sendNotFoundError(res, "Industry");
      }
      await handleFileUploadUpdate(req, item, fileFields);
      await item.update(req.body, { transaction: t });
      await t.commit();
      await invalidateCache(req, cacheKeys.aboutIndustriesItem(id));
      await invalidateCache(req, cacheKeys.aboutIndustriesListPattern());
      await invalidateFrontendCache(req, frontendCacheKeys.aboutPattern());
      sendSuccessResponse(res, item, "Industry updated successfully");
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }

  static async destroy(req, res) {
    await idValidationCheck(req, res, validateId);
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const item = await dataModel.findByPk(id);
      if (!item) {
        await t.rollback();
        return sendNotFoundError(res, "Industry");
      }
      await item.destroy({ transaction: t });
      await t.commit();
      if (item.media_path) await deleteOldFile(item.media_path);
      await invalidateCache(req, cacheKeys.aboutIndustriesItem(id));
      await invalidateCache(req, cacheKeys.aboutIndustriesListPattern());
      await invalidateFrontendCache(req, frontendCacheKeys.aboutPattern());
      sendSuccessResponse(res, { id: id }, "Industry deleted successfully");
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = AboutIndustriesController;
