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
} = require("../../request/policies/privacyPolicyRequest");
const { validationResult } = require("express-validator");

class PrivacyPolicyController {
  static async get(req, res) {
    try {
      const cached = await getCache(req, cacheKeys.privacyPolicy());
      if (cached) {
        return sendSuccessResponse(res, cached, "Privacy Policy retrieved successfully from cache");
      }
      const data = await models.PrivacyPolicy.findOne();
      await setCache(req, cacheKeys.privacyPolicy(), data);
      sendSuccessResponse(res, data, "Privacy Policy retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    await Promise.all([...validateId, ...validationRequestPost].map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      let privacyPolicy = await models.PrivacyPolicy.findOne();
      if (!privacyPolicy) {
        privacyPolicy = await models.PrivacyPolicy.create(req.body);
      } else {
        await privacyPolicy.update(req.body);
      }
      await invalidateCache(req, cacheKeys.privacyPolicy());
      sendSuccessResponse(res, privacyPolicy, "Privacy Policy updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = PrivacyPolicyController;
