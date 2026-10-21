const { sequelize, models } = require("../../../../../database/models");
const { sendSuccessResponse, sendErrorResponse, sendNotFoundError } = require("../../traits/responseHandler");
const { paginate } = require("../../traits/datatablePaginationHelper");

const dataModel = models.DownloadRequest;

const parseId = (req) => {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
};

class DownloadRequestController {
  static async list(req, res) {
    try {
      const result = await paginate(dataModel, req, {
        order: [["createdAt", "DESC"]],
        searchFields: ["name", "email", "phone", "company_name", "download_title"],
      });
      sendSuccessResponse(res, result, "Download requests retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getById(req, res) {
    const id = parseId(req);
    if (!id) return sendNotFoundError(res, "Download request");
    try {
      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Download request");
      sendSuccessResponse(res, item, "Download request retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async destroy(req, res) {
    const id = parseId(req);
    if (!id) return sendNotFoundError(res, "Download request");
    const t = await sequelize.transaction();
    try {
      const item = await dataModel.findByPk(id);
      if (!item) {
        await t.rollback();
        return sendNotFoundError(res, "Download request");
      }
      await item.destroy({ transaction: t });
      await t.commit();
      sendSuccessResponse(res, { id }, "Download request deleted successfully");
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = DownloadRequestController;
