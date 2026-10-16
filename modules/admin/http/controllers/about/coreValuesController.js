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
  validationRequestPost,
  validateId,
} = require("../../request/about/coreValuesRequest");
const {
  updateValidationCheck,
  createValidationCheck,
  idValidationCheck,
} = require("../../traits/validationHelper");

const dataModel = models.CoreValues;
const fileFields = ["media_path"];

class CoreValuesController {
  static async list(req, res) {
    try {
      const result = await paginate(dataModel, req, {
        order: [["sort_order", "ASC"]],
        searchFields: ["title", "title_ar", "media_alt"],
      });
      sendSuccessResponse(res, result, "Core values retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getById(req, res) {
    await idValidationCheck(req, res, validateId);
    try {
      const { id } = req.params;

      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Core value");

      sendSuccessResponse(res, item, "Core value retrieved successfully");
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
      sendSuccessResponse(res, item, "Core value created successfully", 201);
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
        return sendNotFoundError(res, "Core value");
      }
      await handleFileUploadUpdate(req, item, fileFields);
      await item.update(req.body, { transaction: t });
      await t.commit();
      sendSuccessResponse(res, item, "Core value updated successfully");
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
        return sendNotFoundError(res, "Core value");
      }
      await item.destroy({ transaction: t });
      await t.commit();
      if (item.media_path) await deleteOldFile(item.media_path);
      sendSuccessResponse(res, { id: id }, "Core value deleted successfully");
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = CoreValuesController;
