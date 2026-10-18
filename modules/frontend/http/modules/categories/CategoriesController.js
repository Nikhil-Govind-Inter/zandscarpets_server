const { ApiResponse } = require("../../traits/response");
const { HTTP_STATUS, RESPONSE_MESSAGES } = require("../../traits/constants");
const { ErrorHandler } = require("../../traits/errorHandler");
const service = require("./CategoriesService");

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

class CategoriesController {
  /*
   * @route   GET /api/frontend/categories/page
   * @desc    Categories page content: banner, page scripts and the badge filters
   * @access  Public
   */
  static page = respond((req) => service.page(req), "categoriesController.page");

  /*
   * @route   GET /api/frontend/categories?page=1&limit=6&badge=<slug>
   * @desc    Paginated list of active categories
   * @access  Public
   */
  static list = respond((req) => service.list(req), "categoriesController.list");
}

module.exports = CategoriesController;
