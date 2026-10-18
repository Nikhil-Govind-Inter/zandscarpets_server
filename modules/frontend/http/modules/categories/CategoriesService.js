const { Op } = require("sequelize");
const { models } = require("../../../../../database/models");
const { singleMediaWithoutType } = require("../../traits/mediaButtonHelper");
const { withVisibility, inlineRichText } = require("../../traits/sectionHelpers");
const MetaTagService = require("../metaTag/MetaTagService");

const DEFAULT_LIMIT = 6;
// the storefront can ask for the first N pages at once (a `?page=N` link), so allow a larger limit
const MAX_LIMIT = 120;

const text = (value) => value ?? "";

const toPositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const toBadge = (badge) =>
  badge
    ? { slug: badge.slug, title: text(badge.title), title_ar: text(badge.title_ar) }
    : null;

// Same convention as the home / about APIs: every text field comes back in both languages
// (`title` / `title_ar`) and the storefront picks one by locale.
class CategoriesService {
  // Page-level content: banner (the banner linked to the `main-category` page), the page's
  // JSON-LD / extra scripts and the badge filter list (only badges that active categories use).
  static async page() {
    const [banner = [], otherMeta, badged = [], cmsData] = await Promise.all([
      models.Banners.findAll({
        include: [
          {
            model: models.Page,
            as: "page",
            required: true,
            attributes: [],
            where: { is_active: true, page_slug: "main-category" },
          },
        ],
      }),
      MetaTagService.getOtherMetaForPage("category"),
      models.ProductCategories.findAll({
        attributes: ["id"],
        where: { is_active: true },
        include: [
          {
            model: models.ProductLabels,
            as: "badge",
            required: true,
            attributes: ["id", "slug", "title", "title_ar", "sort_order"],
            where: { is_active: true },
          },
        ],
      }),
      models.CategoryCms.findOne({ attributes: ["title", "title_ar"] }),
    ]);

    const badges = new Map();
    for (const category of badged) badges.set(category.badge.id, category.badge);
    const filters = [...badges.values()]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id)
      .map(toBadge);

    const bannerSection = {
      title: text(banner[0]?.title),
      title_ar: text(banner[0]?.title_ar),
      sub_title: text(banner[0]?.sub_title),
      sub_title_ar: text(banner[0]?.sub_title_ar),
      media: singleMediaWithoutType(banner[0], "media_path", "media_alt", "media_alt_ar"),
    };

    return {
      data: {
        other_meta: otherMeta.other_meta,
        other_meta_ar: otherMeta.other_meta_ar,
        banner_section: withVisibility(bannerSection),
        // heading above the list (the storefront falls back to its translation when empty)
        list_section: { title: text(cmsData?.title), title_ar: text(cmsData?.title_ar) },
        filters,
      },
    };
  }

  // Paginated list of every active category (parents and sub-categories, with or without
  // products), optionally limited to one badge (`?badge=<label slug>`).
  static async list(req) {
    const page = toPositiveInt(req?.query?.page, 1);
    const limit = Math.min(toPositiveInt(req?.query?.limit, DEFAULT_LIMIT), MAX_LIMIT);
    const badge = typeof req?.query?.badge === "string" ? req.query.badge.trim() : "";

    const { rows, count } = await models.ProductCategories.findAndCountAll({
      where: { is_active: true },
      attributes: ["id", "slug", "title", "title_ar", "description", "description_ar", "media_path", "sort_order"],
      include: [
        {
          model: models.ProductLabels,
          as: "badge",
          attributes: ["id", "slug", "title", "title_ar"],
          // a disabled badge is not shown (the category itself stays listed);
          // filtering by a badge only matches categories whose badge is active
          required: Boolean(badge),
          where: { is_active: true, ...(badge && { slug: badge }) },
        },
        {
          model: models.ProductHighlights,
          as: "highlights",
          attributes: ["id", "title", "title_ar", "sort_order"],
          where: { is_active: true, deleted_at: { [Op.is]: null } },
          required: false,
          through: { attributes: [] },
        },
      ],
      order: [
        ["sort_order", "ASC"],
        ["id", "ASC"],
        [{ model: models.ProductHighlights, as: "highlights" }, "sort_order", "ASC"],
      ],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

    const categories = rows.map((item) => ({
      id: item.id,
      slug: text(item.slug),
      title: text(item.title),
      title_ar: text(item.title_ar),
      description: inlineRichText(item.description),
      description_ar: inlineRichText(item.description_ar),
      media: singleMediaWithoutType(item, "media_path"),
      badge: toBadge(item.badge),
      highlights: (item.highlights ?? []).map((highlight) => ({
        id: highlight.id,
        title: text(highlight.title),
        title_ar: text(highlight.title_ar),
      })),
    }));

    const totalPages = Math.max(Math.ceil(count / limit), 1);
    return {
      data: {
        categories,
        pagination: { page, limit, totalCount: count, totalPages, hasMore: page < totalPages },
      },
    };
  }
}

module.exports = CategoriesService;
