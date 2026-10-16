const { models } = require("../../../../../database/models");
const {
  handleFileUploadUpdate,
  handleFileUploadStore,
} = require("../../middleware/multerMiddleware");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendValidationError,
} = require("../../traits/responseHandler");
const {
  validateId,
  validationRequestPost,
} = require("../../request/home/homeCmsRequest");
const { validationResult } = require("express-validator");

const fileFields = ["cta_media_path"];

class HomeCmsController {
  static async get(req, res) {
    try {
      const data = await models.HomeCms.findOne();

      sendSuccessResponse(res, data, "Home CMS retrieved successfully");
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
      let homeCms = await models.HomeCms.findOne();

      if (!homeCms) {
        handleFileUploadStore(req, fileFields);
        homeCms = await models.HomeCms.create(req.body);
      } else {
        await handleFileUploadUpdate(req, homeCms, fileFields);
        await homeCms.update(req.body);
      }

      sendSuccessResponse(res, homeCms, "Home CMS updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = HomeCmsController;
