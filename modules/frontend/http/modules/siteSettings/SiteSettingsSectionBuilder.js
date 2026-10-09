const { singleMediaWithoutType } = require("../../traits/mediaButtonHelper");
const { t, localizeMedia } = require("../../traits/localeHelper");

class SiteSettingsSectionBuilder {
  static buildHeader(cmsData, lang) {
    return {
      logo: localizeMedia(
        singleMediaWithoutType(
          cmsData,
          "header_logo_media_path",
          "header_logo_media_alt",
          "header_logo_media_alt_ar",
        ),
        lang,
      ),
    };
  }

  static buildFooter(cmsData, lang, socialMedia = [], footerMedia = []) {
    return {
      logo: localizeMedia(
        singleMediaWithoutType(
          cmsData,
          "footer_logo_media_path",
          "footer_logo_media_alt",
          "footer_logo_media_alt_ar",
        ),
        lang,
      ),
      address: t(lang, cmsData?.address, cmsData?.address_ar),
      email: cmsData?.email ?? "",
      phone: cmsData?.phone_number ?? "",
      whatsapp_number: cmsData?.whatsapp_number ?? "",

      social_media: socialMedia.map((item) => ({
        media: this.buildMedia(item, lang, "footer_media_path"),
        link: item?.link ?? "",
      })),

      footer_media: footerMedia.map((item) => ({
        media: this.buildMedia(item, lang),
      })),
    };
  }

  static buildFloatingButtons(icons, lang) {
    return icons.map((item) => ({
      icon: localizeMedia(
        singleMediaWithoutType(item, "media_path", "media_alt", "media_alt_ar"),
        lang,
      ),
      link: item?.link ?? "",
    }));
  }

  static buildMedia(item, lang, pathKey = "media_path", fallbackPathKey) {
    const key = item?.[pathKey] || !fallbackPathKey ? pathKey : fallbackPathKey;
    const { path, alt } = localizeMedia(
      singleMediaWithoutType(item, key, "media_alt", "media_alt_ar"),
      lang,
    );
    return { media_path: path, media_alt: alt };
  }
}

module.exports = SiteSettingsSectionBuilder;
