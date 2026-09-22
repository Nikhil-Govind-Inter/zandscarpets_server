const { ApiResponse } = require("../../traits/response");
const { HTTP_STATUS, RESPONSE_MESSAGES } = require("../../traits/constants");
const { ErrorHandler } = require("../../traits/errorHandler");
const { createValidationCheck } = require("../../traits/validationHelper");
const { validationRequestPost } = require("./contactEnquiryRequest");
const service = require("./ContactEnquiryService");

class ContactEnquiryController {
  static async create(req, res) {
    try {
      const responded = await createValidationCheck(req, res, validationRequestPost);
      if (responded) return;

      const item = await service.create(req.body, req.file);
      return ApiResponse.success(res, {
        message: RESPONSE_MESSAGES.SUCCESS.DATA_CREATED,
        data: item,
        status: HTTP_STATUS.CREATED,
      });
    } catch (error) {
      return ErrorHandler.handleControllerError(error, res, "ContactEnquiryController");
    }
  }
}

module.exports = ContactEnquiryController;
