const { ApiResponse } = require("../../traits/response");
const { HTTP_STATUS, RESPONSE_MESSAGES } = require("../../traits/constants");
const { ErrorHandler } = require("../../traits/errorHandler");
const service = require("./SiteSettingsServices");
class SiteSettingsController {
  /*
   * @route   GET /api/site-settings
   * @desc    Get Site Settings
   * @access  Public
   */
  static async index(req, res) {
    try {
      const data = await service.index(req.query);
      return ApiResponse.success(res, {
        message: RESPONSE_MESSAGES.SUCCESS.DATA_RETRIEVED,
        data,
        status: HTTP_STATUS.OK,
      });
    } catch (error) {
      return ErrorHandler.handleControllerError(error, res, "siteSettingsController");
    }
  }
}

module.exports = SiteSettingsController;
