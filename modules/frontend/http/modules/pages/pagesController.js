const { ApiResponse } = require("../../traits/response");
const { HTTP_STATUS, RESPONSE_MESSAGES } = require("../../traits/constants");
const { ErrorHandler } = require("../../traits/errorHandler");
const service = require("./PagesService");

class PagesController {
  /*
   * @route   GET /api/frontend/pages?placement=nav|footer&lang=en|ar
   * @desc    Get active pages for navbar / footer
   * @access  Public
   */
  static async index(req, res) {
    try {
      const { data } = await service.index(req);
      return ApiResponse.success(res, {
        message: RESPONSE_MESSAGES.SUCCESS.DATA_RETRIEVED,
        data,
        status: HTTP_STATUS.OK,
      });
    } catch (error) {
      return ErrorHandler.handleControllerError(error, res, "PagesController");
    }
  }
}

module.exports = PagesController;
