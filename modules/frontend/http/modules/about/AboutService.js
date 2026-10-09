const { models } = require("../../../../../database/models");
const { getCache, setCache, cacheKeys } = require("../../traits/cacheHelper");
const AboutSectionBuilder = require("./AboutSectionBuilder");

class AboutService {
  static async index(req) {
    const normalizedLang = req?.query?.lang === "ar" ? "ar" : "en";
    const cacheKey = cacheKeys.about(normalizedLang);

    const cached = await getCache(req, cacheKey);
    if (cached) return { data: cached, fromCache: true };

    const cmsData = await models.AboutCms.findOne({});

    if (!cmsData) {
      throw new Error("No CMS data found for About page");
    }

    const activeQuery = {
      where: { is_active: true },
      order: [["sort_order", "ASC"]],
    };

    const [
      banner = [],
      stats = [],
      coreValues = [],
      history = [],
      messages = [],
      worksPlans = [],
      aboutFeatures = [],
      industries = [],
    ] = await Promise.all([
      models.Banners.findAll({
        include: [
          {
            model: models.Page,
            as: "page",
            required: true,
            attributes: [],
            where: { is_active: true, page_slug: "about" },
          },
        ],
      }),
      models.Milestones.findAll(activeQuery),
      models.CoreValues.findAll(activeQuery),
      models.History.findAll(activeQuery),
      models.Messages.findAll({
        ...activeQuery,
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "deleted_at",
            "sort_order",
            "is_active",
          ],
        },
      }),
      models.WorkPlan.findAll(activeQuery),
      models.OurFeatures.findAll(activeQuery),
      models.AboutIndustries.findAll(activeQuery),
    ]);

    const data = {

      // cmsData,

      banner_section: AboutSectionBuilder.buildBannerSection(
        banner,
        normalizedLang,
      ),
      introduction_section: AboutSectionBuilder.buildIntroductionSection(
        cmsData,
        stats,
        normalizedLang,
      ),
      history_section: AboutSectionBuilder.buildHistorySection(
        cmsData,
        history,
        normalizedLang,
      ),
      messages_section: AboutSectionBuilder.buildMessagesSection(
        cmsData,
        messages,
        normalizedLang,
      ),
      process_section: AboutSectionBuilder.buildProcessSection(
        cmsData,
        worksPlans,
        normalizedLang,
      ),
      core_value_section: AboutSectionBuilder.buildCoreValueSection(
        cmsData,
        coreValues,
        normalizedLang,
      ),
      client_section: AboutSectionBuilder.buildClientSection(
        cmsData,
        aboutFeatures,
        normalizedLang,
      ),
      industry_section: AboutSectionBuilder.buildIndustrySection(
        cmsData,
        industries,
        normalizedLang,
      ),
    };

    await setCache(req, cacheKey, data);
    return { data };
  }
}

module.exports = AboutService;
