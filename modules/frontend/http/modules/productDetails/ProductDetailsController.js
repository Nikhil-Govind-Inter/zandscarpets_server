const { ApiResponse } = require("../../traits/response");
const { HTTP_STATUS, RESPONSE_MESSAGES } = require("../../traits/constants");
const { ErrorHandler } = require("../../traits/errorHandler");
const service = require("./ProductDetailsService");

class ProductDetailsController {
  /*
   * @route   GET /api/frontend/product-details
   * @desc    Resolved dynamic-detail fields for a variant (or a bare
   *          product, if it has no variants / none was given)
   * @access  Public
   * @query   product_id (required), variant_id (optional)
   */
  static async forVariant(req, res) {
    try {
      const productId = parseInt(req.query.product_id, 10);
      if (!Number.isInteger(productId) || productId <= 0) {
        return ApiResponse.validationError(res, [
          { field: "product_id", message: "product_id is required" },
        ]);
      }

      const variantId = req.query.variant_id ? parseInt(req.query.variant_id, 10) : null;

      const fields = await service.forVariant({ productId, variantId });
      if (fields === null) {
        return ApiResponse.error(res, {
          message: RESPONSE_MESSAGES.ERROR.DATA_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND,
        });
      }

      return ApiResponse.success(res, {
        message: RESPONSE_MESSAGES.SUCCESS.DATA_RETRIEVED,
        data: fields,
        status: HTTP_STATUS.OK,
      });
    } catch (error) {
      return ErrorHandler.handleControllerError(error, res, "productDetailsController");
    }
  }
}

module.exports = ProductDetailsController;
