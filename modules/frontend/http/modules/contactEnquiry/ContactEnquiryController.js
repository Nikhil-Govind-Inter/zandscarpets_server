const fs = require("fs");
const { ApiResponse } = require("../../traits/response");
const { HTTP_STATUS } = require("../../traits/constants");
const { ErrorHandler } = require("../../traits/errorHandler");
const { validationResult } = require("express-validator");
const { validationRequestPost } = require("./contactEnquiryRequest");
const { getLang, message } = require("./contactEnquiryMessages");
const service = require("./ContactEnquiryService");

class ContactEnquiryController {
  /*
   * @route   POST /api/frontend/contact-enquiry?lang=en|ar
   * @desc    Save a contact enquiry (multipart: name, email, phone, requirements, file?)
   * @access  Public
   */
  static async create(req, res) {
    const lang = getLang(req);

    try {
      await Promise.all(validationRequestPost.map((validation) => validation.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // the upload is already on disk; don't keep it for a rejected enquiry
        if (req.file?.path) await fs.promises.unlink(req.file.path).catch(() => {});

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

      const item = await service.create(req.body, req.file, lang);
      return ApiResponse.success(res, {
        message: message(lang, "created"),
        data: item,
        status: HTTP_STATUS.CREATED,
      });
    } catch (error) {
      return ErrorHandler.handleControllerError(error, res, "ContactEnquiryController");
    }
  }
}

module.exports = ContactEnquiryController;
