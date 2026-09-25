const {
  mediaWithoutType,
  singleMediaWithoutType,
} = require("../../traits/mediaButtonHelper");

const { t, localizeMedia } = require("../../traits/localeHelper");

class ContactSectionBuilder {
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

  static buildContactDetailSection(cmsData, connections, socialMedia, lang) {
    return {
      title: t(lang, cmsData?.title, cmsData?.title_ar),
      description: t(lang, cmsData?.description, cmsData?.description_ar),
      form_title: t(lang, cmsData?.form_title, cmsData?.form_title_ar),
      map_url: cmsData?.map_url ?? "",

      items: connections.map((item) => ({
        title: t(lang, item?.title, item?.title_ar),
        description: t(lang, item?.description, item?.description_ar),
        content: t(lang, item?.content, item?.content_ar),
        media: localizeMedia(
          singleMediaWithoutType(
            item,
            "icon_media_path",
            "icon_media_alt",
            "icon_media_alt_ar",
          ),
          lang,
        ),
      })),

      social_media_title: t(
        lang,
        cmsData?.social_media_title,
        cmsData?.social_media_title_ar,
      ),
      social_media: socialMedia.map((item) => ({
        link: item?.link ?? "",
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
}

module.exports = ContactSectionBuilder;
