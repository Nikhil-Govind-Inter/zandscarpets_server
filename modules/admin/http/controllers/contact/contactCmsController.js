const { models } = require("../../../../../database/models");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendValidationError,
} = require("../../traits/responseHandler");
const {
  getCache,
  setCache,
  invalidateCache,
  cacheKeys,
} = require("../../traits/cacheHelper");
const {
  validateId,
  validationRequestPost,
} = require("../../request/contact/contactCmsRequest");
const { validationResult } = require("express-validator");

class ContactCmsController {
  static async get(req, res) {
    try {
      const cached = await getCache(req, cacheKeys.contactCms());
      if (cached) {
        return sendSuccessResponse(res, cached, "Contact CMS retrieved successfully from cache");
      }
      const data = await models.ContactCms.findOne();
      await setCache(req, cacheKeys.contactCms(), data);
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
      await invalidateCache(req, cacheKeys.contactCms());
      sendSuccessResponse(res, contactCms, "Contact CMS updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = ContactCmsController;
