const { models } = require("../../../../../database/models");
const { handleFileUploadUpdate } = require("../../middleware/multerMiddleware");
const {
  sendErrorResponse,
  sendSuccessResponse,
} = require("../../traits/responseHandler");
const { getCache, setCache, invalidateCache, cacheKeys } = require("../../traits/cacheHelper");

const fileFields = ["header_logo_media_path", "footer_logo_media_path"];

class SiteSettingsController {
  static async get(req, res) {
    try {
      const cached = await getCache(req, cacheKeys.siteSettings());
      if (cached) {
        return sendSuccessResponse(res, cached, "Site settings retrieved successfully from cache");
      }

      const data = await models.SiteSettings.findOne();

      await setCache(req, cacheKeys.siteSettings(), data);

      sendSuccessResponse(res, data, "Site settings retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;

      const siteSettings = await models.SiteSettings.findByPk(id);
      if (!siteSettings) {
        return sendErrorResponse(res, new Error("Site settings not found"), {
          statusCode: 404,
        });
      }

      await handleFileUploadUpdate(req, siteSettings, fileFields);

      await siteSettings.update(req.body);

      await invalidateCache(req, cacheKeys.siteSettings());

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
