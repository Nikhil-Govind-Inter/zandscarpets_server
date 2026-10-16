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
      const result = await paginate(dataModel, req, {
        order: [["sort_order", "ASC"]],
        searchFields: ["title", "description"],
      });
      sendSuccessResponse(res, result, "Connections retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getById(req, res) {
    await idValidationCheck(req, res, validateId);
    try {
      const { id } = req.params;

      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Connection");

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
      sendSuccessResponse(res, { id: id }, "Connection deleted successfully");
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = ConnectionsController;
