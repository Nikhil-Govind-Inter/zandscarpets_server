const { models } = require("../../../../../database/models");
const SiteSettingsSectionBuilder = require("./SiteSettingsSectionBuilder");

class SiteSettingsService {
  static async index(req) {
    const normalizedLang = req?.query?.lang === "ar" ? "ar" : "en";

    const cmsData = await models.SiteSettings.findOne({});

    if (!cmsData) {
      throw new Error("No site settings found");
    }

    const activeQuery = {
      where: { is_active: true },
      order: [
        ["sort_order", "ASC"],
        ["id", "ASC"],
      ],
    };

    const pageQuery = {
      where: { is_active: true },
      attributes: ["id", "page", "page_ar", "page_slug", "link", "show_in_nav", "show_in_footer"],
      order: [
        ["sort_order", "ASC"],
        ["id", "ASC"],
      ],
    };

    const [floatingIcons, socialMedia, footerMedia, footerProducts, footerServices, pages, navCategories] = await Promise.all([
      models.FloatingIcon.findAll({
        where: { is_active: true },
        order: [
          ["sort_order", "DESC"],
          ["id", "ASC"],
        ],
      }),
      models.SocialMedia.findAll(activeQuery),
      models.FooterMedia.findAll(activeQuery),
      models.Products.findAll({
        where: { is_active: true, show_in_footer: true },
        attributes: ["id", "slug", "title", "title_ar"],
        order: [
          ["sort_order", "ASC"],
          ["id", "ASC"],
        ],
      }),
      models.Services.findAll({
        where: { is_active: true, show_in_footer: true },
        attributes: ["id", "title", "title_ar"],
        order: [
          ["sort_order", "ASC"],
          ["id", "ASC"],
        ],
      }),
      // one query for both menus, split by the show_in_nav / show_in_footer flags below
      models.Page.findAll(pageQuery),
      models.ProductCategories.findAll({
        where: { is_active: true, show_in_navbar: true },
        attributes: ["id", "parent_id", "slug", "title", "title_ar"],
        order: [
          ["sort_order", "ASC"],
          ["id", "ASC"],
        ],
      }),
    ]);

    // Featured product cards for the nav dropdown: active products flagged list_in_navbar in the
    // flagged categories, ordered like the admin, a few per category (see NAV_CARDS_PER_CATEGORY)
    const navProducts = navCategories.length
      ? await models.Products.findAll({
          where: {
            is_active: true,
            list_in_navbar: true,
            product_category_id: navCategories.map((category) => category.id),
          },
          attributes: ["id", "slug", "title", "title_ar", "product_category_id", "list_media_path", "list_media_alt", "list_media_alt_ar"],
          include: [{ model: models.ProductLabels, as: "badge", attributes: ["title", "title_ar"], required: false }],
          order: [
            ["sort_order", "ASC"],
            ["id", "ASC"],
          ],
        })
      : [];

    const data = {
      nav: SiteSettingsSectionBuilder.buildNav(
        cmsData,
        normalizedLang,
        navCategories,
        pages.filter((page) => page.show_in_nav),
        navProducts,
      ),
      footer: SiteSettingsSectionBuilder.buildFooter(
        cmsData,
        normalizedLang,
        socialMedia,
        footerMedia,
        footerProducts,
        footerServices,
        pages.filter((page) => page.show_in_footer),
      ),
      floating_buttons: SiteSettingsSectionBuilder.buildFloatingButtons(
        floatingIcons,
        normalizedLang,
      ),
    };

    return { data };
  }
}

module.exports = SiteSettingsService;
