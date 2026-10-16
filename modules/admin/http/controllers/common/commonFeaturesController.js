const { sequelize, models } = require("../../../../../database/models");
const {
  sendSuccessResponse,
  sendErrorResponse,
  sendNotFoundError,
} = require("../../traits/responseHandler");
const { paginate } = require("../../traits/datatablePaginationHelper");
const {
  validationRequestPost,
  validateId,
} = require("../../request/common/commonFeaturesRequest");
const {
  updateValidationCheck,
  createValidationCheck,
  idValidationCheck,
} = require("../../traits/validationHelper");

const dataModel = models.CommonFeatures;

class CommonFeaturesController {
  static async list(req, res) {
    try {
      const result = await paginate(dataModel, req, {
        order: [["sort_order", "ASC"]],
        searchFields: ["title", "description"],
      });

      sendSuccessResponse(res, result, "Common feature retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getById(req, res) {
    await idValidationCheck(req, res, validateId);
    try {
      const { id } = req.params;

      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Common feature");

      sendSuccessResponse(res, item, "Common feature retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    await createValidationCheck(req, res, validationRequestPost);
    const t = await sequelize.transaction();
    try {
      const item = await dataModel.create(req.body, { transaction: t });

      await t.commit();

      sendSuccessResponse(
        res,
        item,
        "Common feature created successfully",
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
        return sendNotFoundError(res, "Common feature");
      }

      await item.update(req.body, { transaction: t });

      await t.commit();

      sendSuccessResponse(res, item, "Common feature updated successfully");
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
        return sendNotFoundError(res, "Common feature");
      }

      await item.destroy({ transaction: t });

      await t.commit();

      sendSuccessResponse(
        res,
        { id: id },
        "Common feature deleted successfully",
      );
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = CommonFeaturesController;
