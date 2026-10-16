const { models } = require("../../../../../database/models");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendValidationError,
} = require("../../traits/responseHandler");
const {
  validateId,
  validationRequestPost,
} = require("../../request/contact/contactCmsRequest");
const { validationResult } = require("express-validator");

class ContactCmsController {
  static async get(req, res) {
    try {
      const data = await models.ContactCms.findOne();
      sendSuccessResponse(res, data, "Contact CMS retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    await Promise.all([...validateId, ...validationRequestPost].map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      let contactCms = await models.ContactCms.findOne();
      if (!contactCms) {
        contactCms = await models.ContactCms.create(req.body);
      } else {
        await contactCms.update(req.body);
      }
      sendSuccessResponse(res, contactCms, "Contact CMS updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = ContactCmsController;
