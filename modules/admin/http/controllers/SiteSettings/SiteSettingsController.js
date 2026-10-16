const { models } = require("../../../../../database/models");
const { handleFileUploadUpdate } = require("../../middleware/multerMiddleware");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendValidationError,
} = require("../../traits/responseHandler");
const {
  validateId,
  validationRequestPost,
} = require("../../request/siteSettings/siteSettingsRequest");
const { validationResult } = require("express-validator");

const fileFields = ["header_logo_media_path", "footer_logo_media_path"];

class SiteSettingsController {
  static async get(req, res) {
    try {
      const data = await models.SiteSettings.findOne();

      sendSuccessResponse(res, data, "Site settings retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    // Add validaiton
    await Promise.all(
      [...validateId, ...validationRequestPost].map((v) => v.run(req)),
    );
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    try {
      let siteSettings = await models.SiteSettings.findOne();

      await handleFileUploadUpdate(req, siteSettings, fileFields);

      if (!siteSettings) {
        siteSettings = await models.SiteSettings.create(req.body);
      } else {
        await siteSettings.update(req.body);
      }

      sendSuccessResponse(
        res,
        siteSettings,
        "Site settings updated successfully",
      );
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = SiteSettingsController;
