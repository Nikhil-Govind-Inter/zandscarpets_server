const { models } = require("../../../../../database/models");
const { ErrorHandler } = require("../../traits/errorHandler");
const { HTTP_STATUS, ERROR_CODES } = require("../../traits/constants");
const PrivacyPolicySectionBuilder = require("./PrivacyPolicySectionBuilder");

class PrivacyPolicyService {
  static async index(req) {
    const normalizedLang = req?.query?.lang === "ar" ? "ar" : "en";

    const cmsData = await models.PrivacyPolicy.findOne({});

    if (!cmsData) {
      throw ErrorHandler.createError(
        "No CMS data found for Privacy Policy page",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND_ERROR,
      );
    }

    const data = PrivacyPolicySectionBuilder.buildContentSection(
      cmsData,
      normalizedLang,
    );
    return { data };
  }
}

module.exports = PrivacyPolicyService;
