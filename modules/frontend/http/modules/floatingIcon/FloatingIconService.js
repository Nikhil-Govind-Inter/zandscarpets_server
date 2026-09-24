const { models } = require("../../../../../database/models");
const { getCache, setCache, cacheKeys } = require("../../traits/cacheHelper");

// Returns the Arabic value when lang is "ar" and it exists, otherwise the base value
const t = (lang, base, ar) => (lang === "ar" && ar ? ar : base);

class FloatingIconService {
  static async index(req) {
    const lang = req?.query?.lang === "ar" ? "ar" : "en";
    const cacheKey = cacheKeys.floatingIcons(lang);

    const cached = await getCache(req, cacheKey);
    if (cached) return { data: cached, fromCache: true };

    const icons = await models.FloatingIcon.findAll({
      where: { is_active: true },
      order: [
        ["sort_order", "ASC"],
        ["id", "ASC"],
      ],
    });

    const data = icons.map((icon) => ({
      id: icon.id,
      media: icon.media_path,
      media_alt: t(lang, icon.media_alt, icon.media_alt_ar),
      link: icon.link,
      sort_order: icon.sort_order,
    }));

    await setCache(req, cacheKey, data);

    return { data };
  }
}

module.exports = FloatingIconService;
