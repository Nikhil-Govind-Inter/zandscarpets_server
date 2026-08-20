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
} = require("../../request/home/homeMilestonesRequest");
const {
  updateValidationCheck,
  createValidationCheck,
  idValidationCheck,
} = require("../../traits/validationHelper");

const dataModel = models.HomeMilestones;
const fileFields = ["media_path"];

class HomeMilestonesController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.homeMilestoneList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Home milestone retrieved successfully from cache",
        );
      }

      const result = await paginate(dataModel, req, {
        order: [["sort_order", "ASC"]],
        searchFields: ["label", "value"],
      });

      await setCache(req, listCacheKey, result);
      sendSuccessResponse(res, result, "Home milestone retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getById(req, res) {
    await idValidationCheck(req, res, validateId);
    try {
      const { id } = req.params;
      const itemCacheKey = cacheKeys.homeMilestoneItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached)
        return sendSuccessResponse(
          res,
          cached,
          "Home milestone retrieved successfully",
        );

      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Home milestone");

      await setCache(req, itemCacheKey, item);
      sendSuccessResponse(res, item, "Home milestone retrieved successfully");
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

      await invalidateCache(req, cacheKeys.homeMilestoneListPattern());
      sendSuccessResponse(
        res,
        item,
        "Home milestone created successfully",
        201,
      );
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
        return sendNotFoundError(res, "Home milestone");
      }

      await handleFileUploadUpdate(req, item, fileFields);

      await item.update(req.body, { transaction: t });

      await t.commit();

      await invalidateCache(req, cacheKeys.homeMilestoneItem(id));
      await invalidateCache(req, cacheKeys.homeMilestoneListPattern());

      sendSuccessResponse(res, item, "Home milestone updated successfully");
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
        return sendNotFoundError(res, "Home milestone");
      }

      await item.destroy({ transaction: t });

      await t.commit();

      if (item.media_path) await deleteOldFile(item.media_path);

      await invalidateCache(req, cacheKeys.homeMilestoneItem(id));
      await invalidateCache(req, cacheKeys.homeMilestoneListPattern());

      sendSuccessResponse(
        res,
        { id: id },
        "Home milestone deleted successfully",
      );
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = HomeMilestonesController;
