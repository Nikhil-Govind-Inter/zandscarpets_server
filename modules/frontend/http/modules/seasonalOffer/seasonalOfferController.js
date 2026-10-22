const { ApiResponse } = require("../../traits/response");
const { HTTP_STATUS, RESPONSE_MESSAGES } = require("../../traits/constants");
const { ErrorHandler } = require("../../traits/errorHandler");
const service = require("./SeasonalOfferService");

class SeasonalOfferController {
  /*
   * @route   GET /api/frontend/seasonal-offer
   * @desc    Get the Seasonal Offer popup content
   * @access  Public
   */
  static async index(req, res) {
    try {
      const { data } = await service.index();
      return ApiResponse.success(res, {
        message: RESPONSE_MESSAGES.SUCCESS.DATA_RETRIEVED,
        data,
        status: HTTP_STATUS.OK,
      });
    } catch (error) {
      return ErrorHandler.handleControllerError(error, res, "SeasonalOfferController");
    }
  }
}

module.exports = SeasonalOfferController;
