const { ApiResponse } = require("../../traits/response");
const { HTTP_STATUS, RESPONSE_MESSAGES } = require("../../traits/constants");
const { ErrorHandler } = require("../../traits/errorHandler");
const service = require("./ServicesService");

class ServicesController {
  /*
   * @route   GET /api/frontend/services
   * @desc    Get Services Page
   * @access  Public
   */
  static async index(req, res) {
    try {
      const { data, fromCache = false } = await service.index(req);
      return ApiResponse.success(res, {
        message: fromCache
          ? RESPONSE_MESSAGES.SUCCESS.DATA_RETRIEVED_FROM_CACHE
          : RESPONSE_MESSAGES.SUCCESS.DATA_RETRIEVED,
        data,
        status: HTTP_STATUS.OK,
      });
    } catch (error) {
      return ErrorHandler.handleControllerError(error, res, "servicesController");
    }
  }
}

module.exports = ServicesController;
