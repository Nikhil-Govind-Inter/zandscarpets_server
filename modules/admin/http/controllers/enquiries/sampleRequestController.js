const { sequelize, models } = require("../../../../../database/models");
const { sendSuccessResponse, sendErrorResponse, sendNotFoundError } = require("../../traits/responseHandler");
const { paginate } = require("../../traits/datatablePaginationHelper");

const dataModel = models.SampleRequest;

const parseId = (req) => {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
};

class SampleRequestController {
  static async list(req, res) {
    try {
      const result = await paginate(dataModel, req, {
        order: [["createdAt", "DESC"]],
        searchFields: ["name", "email", "phone", "company_name", "category_title", "product_title"],
      });
      sendSuccessResponse(res, result, "Sample requests retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getById(req, res) {
    const id = parseId(req);
    if (!id) return sendNotFoundError(res, "Sample request");
    try {
      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Sample request");
      sendSuccessResponse(res, item, "Sample request retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async destroy(req, res) {
    const id = parseId(req);
    if (!id) return sendNotFoundError(res, "Sample request");
    const t = await sequelize.transaction();
    try {
      const item = await dataModel.findByPk(id);
      if (!item) {
        await t.rollback();
        return sendNotFoundError(res, "Sample request");
      }
      await item.destroy({ transaction: t });
      await t.commit();
      sendSuccessResponse(res, { id }, "Sample request deleted successfully");
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = SampleRequestController;
