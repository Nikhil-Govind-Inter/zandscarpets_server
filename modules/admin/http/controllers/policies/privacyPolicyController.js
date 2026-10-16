const { models } = require("../../../../../database/models");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendValidationError,
} = require("../../traits/responseHandler");
const {
  validateId,
  validationRequestPost,
} = require("../../request/policies/privacyPolicyRequest");
const { validationResult } = require("express-validator");

class PrivacyPolicyController {
  static async get(req, res) {
    try {
      const data = await models.PrivacyPolicy.findOne();
      if (data)       sendSuccessResponse(res, data, "Privacy Policy retrieved successfully");
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
      sendSuccessResponse(res, privacyPolicy, "Privacy Policy updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = PrivacyPolicyController;
