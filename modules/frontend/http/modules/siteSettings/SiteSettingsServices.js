const {
  mediaWithoutType,
  singleMediaWithoutType,
} = require("../../traits/mediaButtonHelper");
const { models } = require("../../../../../database/models");

// Picks the language-appropriate value; falls back to the base value when no
// Arabic variant exists (e.g. WorkPlan has no `_ar` columns at all).
function t(lang, base, ar) {
  return lang === "ar" ? (ar ?? base ?? "") : (base ?? "");
}

// Collapses a media object's paired `foo`/`foo_ar` keys down to a single
// language, recursing into nested objects (e.g. desktop/mobile).
function localizeMedia(media, lang) {
  if (Array.isArray(media)) return media.map((m) => localizeMedia(m, lang));
  if (media && typeof media === "object") {
    const result = {};
    for (const key of Object.keys(media)) {
      if (key.endsWith("_ar")) continue;
      const arKey = `${key}_ar`;
      if (Object.prototype.hasOwnProperty.call(media, arKey)) {
        result[key] = t(lang, media[key], media[arKey]);
      } else if (media[key] && typeof media[key] === "object") {
        result[key] = localizeMedia(media[key], lang);
      } else {
        result[key] = media[key];
      }
    }
    return result;
  }
  return media;
}

class AboutService {
  static async index({ lang } = {}) {
    const normalizedLang = lang === "ar" ? "ar" : "en";

    const cmsData = await models.AboutCms.findOne({});

    if (!cmsData) {
      throw new Error("No CMS data found for About page");
    }

    const [
      banner = [],
      stats = [],
      coreValues = [],
      history = [],
      messages = [],
      worksPlans = [],
    ] = await Promise.all([
      models.Banners.findAll({
        includes: [
          {
            model: models.Page,
            as: "page",
            where: { is_active: true, page_slug: "about" },
          },
        ],
      }),
      models.Milestones.findAll({ where: { is_active: true } }),
      models.CoreValues.findAll({ where: { is_active: true } }),
      models.History.findAll({ where: { is_active: true } }),
      models.Messages.findAll({
        where: { is_active: true },
        attributes: {
          exclude: [
            "createdAt",
            "updatedAt",
            "deleted_at",
            "sort_order",
            "is_active",
          ],
        },
      }),
      models.WorkPlan.findAll({ where: { is_active: true } }),
    ]);

    const data = {
      banner_section: this.buildBannerSection(banner, normalizedLang),
      introduction_section: this.buildIntroductionSection(
        cmsData,
        stats,
        normalizedLang,
      ),
      history_section: this.buildHistorySection(
        cmsData,
        history,
        normalizedLang,
      ),
      messages_section: this.buildMessagesSection(
        cmsData,
        messages,
        normalizedLang,
      ),
      process_section: this.buildProcessSection(
        cmsData,
        worksPlans,
        normalizedLang,
      ),
    };

    return data;
  }

  static buildBannerSection(banner, lang) {
    return {
      title: t(lang, banner[0]?.title, banner[0]?.title_ar),
      sub_title: t(lang, banner[0]?.sub_title, banner[0]?.sub_title_ar),
      media: localizeMedia(
        mediaWithoutType(
          banner[0],
          "desktop_media_path",
          "mobile_media_path",
          "media_alt",
          "media_alt_ar",
        ),
        lang,
      ),
    };
  }

  static buildIntroductionSection(cmsData, stats, lang) {
    return {
      title: t(lang, cmsData?.about_title, cmsData?.about_title_ar),
      description: t(
        lang,
        cmsData?.about_description,
        cmsData?.about_description_ar,
      ),
      media: localizeMedia(
        singleMediaWithoutType(
          cmsData,
          "media_path",
          "media_alt",
          "media_alt_ar",
        ),
        lang,
      ),

      misison: {
        title: t(lang, cmsData?.mission_title, cmsData?.mission_title_ar),
        description: t(
          lang,
          cmsData?.mission_description,
          cmsData?.mission_description_ar,
        ),
      },
      vision: {
        title: t(lang, cmsData?.vision_title, cmsData?.vision_title_ar),
        description: t(
          lang,
          cmsData?.vision_description,
          cmsData?.vision_description_ar,
        ),
      },

      stats: stats.map((item) => ({
        value: t(lang, item?.value, item?.value_ar),
        label: t(lang, item?.label, item?.label_ar),
      })),
    };
  }

  static buildHistorySection(cmsData, history, lang) {
    return {
      title: t(lang, cmsData?.history_title, cmsData?.history_title_ar),
      items: history.map((item) => ({
        year: item?.year ?? "",
        title: t(lang, item?.title, item?.title_ar),
        description: t(lang, item?.description, item?.description_ar),
      })),
    };
  }

  static buildMessagesSection(cmsData, associates, lang) {
    return {
      title: t(lang, cmsData?.message_title, cmsData?.message_title_ar),
      sub_title: t(
        lang,
        cmsData?.message_subtitle,
        cmsData?.message_subtitle_ar,
      ),
      items: associates.map((item) => ({
        id: item.id,
        quotes: t(lang, item.quotes, item.quotes_ar),
        name: t(lang, item.name, item.name_ar),
        designation: t(lang, item.designation, item.designation_ar),
        organization: t(lang, item.Organization, item.organization_ar),
        media: localizeMedia(
          singleMediaWithoutType(
            item,
            "media_path",
            "media_alt",
            "media_alt_ar",
          ),
          lang,
        ),
      })),
    };
  }

  static buildProcessSection(cmsData, worksPlans, lang) {
    return {
      title: t(lang, cmsData?.work_title, cmsData?.work_title_ar),
      media: localizeMedia(
        singleMediaWithoutType(
          cmsData,
          "work_media_path",
          "work_media_alt",
          "work_media_alt_ar",
        ),
        lang,
      ),
      items: worksPlans.map((item) => ({
        title: t(lang, item?.title, item?.title_ar),
        short_description: t(lang, item?.short_description, item?.short_description_ar),
      })),
    };
  }
}

module.exports = AboutService;
