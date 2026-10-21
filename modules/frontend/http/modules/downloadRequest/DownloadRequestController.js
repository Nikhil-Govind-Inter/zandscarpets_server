const { ApiResponse } = require("../../traits/response");
const { HTTP_STATUS } = require("../../traits/constants");
const { ErrorHandler } = require("../../traits/errorHandler");
const { validationResult } = require("express-validator");
const { validationRequestPost } = require("./downloadRequestRequest");
const { getLang, message } = require("./downloadRequestMessages");
const service = require("./DownloadRequestService");

class DownloadRequestController {
  /*
   * @route   POST /api/frontend/download-request?lang=en|ar
   * @desc    Save a download request (name, phone, email, company_name?, download_id)
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
      return ErrorHandler.handleControllerError(error, res, "DownloadRequestController");
    }
  }
}

module.exports = DownloadRequestController;
