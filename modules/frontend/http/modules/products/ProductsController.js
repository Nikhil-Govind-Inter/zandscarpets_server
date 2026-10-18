const { ApiResponse } = require("../../traits/response");
const { HTTP_STATUS, RESPONSE_MESSAGES } = require("../../traits/constants");
const { ErrorHandler } = require("../../traits/errorHandler");
const service = require("./ProductsService");

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

class ProductsController {
  /*
   * @route   GET /api/frontend/products/page
   * @desc    Products page content: banner, page scripts and the general FAQs
   * @access  Public
   */
  static page = respond((req) => service.page(req), "productsController.page");

  /*
   * @route   GET /api/frontend/products/filters
   * @desc    Filter options: categories (flat, with parent) and attributes with their values in use
   * @access  Public
   */
  static filters = respond((req) => service.filters(req), "productsController.filters");

  /*
   * @route   GET /api/frontend/products?page=1&limit=6&category=a,b&attrs=color:oak,size:2m
   * @desc    Paginated list of active products
   * @access  Public
   */
  static list = respond((req) => service.list(req), "productsController.list");

  /*
   * @route   GET /api/frontend/products/:slug?attrs=size:small,color:oak
   * @desc    One active product: info, attributes, variants, the selected variant's tab content, FAQs
   * @access  Public
   */
  static detail = respond((req) => service.detail(req), "productsController.detail");

  /*
   * @route   GET /api/frontend/products/:slug/related?limit=8
   * @desc    Related products (picked ones first, then same category)
   * @access  Public
   */
  static related = respond((req) => service.related(req), "productsController.related");
}

module.exports = ProductsController;
