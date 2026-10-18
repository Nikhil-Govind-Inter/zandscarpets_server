const { ApiResponse } = require("../../traits/response");
const { HTTP_STATUS, RESPONSE_MESSAGES } = require("../../traits/constants");
const { ErrorHandler } = require("../../traits/errorHandler");
const service = require("./BlogsService");

const respond = (handler, context) => async (req, res) => {
  try {
    const { data } = await handler(req);
    return ApiResponse.success(res, {
      message: RESPONSE_MESSAGES.SUCCESS.DATA_RETRIEVED,
      data,
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return ErrorHandler.handleControllerError(error, res, context);
  }
};

class BlogsController {
  /*
   * @route   GET /api/frontend/blogs/page
   * @desc    Blog page content: banner, page scripts, headings, filter options and ad banners
   * @access  Public
   */
  static page = respond((req) => service.page(req), "blogsController.page");

  /*
   * @route   GET /api/frontend/blogs?page=1&limit=6&category=a,b&tag=x&sort=latest|oldest
   * @desc    Paginated list of published posts
   * @access  Public
   */
  static list = respond((req) => service.list(req), "blogsController.list");

  /*
   * @route   GET /api/frontend/blogs/:slug
   * @desc    One published post (404 when missing or not published)
   * @access  Public
   */
  static detail = respond((req) => service.detail(req), "blogsController.detail");

  /*
   * @route   GET /api/frontend/blogs/:slug/related?limit=6
   * @desc    Related posts for the "related blogs" carousel
   * @access  Public
   */
  static related = respond((req) => service.related(req), "blogsController.related");
}

module.exports = BlogsController;
