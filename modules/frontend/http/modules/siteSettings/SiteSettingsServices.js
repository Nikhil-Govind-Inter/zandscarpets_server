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

    const [floatingIcons, socialMedia, footerMedia] = await Promise.all([
      models.FloatingIcon.findAll({
        where: { is_active: true },
        order: [["sort_order", "DESC"]],
      }),
      models.SocialMedia.findAll(activeQuery),
      models.FooterMedia.findAll(activeQuery),
    ]);

    const data = {
      header: SiteSettingsSectionBuilder.buildHeader(cmsData, normalizedLang),
      footer: SiteSettingsSectionBuilder.buildFooter(
        cmsData,
        normalizedLang,
        socialMedia,
        footerMedia,
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
