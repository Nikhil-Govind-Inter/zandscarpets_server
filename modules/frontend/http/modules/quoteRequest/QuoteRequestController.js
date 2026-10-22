const { ApiResponse } = require("../../traits/response");
const { HTTP_STATUS, RESPONSE_MESSAGES } = require("../../traits/constants");
const { ErrorHandler } = require("../../traits/errorHandler");
const { validationResult } = require("express-validator");
const { validationRequestPost } = require("./quoteRequestRequest");
const { getLang, message } = require("./quoteRequestMessages");
const service = require("./QuoteRequestService");

class QuoteRequestController {
  /*
   * @route   GET /api/frontend/quote-request/options
   * @desc    Categories and products for the /quotes/form fallback picker
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
      return ErrorHandler.handleControllerError(error, res, "QuoteRequestController.options");
    }
  }

  /*
   * @route   POST /api/frontend/quote-request?lang=en|ar
   * @desc    Save a quote request (name, email, phone, message?, recaptcha_token, items[])
   * @access  Public
   */
  static async create(req, res) {
    const lang = getLang(req);

    try {
      await Promise.all(validationRequestPost.map((validation) => validation.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const fields = new Map();
        for (const err of errors.array()) {
          if (!fields.has(err.path)) fields.set(err.path, err.msg);
        }
        return ApiResponse.error(res, {
          message: message(lang, "validationFailed"),
          status: HTTP_STATUS.BAD_REQUEST,
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
      if (error.errorCode === "RECAPTCHA_FAILED") {
        return ApiResponse.error(res, {
          message: message(lang, "recaptchaFailed"),
          status: error.statusCode,
          error_code: error.errorCode,
        });
      }
      return ErrorHandler.handleControllerError(error, res, "QuoteRequestController");
    }
  }
}

module.exports = QuoteRequestController;
