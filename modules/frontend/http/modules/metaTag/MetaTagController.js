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
      const { data } = await service.index(req);

      return ApiResponse.success(res, {
        message: RESPONSE_MESSAGES.SUCCESS.DATA_RETRIEVED,
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

  /*
   * @route   GET /api/frontend/meta-data?page=about
   * @route   GET /api/frontend/meta-data?product_id=5
   * @route   GET /api/frontend/meta-data?variant_id=3
   * @route   GET /api/frontend/meta-data?blog_id=outdoor-flooring-dubai
   * @desc    Get meta data for a page, product, variant or blog (exactly one target)
   * @access  Public
   */
  static async common(req, res) {
    try {
      const provided = ["page", "product_id", "variant_id", "blog_id"].filter(
        (key) =>
          req.query[key] !== undefined &&
          req.query[key] !== null &&
          String(req.query[key]).trim() !== "",
      );

      if (provided.length !== 1) {
        return ApiResponse.error(res, {
          message: "Provide exactly one of `page`, `product_id`, `variant_id` or `blog_id`",
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const { data } = await service.byTarget(req);

      return ApiResponse.success(res, {
        message: RESPONSE_MESSAGES.SUCCESS.DATA_RETRIEVED,
        data,
        status: HTTP_STATUS.OK,
      });
    } catch (error) {
      return ErrorHandler.handleControllerError(
        error,
        res,
        "MetaTagController.common",
      );
    }
  }
}

module.exports = MetaTagController;
