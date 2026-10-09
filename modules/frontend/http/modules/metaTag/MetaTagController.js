const { ApiResponse } = require("../../traits/response");
const { HTTP_STATUS, RESPONSE_MESSAGES } = require("../../traits/constants");
const { ErrorHandler } = require("../../traits/errorHandler");
const service = require("./MetaTagService");

class MetaTagController {
  /*
   * @route   GET /api/frontend/meta-tags?page=home
   * @desc    Get meta data for a page by its slug
   * @access  Public
   */
  static async index(req, res) {
    try {
      const page = typeof req.query.page === "string" ? req.query.page.trim() : "";

      if (!page) {
        return ApiResponse.error(res, {
          message: "Query param `page` is required",
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      req.query.page = page;
      const { data, fromCache = false } = await service.index(req);

      return ApiResponse.success(res, {
        message: fromCache
          ? RESPONSE_MESSAGES.SUCCESS.DATA_RETRIEVED_FROM_CACHE
          : RESPONSE_MESSAGES.SUCCESS.DATA_RETRIEVED,
        data,
        status: HTTP_STATUS.OK,
      });
    } catch (error) {
      return ErrorHandler.handleControllerError(
        error,
        res,
        "MetaTagController.index",
      );
    }
  }
}

module.exports = MetaTagController;
