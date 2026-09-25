const { models } = require("../../../../../database/models");
const { getCache, setCache, cacheKeys } = require("../../traits/cacheHelper");
const PrivacyPolicySectionBuilder = require("./PrivacyPolicySectionBuilder");

class PrivacyPolicyService {
  static async index(req) {
    const normalizedLang = req?.query?.lang === "ar" ? "ar" : "en";
    const cacheKey = cacheKeys.privacyPolicy(normalizedLang);

    const cached = await getCache(req, cacheKey);
    if (cached) return { data: cached, fromCache: true };

    const cmsData = await models.PrivacyPolicy.findOne({});

    if (!cmsData) {
      throw new Error("No CMS data found for Privacy Policy page");
    }

    const data = PrivacyPolicySectionBuilder.buildContentSection(
      cmsData,
      normalizedLang,
    );
    await setCache(req, cacheKey, data);
    return { data };
  }
}

module.exports = PrivacyPolicyService;
