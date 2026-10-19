const { ApiResponse } = require("../../traits/response");
const { HTTP_STATUS, RESPONSE_MESSAGES } = require("../../traits/constants");
const { ErrorHandler } = require("../../traits/errorHandler");
const { validationResult } = require("express-validator");
const { validationRequestPost } = require("./sampleRequestRequest");
const { getLang, message } = require("./sampleRequestMessages");
const service = require("./SampleRequestService");

class SampleRequestController {
  /*
   * @route   GET /api/frontend/sample-request/options
   * @desc    Categories and products for the "Get a sample" dropdowns
   * @access  Public
   */
  static async options(req, res) {
    try {
      const data = await service.options();
      return ApiResponse.success(res, {
        message: RESPONSE_MESSAGES.SUCCESS.DATA_RETRIEVED,
        data,
        status: HTTP_STATUS.OK,
      });
    } catch (error) {
      return ErrorHandler.handleControllerError(error, res, "SampleRequestController.options");
    }
  }

  /*
   * @route   POST /api/frontend/sample-request?lang=en|ar
   * @desc    Save a sample request (name, phone, email, company_name?, category, product)
   * @access  Public
   */
  static async create(req, res) {
    const lang = getLang(req);

    try {
      await Promise.all(validationRequestPost.map((validation) => validation.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // one message per field (the first failing rule), localized
        const fields = new Map();
        for (const err of errors.array()) {
          if (!fields.has(err.path)) fields.set(err.path, err.msg);
        }
        return ApiResponse.error(res, {
          message: message(lang, "validationFailed"),
          status: HTTP_STATUS.BAD_REQUEST ?? 400,
          error_code: "VALIDATION_ERROR",
          errors: [...fields].map(([field, msg]) => ({ field, message: msg })),
        });
      }

      const item = await service.create(req.body, lang);
      return ApiResponse.success(res, {
        message: message(lang, "created"),
        data: item,
        status: HTTP_STATUS.CREATED,
      });
    } catch (error) {
      if (error.fieldErrors) {
        return ApiResponse.error(res, {
          message: message(lang, "validationFailed"),
          status: 400,
          error_code: "VALIDATION_ERROR",
          errors: error.fieldErrors,
        });
      }
      return ErrorHandler.handleControllerError(error, res, "SampleRequestController");
    }
  }
}

module.exports = SampleRequestController;
