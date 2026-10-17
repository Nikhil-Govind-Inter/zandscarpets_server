const { QueryTypes } = require("sequelize");
const { sequelize } = require("../../../../../database/models");
const { BASE_URL } = require("../../../../../constants");

const MAX_LIMIT = 12;
const DEFAULT_LIMIT = 12;

const backendUrl = `${BASE_URL}/`;
const absoluteUrl = (relativePath) => (relativePath ? `${backendUrl}${relativePath}` : null);

const toPositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const localized = (column, alias) => `CASE WHEN :lang = 'ar' THEN COALESCE(${column}_ar, ${column}) ELSE ${column} END AS ${alias}`;

// `?show_in_home=1|true` limits the list to projects flagged for the home page
const isTruthyFlag = (value) => ["1", "true"].includes(String(value).toLowerCase());

const parseIndustrySlugs = (value) => {
  const values = Array.isArray(value) ? value : [value];
  return values
    .flatMap((item) => (typeof item === "string" ? item.split(",") : []))
    .map((item) => item.trim())
    .filter(Boolean);
};

class ProjectsListService {
  static async index(req) {
    const industrySlugs = parseIndustrySlugs(req?.query?.industry);
    const page = toPositiveInt(req?.query?.page, 1);
    const limit = Math.min(toPositiveInt(req?.query?.limit, DEFAULT_LIMIT), MAX_LIMIT);

    const where = ["p.deleted_at IS NULL", "p.is_active = true", "i.deleted_at IS NULL", "i.is_active = true"];
    const replacements = { limit, offset: (page - 1) * limit };

    if (isTruthyFlag(req?.query?.show_in_home)) {
      where.push("p.is_show_in_home = true");
    }

    if (industrySlugs.length) {
      where.push("i.slug IN (:industrySlugs)");
      replacements.industrySlugs = industrySlugs;
    }

    const whereClause = `WHERE ${where.join(" AND ")}`;

    const dataSql = `
      SELECT
        p.slug,
        p.thumbnail,
        p.title AS title,
        p.title_ar AS title_ar,
        p.location AS location,
        p.location_ar AS location_ar,
        i.slug AS industry_slug,
        i.title AS industry_title,
        i.title_ar AS industry_title_ar,
        c.slug AS category_slug,
        c.is_active AS category_is_active,
        c.title AS category_title,
        c.title_ar AS category_title_ar
      FROM projects p
      JOIN industry i ON i.id = p.industry_id
      LEFT JOIN product_categories c ON c.id = p.category_id AND c.deleted_at IS NULL
      ${whereClause}
      ORDER BY p.sort_order ASC, p.id ASC
      LIMIT :limit OFFSET :offset
    `;

    const countSql = `
      SELECT COUNT(*)::int AS count
      FROM projects p
      JOIN industry i ON i.id = p.industry_id
      ${whereClause}
    `;

    const [rows, countRows] = await Promise.all([
      sequelize.query(dataSql, { replacements, type: QueryTypes.SELECT }),
      sequelize.query(countSql, { replacements, type: QueryTypes.SELECT }),
    ]);

    const projects = rows.map((row) => {
      const category =
        row.category_slug && row.category_is_active
          ? {
              slug: row.category_slug,
              title: row.category_title,
              title_ar: row.category_title_ar,
            }
          : null;

      return {
        slug: row.slug,
        title: row.title,
        title_ar: row.title_ar,
        location: row.location,
        location_ar: row.location_ar,
        thumbnail_url: absoluteUrl(row.thumbnail),
        industry: {
          slug: row.industry_slug,
          title: row.industry_title,
          title_ar: row.industry_title_ar,
        },
        category,
      };
    });

    const count = countRows[0]?.count ?? 0;
    const totalPages = Math.max(Math.ceil(count / limit), 1);
    const data = {
      projects,
      pagination: {
        page,
        limit,
        totalCount: count,
        totalPages,
        hasMore: page < totalPages,
      },
    };

    return { data };
  }
}

module.exports = ProjectsListService;
