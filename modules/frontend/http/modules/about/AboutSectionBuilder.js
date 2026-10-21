const { singleMediaWithoutType } = require("../../traits/mediaButtonHelper");
const { blockRichText } = require("../../traits/sectionHelpers");

// Same convention as the home API: every text field comes back in both languages
// (`title` / `title_ar`) and the storefront picks one by locale. Rich-text fields are sanitized.
const text = (value) => value ?? "";

class AboutSectionBuilder {
  static buildBannerSection(banner) {
    return {
      title: text(banner[0]?.title),
      title_ar: text(banner[0]?.title_ar),
      sub_title: text(banner[0]?.sub_title),
      sub_title_ar: text(banner[0]?.sub_title_ar),
      media: singleMediaWithoutType(banner[0], "media_path", "media_alt", "media_alt_ar"),
    };
  }

  static buildIntroductionSection(cmsData, stats) {
    return {
      title: text(cmsData?.about_title),
      title_ar: text(cmsData?.about_title_ar),
      description: blockRichText(cmsData?.about_description),
      description_ar: blockRichText(cmsData?.about_description_ar),

      trust_title: text(cmsData?.trust_title),
      trust_title_ar: text(cmsData?.trust_title_ar),
      trust_description: blockRichText(cmsData?.trust_description),
      trust_description_ar: blockRichText(cmsData?.trust_description_ar),
      // only shown by the client when a link is configured
      trust_button: cmsData?.trust_button_link
        ? {
            text: text(cmsData?.trust_button_text),
            text_ar: text(cmsData?.trust_button_text_ar),
            link: cmsData.trust_button_link,
          }
        : null,

      media: singleMediaWithoutType(cmsData, "media_path", "media_alt", "media_alt_ar"),

      mission: {
        title: text(cmsData?.mission_title),
        title_ar: text(cmsData?.mission_title_ar),
        description: blockRichText(cmsData?.mission_description),
        description_ar: blockRichText(cmsData?.mission_description_ar),
      },
      vision: {
        title: text(cmsData?.vision_title),
        title_ar: text(cmsData?.vision_title_ar),
        description: blockRichText(cmsData?.vision_description),
        description_ar: blockRichText(cmsData?.vision_description_ar),
      },

      stats: stats.map((item) => ({
        id: item?.id,
        value: text(item?.value),
        value_ar: text(item?.value_ar),
        label: text(item?.label),
        label_ar: text(item?.label_ar),
      })),
    };
  }

  static buildHistorySection(cmsData, history) {
    return {
      title: text(cmsData?.history_title),
      title_ar: text(cmsData?.history_title_ar),
      list: history.map((item) => ({
        id: item?.id,
        year: item?.year ?? "",
        title: text(item?.title),
        title_ar: text(item?.title_ar),
        description: blockRichText(item?.description),
        description_ar: blockRichText(item?.description_ar),
      })),
    };
  }

  static buildMessagesSection(cmsData, associates) {
    return {
      title: text(cmsData?.message_title),
      title_ar: text(cmsData?.message_title_ar),
      sub_title: text(cmsData?.message_subtitle),
      sub_title_ar: text(cmsData?.message_subtitle_ar),
      list: associates.map((item) => ({
        id: item.id,
        quotes: blockRichText(item.quotes),
        quotes_ar: blockRichText(item.quotes_ar),
        name: text(item.name),
        name_ar: text(item.name_ar),
        designation: text(item.designation),
        designation_ar: text(item.designation_ar),
        organization: text(item.Organization),
        organization_ar: text(item.organization_ar),
        media: singleMediaWithoutType(item, "media_path", "media_alt", "media_alt_ar"),
      })),
    };
  }

  static buildCoreValueSection(cmsData, coreValues) {
    return {
      title: text(cmsData?.about_core_title),
      title_ar: text(cmsData?.about_core_title_ar),
      description: blockRichText(cmsData?.about_core_description),
      description_ar: blockRichText(cmsData?.about_core_description_ar),
      media: singleMediaWithoutType(cmsData, "about_core_media_path", "about_core_media_alt", "about_core_media_alt_ar"),
      list: coreValues.map((item) => ({
        id: item?.id,
        title: text(item?.title),
        title_ar: text(item?.title_ar),
        media: singleMediaWithoutType(item, "media_path", "media_alt", "media_alt_ar"),
      })),
    };
  }

  static buildIndustrySection(cmsData, industries) {
    return {
      title: text(cmsData?.industry_title),
      title_ar: text(cmsData?.industry_title_ar),
      description: blockRichText(cmsData?.industry_description),
      description_ar: blockRichText(cmsData?.industry_description_ar),
      media: singleMediaWithoutType(cmsData, "industry_media_path", "industry_media_alt", "industry_media_alt_ar"),
      list: industries.map((item) => ({
        id: item?.id,
        title: text(item?.title),
        title_ar: text(item?.title_ar),
        description: blockRichText(item?.description),
        description_ar: blockRichText(item?.description_ar),
        media: singleMediaWithoutType(item, "media_path", "media_alt", "media_alt_ar"),
      })),
    };
  }
}

module.exports = AboutSectionBuilder;
