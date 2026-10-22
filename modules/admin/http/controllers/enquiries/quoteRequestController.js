const { sequelize, models } = require("../../../../../database/models");
const {
  sendSuccessResponse,
  sendErrorResponse,
  sendNotFoundError,
  sendValidationError,
} = require("../../traits/responseHandler");
const { paginate } = require("../../traits/datatablePaginationHelper");

const dataModel = models.QuoteRequest;
const STATUS_VALUES = ["new", "contacted", "followed_up"];

const parseId = (req) => {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
};

class QuoteRequestController {
  static async list(req, res) {
    try {
      const status = req.query.status;

      const result = await paginate(dataModel, req, {
        order: [["createdAt", "DESC"]],
        searchFields: ["name", "email", "phone", "reference_code", "company_name"],
        ...(STATUS_VALUES.includes(status) ? { where: { status } } : {}),
        // `separate: true` so this hasMany include doesn't break limit/offset
        // pagination on the parent (no cartesian join) — only `id` is needed
        // here since the list view just shows the item count.
        include: [{ model: models.QuoteRequestItem, as: "items", attributes: ["id"], separate: true }],
      });
      sendSuccessResponse(res, result, "Quote requests retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getById(req, res) {
    const id = parseId(req);
    if (!id) return sendNotFoundError(res, "Quote request");
    try {
      const item = await dataModel.findByPk(id, {
        include: [{ model: models.QuoteRequestItem, as: "items" }],
      });
      if (!item) return sendNotFoundError(res, "Quote request");
      sendSuccessResponse(res, item, "Quote request retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async updateStatus(req, res) {
    const id = parseId(req);
    if (!id) return sendNotFoundError(res, "Quote request");

    const { status } = req.body;
    if (!STATUS_VALUES.includes(status)) {
      return sendValidationError(res, [
        { field: "status", message: `status must be one of: ${STATUS_VALUES.join(", ")}` },
      ]);
    }

    try {
      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Quote request");
      await item.update({ status });
      sendSuccessResponse(res, item, "Quote request status updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async destroy(req, res) {
    const id = parseId(req);
    if (!id) return sendNotFoundError(res, "Quote request");
    const t = await sequelize.transaction();
    try {
      const item = await dataModel.findByPk(id);
      if (!item) {
        await t.rollback();
        return sendNotFoundError(res, "Quote request");
      }
      await models.QuoteRequestItem.destroy({
        where: { quote_request_id: id },
        transaction: t,
      });
      await item.destroy({ transaction: t });
      await t.commit();
      sendSuccessResponse(res, { id }, "Quote request deleted successfully");
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = QuoteRequestController;
