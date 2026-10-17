const { models } = require("../../../../../database/models");

class PagesService {
  static async index(req) {
    const lang = req?.query?.lang === "ar" ? "ar" : "en";
    const { placement } = req?.query || {};

    const where = { is_active: true };
    if (placement === "nav") where.show_in_nav = true;
    if (placement === "footer") where.show_in_footer = true;

    const rows = await models.Page.findAll({
      where,
      order: [
        ["sort_order", "ASC"],
        ["page", "ASC"],
      ],
    });

    const data = rows.map((row) => ({
      id: row.id,
      text: lang === "ar" && row.page_ar ? row.page_ar : row.page,
      slug: row.page_slug,
      link: row.link || "",
      show_in_nav: row.show_in_nav,
      show_in_footer: row.show_in_footer,
    }));

    return { data };
  }
}

module.exports = PagesService;
