const { sequelize, models } = require("../../../../../database/models");
const { deleteOldFile } = require("../../middleware/multerMiddleware");
const { sendSuccessResponse, sendErrorResponse, sendNotFoundError } = require("../../traits/responseHandler");
const { paginate } = require("../../traits/datatablePaginationHelper");
const { validateId } = require("../../request/enquiries/contactEnquiryRequest");
const { idValidationCheck } = require("../../traits/validationHelper");

const dataModel = models.ContactEnquiry;

class ContactEnquiryController {
  static async list(req, res) {
    try {
      const result = await paginate(dataModel, req, {
        order: [["createdAt", "DESC"]],
        searchFields: ["name", "email", "phone", "requirements"],
      });
      sendSuccessResponse(res, result, "Contact enquiries retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getById(req, res) {
    await idValidationCheck(req, res, validateId);
    try {
      const { id } = req.params;
      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Contact enquiry");

      sendSuccessResponse(res, item, "Contact enquiry retrieved successfully");
    } catch (error) {
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
        return sendNotFoundError(res, "Contact enquiry");
      }
      await item.destroy({ transaction: t });
      await t.commit();
      if (item.file) await deleteOldFile(item.file);
      sendSuccessResponse(res, { id }, "Contact enquiry deleted successfully");
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = ContactEnquiryController;
