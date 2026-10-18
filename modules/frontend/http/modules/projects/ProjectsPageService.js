const { models } = require("../../../../../database/models");
const { singleMediaWithoutType } = require("../../traits/mediaButtonHelper");
const { withVisibility } = require("../../traits/sectionHelpers");
const MetaTagService = require("../metaTag/MetaTagService");

const text = (value) => value ?? "";

class ProjectsPageService {
  // Page-level content of the works page: its banner (the banner linked to the `our-works` page)
  // and the page's JSON-LD / extra scripts. Same conventions as the home / about APIs
  // (both languages per field, `is_visible` on the section).
  static async index() {
    const [banner = [], otherMeta, homeCms] = await Promise.all([
      models.Banners.findAll({
        include: [
          {
            model: models.Page,
            as: "page",
            required: true,
            attributes: [],
            where: { is_active: true, page_slug: "our-works" },
          },
        ],
      }),
      MetaTagService.getOtherMetaForPage("our-work"),
      // the works heading is the same one the home page uses for its works section
      models.HomeCms.findOne({ attributes: ["project_title", "project_title_ar"] }),
    ]);

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
        works_section: {
          title: text(homeCms?.project_title),
          title_ar: text(homeCms?.project_title_ar),
        },
      },
    };
  }
}

module.exports = ProjectsPageService;
