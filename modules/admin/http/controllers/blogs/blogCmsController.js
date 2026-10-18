const { models } = require("../../../../../database/models");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendValidationError,
} = require("../../traits/responseHandler");
const { validateId, validationRequestPost } = require("../../request/blogs/blogCmsRequest");
const { validationResult } = require("express-validator");

class BlogCmsController {
  static async get(req, res) {
    try {
      const data = await models.BlogCms.findOne();
      sendSuccessResponse(res, data, "Blog CMS retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    await Promise.all([...validateId, ...validationRequestPost].map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      let blogCms = await models.BlogCms.findOne();
      if (!blogCms) {
        blogCms = await models.BlogCms.create(req.body);
      } else {
        await blogCms.update(req.body);
      }
      sendSuccessResponse(res, blogCms, "Blog CMS updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = BlogCmsController;
