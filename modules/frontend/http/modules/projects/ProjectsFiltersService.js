const { models } = require("../../../../../database/models");
const { t } = require("../../traits/localeHelper");

class ProjectsFiltersService {
  static async index(req) {
    const normalizedLang = req?.query?.lang === "ar" ? "ar" : "en";

    // Querying Projects (not Industry with an include) avoids the duplicate-row
    // trap of an inner join on a one-to-many relation — one row per project,
    // de-duplicated into industries in JS below.
    const projects = await models.Projects.findAll({
      where: { is_active: true },
      attributes: ["industry_id"],
      include: [
        {
          model: models.Industry,
          as: "industry",
          where: { is_active: true },
          required: true,
          attributes: ["id", "slug", "title", "title_ar", "sort_order"],
        },
      ],
    });

    const industryById = new Map();
    for (const project of projects) {
      const industry = project.industry;
      if (!industryById.has(industry.id)) {
        industryById.set(industry.id, industry);
      }
    }

    const industries = [...industryById.values()]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((industry) => ({
        slug: industry.slug,
        title: industry.title,
        title_ar: industry.title_ar,
      }));

    return { data: { industries } };
  }
}

module.exports = ProjectsFiltersService;
