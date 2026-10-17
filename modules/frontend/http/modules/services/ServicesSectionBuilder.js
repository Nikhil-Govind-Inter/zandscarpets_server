const { singleMediaWithoutType } = require("../../traits/mediaButtonHelper");
const { blockRichText, inlineRichText } = require("../../traits/sectionHelpers");

// Same convention as the home / about APIs: every text field comes back in both languages
// (`title` / `title_ar`) and the storefront picks one by locale. Rich-text fields are sanitized.
const text = (value) => value ?? "";

class ServicesSectionBuilder {
  static buildBannerSection(banner) {
    return {
      title: text(banner[0]?.title),
      title_ar: text(banner[0]?.title_ar),
      sub_title: text(banner[0]?.sub_title),
      sub_title_ar: text(banner[0]?.sub_title_ar),
      media: singleMediaWithoutType(banner[0], "media_path", "media_alt", "media_alt_ar"),
    };
  }

  // Intro text + the industry links (they open the works page filtered by industry)
  static buildIntroductionSection(cmsData, industries) {
    return {
      // headings are authored in a rich-text editor
      title: inlineRichText(cmsData?.title),
      title_ar: inlineRichText(cmsData?.title_ar),
      description: blockRichText(cmsData?.description),
      description_ar: blockRichText(cmsData?.description_ar),
      items: industries.map((item) => ({
        id: item?.id,
        title: text(item?.title),
        title_ar: text(item?.title_ar),
        slug: item?.slug ?? "",
      })),
    };
  }

  static buildServiceSection(cmsData, services) {
    return {
      title: inlineRichText(cmsData?.service_title),
      title_ar: inlineRichText(cmsData?.service_title_ar),
      list: services.map((item) => ({
        id: item?.id,
        title: text(item?.title),
        title_ar: text(item?.title_ar),
        description: blockRichText(item?.description),
        description_ar: blockRichText(item?.description_ar),
      })),
    };
  }

  static buildProcessStepsSection(cmsData, steps) {
    return {
      title: text(cmsData?.process_steps_title),
      title_ar: text(cmsData?.process_steps_title_ar),
      bg_title: text(cmsData?.process_steps_bg_title),
      bg_title_ar: text(cmsData?.process_steps_bg_title_ar),
      list: steps.map((item) => ({
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

module.exports = ServicesSectionBuilder;
