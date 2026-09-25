const { singleMediaWithoutType } = require("../../traits/mediaButtonHelper");

const { t, localizeMedia } = require("../../traits/localeHelper");

// Localized single media in the `{ media_path, media_alt }` shape.
const buildMedia = (data, pathKey, altKey, altArKey, lang) => {
  const media = localizeMedia(
    singleMediaWithoutType(data ?? {}, pathKey, altKey, altArKey),
    lang,
  );
  return { media_path: media.path, media_alt: media.alt };
};

class ServicesSectionBuilder {
  static buildBannerSection(banner, lang) {
    return {
      title: t(lang, banner[0]?.title, banner[0]?.title_ar),
      sub_title: t(lang, banner[0]?.sub_title, banner[0]?.sub_title_ar),
      media: buildMedia(
        banner[0],
        "media_path",
        "media_alt",
        "media_alt_ar",
        lang,
      ),
    };
  }

  static buildIntroductionSection(cmsData, industries, lang) {
    return {
      title: t(lang, cmsData?.title, cmsData?.title_ar),
      description: t(lang, cmsData?.description, cmsData?.description_ar),
      items: industries.map((item) => ({
        title: t(lang, item?.title, item?.title_ar),
        slug: item?.slug ?? "",
      })),
    };
  }

  static buildServiceSection(cmsData, services, lang) {
    return {
      title: t(lang, cmsData?.service_title, cmsData?.service_title_ar),
      features: services.map((item) => ({
        title: t(lang, item?.title, item?.title_ar),
        content: t(lang, item?.description, item?.description_ar),
      })),
    };
  }

  static buildProcessStepsSection(cmsData, steps, lang) {
    return {
      title: t(
        lang,
        cmsData?.process_steps_title,
        cmsData?.process_steps_title_ar,
      ),
      items: steps.map((item) => ({
        media: buildMedia(item, "media_path", "media_alt", "media_alt_ar", lang),
        title: t(lang, item?.title, item?.title_ar),
        description: t(lang, item?.description, item?.description_ar),
      })),
    };
  }
}

module.exports = ServicesSectionBuilder;
