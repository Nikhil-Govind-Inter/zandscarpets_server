const { models } = require("../../../../../database/models");
const { handleFileUploadUpdate } = require("../../middleware/multerMiddleware");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendValidationError,
} = require("../../traits/responseHandler");
const {
  getCache,
  setCache,
  invalidateCache,
  cacheKeys,
} = require("../../traits/cacheHelper");
const {
  validateId,
  validationRequestPost,
} = require("../../request/about/aboutCmsRequest");
const { validationResult } = require("express-validator");

const fileFields = ["media_path", "about_code_media_path", "industry_media_path"];

class AboutCmsController {
  static async get(req, res) {
    try {
      const cached = await getCache(req, cacheKeys.aboutCms());
      if (cached) {
        return sendSuccessResponse(res, cached, "About CMS retrieved successfully from cache");
      }
      const data = await models.AboutCms.findOne();
      await setCache(req, cacheKeys.aboutCms(), data);
      sendSuccessResponse(res, data, "About CMS retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    await Promise.all([...validateId, ...validationRequestPost].map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      let aboutCms = await models.AboutCms.findOne();
      await handleFileUploadUpdate(req, aboutCms, fileFields);
      if (!aboutCms) {
        aboutCms = await models.AboutCms.create(req.body);
      } else {
        await aboutCms.update(req.body);
      }
      await invalidateCache(req, cacheKeys.aboutCms());
      sendSuccessResponse(res, aboutCms, "About CMS updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = AboutCmsController;
