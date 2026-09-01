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
  validationRequestPost,
  validateId,
} = require("../../request/contact/connectionsRequest");
const {
  updateValidationCheck,
  createValidationCheck,
  idValidationCheck,
} = require("../../traits/validationHelper");

const dataModel = models.Connections;
const fileFields = ["icon_media_path"];

class ConnectionsController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.connectionsList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(res, cached, "Connections retrieved successfully from cache");
      }
      const result = await paginate(dataModel, req, {
        order: [["createdAt", "DESC"]],
        searchFields: ["title", "description"],
      });
      await setCache(req, listCacheKey, result);
      sendSuccessResponse(res, result, "Connections retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getById(req, res) {
    await idValidationCheck(req, res, validateId);
    try {
      const { id } = req.params;
      const itemCacheKey = cacheKeys.connectionsItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached) return sendSuccessResponse(res, cached, "Connection retrieved successfully");

      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Connection");

      await setCache(req, itemCacheKey, item);
      sendSuccessResponse(res, item, "Connection retrieved successfully");
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
      await invalidateCache(req, cacheKeys.connectionsListPattern());
      sendSuccessResponse(res, item, "Connection created successfully", 201);
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
        return sendNotFoundError(res, "Connection");
      }
      await handleFileUploadUpdate(req, item, fileFields);
      await item.update(req.body, { transaction: t });
      await t.commit();
      await invalidateCache(req, cacheKeys.connectionsItem(id));
      await invalidateCache(req, cacheKeys.connectionsListPattern());
      sendSuccessResponse(res, item, "Connection updated successfully");
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
        return sendNotFoundError(res, "Connection");
      }
      await item.destroy({ transaction: t });
      await t.commit();
      if (item.icon_media_path) await deleteOldFile(item.icon_media_path);
      await invalidateCache(req, cacheKeys.connectionsItem(id));
      await invalidateCache(req, cacheKeys.connectionsListPattern());
      sendSuccessResponse(res, { id: id }, "Connection deleted successfully");
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = ConnectionsController;
