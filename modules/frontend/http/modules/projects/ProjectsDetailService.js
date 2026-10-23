const { Op } = require("sequelize");
const { models, sequelize } = require("../../../../../database/models");
const { singleMediaWithoutType } = require("../../traits/mediaButtonHelper");
const { HttpError } = require("../../traits/HttpError");
const { BASE_URL } = require("../../../../../constants");

const DEFAULT_RELATED_LIMIT = 6;
const MAX_RELATED_LIMIT = 12;

const backendUrl = `${BASE_URL}/`;
const absoluteUrl = (relativePath) => (relativePath ? `${backendUrl}${relativePath}` : null);

const text = (value) => value ?? "";

const toPositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const toCard = (row) => ({
  slug: row.slug,
  title: text(row.title),
  title_ar: text(row.title_ar),
  location: text(row.location),
  location_ar: text(row.location_ar),
  thumbnail_url: absoluteUrl(row.thumbnail),
  industry: row.industry
    ? { slug: row.industry.slug, title: text(row.industry.title), title_ar: text(row.industry.title_ar) }
    : null,
  category: row.category
    ? { slug: row.category.slug, title: text(row.category.title), title_ar: text(row.category.title_ar) }
    : null,
});

const ACTIVE_WHERE = { is_active: true };

// One active project with everything the detail page renders
class ProjectsDetailService {
  static async detail(req) {
    const slug = String(req?.params?.slug ?? "").trim();
    if (!slug) throw new HttpError("Project not found", 404, "NOT_FOUND");

    const project = await models.Projects.findOne({
      where: { ...ACTIVE_WHERE, slug },
      include: [
        { model: models.Industry, as: "industry", attributes: ["slug", "title", "title_ar"] },
        { model: models.ProductCategories, as: "category", attributes: ["slug", "title", "title_ar"] },
        {
          model: models.ProjectMedia,
          as: "project_media",
          where: { deleted_at: null },
          required: false,
          separate: true,
          order: [["sort_order", "ASC"], ["id", "ASC"]],
        },
      ],
    });

    if (!project) throw new HttpError("Project not found", 404, "NOT_FOUND");

    return {
      data: {
        id: project.id,
        slug: project.slug,
        title: text(project.title),
        title_ar: text(project.title_ar),
        location: text(project.location),
        location_ar: text(project.location_ar),
        date_of_completion: project.date_of_completion,
        material_type: text(project.material_type),
        material_type_ar: text(project.material_type_ar),
        description: text(project.description),
        description_ar: text(project.description_ar),
        media: singleMediaWithoutType(project, "media_path"),
        industry: project.industry
          ? { slug: project.industry.slug, title: text(project.industry.title), title_ar: text(project.industry.title_ar) }
          : null,
        category: project.category
          ? { slug: project.category.slug, title: text(project.category.title), title_ar: text(project.category.title_ar) }
          : null,
        gallery: (project.project_media ?? []).map((item) => ({
          type: item.media_type,
          path: absoluteUrl(item.media_path),
          thumbnail: absoluteUrl(item.thumbnail),
        })),
      },
    };
  }

  // Other active projects for the "related projects" carousel: the ones the admin picked by hand
  // first (in their order), then the ones sharing the same industry, then the latest ones.
  static async related(req) {
    const slug = String(req?.params?.slug ?? "").trim();
    const limit = Math.min(toPositiveInt(req?.query?.limit, DEFAULT_RELATED_LIMIT), MAX_RELATED_LIMIT);
    if (!slug) throw new HttpError("Project not found", 404, "NOT_FOUND");

    const current = await models.Projects.findOne({
      where: { ...ACTIVE_WHERE, slug },
      include: [{ model: models.Projects, as: "relatedProjects", attributes: ["id"], through: { attributes: [] } }],
    });
    if (!current) throw new HttpError("Project not found", 404, "NOT_FOUND");

    const pickedIds = (current.relatedProjects ?? []).map((item) => item.id);

    const picked = pickedIds.length
      ? await models.Projects.findAll({
          where: { ...ACTIVE_WHERE, id: pickedIds },
          include: [
            { model: models.Industry, as: "industry", attributes: ["slug", "title", "title_ar"] },
            { model: models.ProductCategories, as: "category", attributes: ["slug", "title", "title_ar"] },
          ],
        })
      : [];
    // keep the admin's chosen order
    picked.sort((a, b) => pickedIds.indexOf(a.id) - pickedIds.indexOf(b.id));

    const remaining = limit - picked.length;
    const fallback =
      remaining > 0
        ? await models.Projects.findAll({
            where: { ...ACTIVE_WHERE, id: { [Op.notIn]: [current.id, ...pickedIds] } },
            include: [
              { model: models.Industry, as: "industry", attributes: ["slug", "title", "title_ar"] },
              { model: models.ProductCategories, as: "category", attributes: ["slug", "title", "title_ar"] },
            ],
            order: [
              // same industry first
              [sequelize.literal(`CASE WHEN industry_id = ${current.industry_id} THEN 0 ELSE 1 END`), "ASC"],
              ["sort_order", "ASC"],
              ["id", "DESC"],
            ],
            limit: remaining,
          })
        : [];

    return { data: { projects: [...picked, ...fallback].map(toCard) } };
  }
}

module.exports = ProjectsDetailService;
