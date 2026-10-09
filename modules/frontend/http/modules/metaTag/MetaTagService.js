const { models } = require("../../../../../database/models");
const { getCache, setCache, cacheKeys } = require("../../traits/cacheHelper");
const { t } = require("../../traits/localeHelper");
const { HttpError } = require("../../traits/HttpError");

class MetaTagService {
  static async index(req) {
    const page = req?.query?.page;
    const lang = req?.query?.lang === "ar" ? "ar" : "en";
    const cacheKey = cacheKeys.metaTags(page, lang);

    const cached = await getCache(req, cacheKey);
    if (cached) return { data: cached, fromCache: true };

    const meta = await models.MetaData.findOne({
      include: [
        {
          model: models.Page,
          as: "page",
          where: { page_slug: page, is_active: true },
          attributes: ["page_slug"],
        },
      ],
    });

    if (!meta) {
      throw new HttpError("Meta data not found", 404, "NOT_FOUND");
    }

    const data = {
      page: meta.page.page_slug,
      meta_title: t(lang, meta.meta_title, meta.meta_title_ar),
      meta_description: t(lang, meta.meta_description, meta.meta_description_ar),
      meta_keywords: t(lang, meta.meta_keywords, meta.meta_keywords_ar),
    };

    await setCache(req, cacheKey, data);

    return { data };
  }
}

module.exports = MetaTagService;
