const { models } = require("../../../../../database/models");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendValidationError,
} = require("../../traits/responseHandler");
const {
  validateId,
  validationRequestPost,
} = require("../../request/common/commonContentRequest");
const { handleFileUploadUpdate, deleteOldFile } = require("../../middleware/multerMiddleware");
const { validationResult } = require("express-validator");

const fileFields = ["how_section_media_path", "how_section_thumbnail"];

class CommonContentController {
  static async get(req, res) {
    try {
      const data = await models.CommonContent.findOne();

      sendSuccessResponse(res, data, "Common content retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    await Promise.all(
      [...validateId, ...validationRequestPost].map((v) => v.run(req)),
    );
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    try {
      let commonContent = await models.CommonContent.findOne();

      await handleFileUploadUpdate(req, commonContent, fileFields);
      // Image media carries no thumbnail; drop a stale one when switching.
      if (req.body.how_section_media_type !== "video") {
        req.body.how_section_thumbnail = null;
        if (commonContent?.how_section_thumbnail) {
          await deleteOldFile(commonContent.how_section_thumbnail);
        }
      }

      if (!commonContent) {
        commonContent = await models.CommonContent.create(req.body);
      } else {
        await commonContent.update(req.body);
      }

      sendSuccessResponse(res, commonContent, "Common content updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = CommonContentController;
