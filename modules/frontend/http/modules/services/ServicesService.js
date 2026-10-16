const { models } = require("../../../../../database/models");
const ServicesSectionBuilder = require("./ServicesSectionBuilder");

class ServicesService {
  static async index(req) {
    const normalizedLang = req?.query?.lang === "ar" ? "ar" : "en";

    const cmsData = await models.ServiceCms.findOne({});

    if (!cmsData) {
      throw new Error("No CMS data found for Services page");
    }

    const [
      banner = [],
      industries = [],
      services = [],
      processSteps = [],
    ] = await Promise.all([
      models.Banners.findAll({
        include: [
          {
            model: models.Page,
            as: "page",
            where: { is_active: true, page_slug: "services" },
            required: true,
          },
        ],
      }),
      models.Industry.findAll({
        where: { is_active: true },
        order: [["sort_order", "ASC"]],
      }),
      models.Services.findAll({
        where: { is_active: true },
        order: [["sort_order", "ASC"]],
      }),
      models.ProcessSteps.findAll({
        where: { is_active: true },
        order: [["sort_order", "ASC"]],
      }),
    ]);

    const data = {
      banner_section: ServicesSectionBuilder.buildBannerSection(banner, normalizedLang),
      introduction_section: ServicesSectionBuilder.buildIntroductionSection(
        cmsData,
        industries,
        normalizedLang,
      ),
      service_section: ServicesSectionBuilder.buildServiceSection(
        cmsData,
        services,
        normalizedLang,
      ),
      process_steps_section: ServicesSectionBuilder.buildProcessStepsSection(
        cmsData,
        processSteps,
        normalizedLang,
      ),
    };

    return { data };
  }
}

module.exports = ServicesService;
