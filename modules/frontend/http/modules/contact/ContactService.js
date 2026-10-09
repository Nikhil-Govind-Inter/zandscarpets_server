const { models } = require("../../../../../database/models");
const { getCache, setCache, cacheKeys } = require("../../traits/cacheHelper");
const ContactSectionBuilder = require("./ContactSectionBuilder");

class ContactService {
  static async index(req) {
    const normalizedLang = req?.query?.lang === "ar" ? "ar" : "en";
    const cacheKey = cacheKeys.contact(normalizedLang);

    const cached = await getCache(req, cacheKey);
    if (cached) return { data: cached, fromCache: true };

    const cmsData = await models.ContactCms.findOne({});

    if (!cmsData) {
      throw new Error("No CMS data found for Contact page");
    }

    const whereCondition = {
      where: { is_active: true },
      order: [["sort_order", "ASC"]],
    };

    const [banner = [], connections = [], socialMedia = []] =
      await Promise.all([
        models.Banners.findAll({
          include: [
            {
              model: models.Page,
              as: "page",
              where: { is_active: true, page_slug: "contact" },
              required: true,
            },
          ],
        }),
        models.Connections.findAll(whereCondition),
        models.SocialMedia.findAll(whereCondition),
      ]);

    const data = {
      banner_section: ContactSectionBuilder.buildBannerSection(
        banner,
        normalizedLang,
      ),
      contact_detail_section: ContactSectionBuilder.buildContactDetailSection(
        cmsData,
        connections,
        socialMedia,
        normalizedLang,
      ),
    };

    await setCache(req, cacheKey, data);
    return { data };
  }
}

module.exports = ContactService;
