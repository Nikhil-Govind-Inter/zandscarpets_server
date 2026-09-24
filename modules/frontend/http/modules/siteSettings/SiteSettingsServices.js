const { models } = require("../../../../../database/models");
const { getCache, setCache, cacheKeys } = require("../../traits/cacheHelper");
const SiteSettingsSectionBuilder = require("./SiteSettingsSectionBuilder");

class SiteSettingsService {
  static async index(req) {
    const normalizedLang = req?.query?.lang === "ar" ? "ar" : "en";
    const cacheKey = cacheKeys.siteSettings(normalizedLang);

    const cached = await getCache(req, cacheKey);
    if (cached) return { data: cached, fromCache: true };

    const cmsData = await models.SiteSettings.findOne({});

    if (!cmsData) {
      throw new Error("No site settings found");
    }

    const floatingIcons = await models.FloatingIcon.findAll({
      where: { is_active: true },
      order: [
        ["sort_order", "ASC"],
        ["id", "ASC"],
      ],
    });

    const data = {
      header: SiteSettingsSectionBuilder.buildHeader(cmsData, normalizedLang),
      footer: SiteSettingsSectionBuilder.buildFooter(cmsData, normalizedLang),
      floating_buttons: SiteSettingsSectionBuilder.buildFloatingButtons(
        floatingIcons,
        normalizedLang,
      ),
    };

    await setCache(req, cacheKey, data);

    return { data };
  }
}

module.exports = SiteSettingsService;
