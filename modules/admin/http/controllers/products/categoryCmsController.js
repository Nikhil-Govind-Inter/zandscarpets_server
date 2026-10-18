const { models } = require("../../../../../database/models");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendValidationError,
} = require("../../traits/responseHandler");
const { validateId, validationRequestPost } = require("../../request/products/categoryCmsRequest");
const { validationResult } = require("express-validator");

class CategoryCmsController {
  static async get(req, res) {
    try {
      const data = await models.CategoryCms.findOne();
      sendSuccessResponse(res, data, "Category CMS retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    await Promise.all([...validateId, ...validationRequestPost].map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      let categoryCms = await models.CategoryCms.findOne();
      if (!categoryCms) {
        categoryCms = await models.CategoryCms.create(req.body);
      } else {
        await categoryCms.update(req.body);
      }
      sendSuccessResponse(res, categoryCms, "Category CMS updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = CategoryCmsController;
