const { singleMediaWithoutType } = require("../../traits/mediaButtonHelper");
const { extractMapEmbedUrl } = require("../../../../../utils/googleMapsEmbed");
const { blockRichText, inlineRichText, stripHtml } = require("../../traits/sectionHelpers");

// Same convention as the home / about APIs: every text field comes back in both languages
// (`title` / `title_ar`) and the storefront picks one by locale. Rich-text fields are sanitized.
const text = (value) => value ?? "";

// phone / email / office cards, stored as fixed column groups on the contact CMS row
const DETAIL_CARDS = [
  { key: "phone", hasValueAr: false },
  { key: "email", hasValueAr: false },
  { key: "office", hasValueAr: true },
];

class ContactSectionBuilder {
  static buildBannerSection(banner) {
    return {
      title: text(banner[0]?.title),
      title_ar: text(banner[0]?.title_ar),
      sub_title: text(banner[0]?.sub_title),
      sub_title_ar: text(banner[0]?.sub_title_ar),
      media: singleMediaWithoutType(banner[0], "media_path", "media_alt", "media_alt_ar"),
    };
  }

  static buildContactDetailSection(cmsData) {
    const items = DETAIL_CARDS.map(({ key, hasValueAr }) => ({
      key,
      title: text(cmsData?.[`${key}_title`]),
      title_ar: text(cmsData?.[`${key}_title_ar`]),
      description: blockRichText(cmsData?.[`${key}_description`]),
      description_ar: blockRichText(cmsData?.[`${key}_description_ar`]),
      // phone / email values are the same in both languages; the office address has an Arabic version
      value: key === "office" ? inlineRichText(cmsData?.office_value) : text(cmsData?.[`${key}_value`]),
      value_ar: hasValueAr ? inlineRichText(cmsData?.office_value_ar) : "",
      media: singleMediaWithoutType(cmsData, `${key}_icon_media_path`, `${key}_icon_media_alt`, `${key}_icon_media_alt_ar`),
    })).filter((item) => stripHtml(item.value) || stripHtml(item.value_ar));

    const title = text(cmsData?.title);
    const titleAr = text(cmsData?.title_ar);
    const description = blockRichText(cmsData?.description);
    const descriptionAr = blockRichText(cmsData?.description_ar);

    return {
      title,
      title_ar: titleAr,
      description,
      description_ar: descriptionAr,
      items,
      is_visible: Boolean(stripHtml(title) || stripHtml(titleAr) || stripHtml(description) || stripHtml(descriptionAr) || items.length),
    };
  }

  static buildSocialSection(cmsData, socialMedia) {
    return {
      title: text(cmsData?.social_media_title),
      title_ar: text(cmsData?.social_media_title_ar),
      list: socialMedia.map((item) => ({
        id: item?.id,
        link: item?.link ?? "",
        media: singleMediaWithoutType(item, "media_path", "media_alt", "media_alt_ar"),
      })),
    };
  }

  static buildFormSection(cmsData) {
    return {
      title: text(cmsData?.form_title),
      title_ar: text(cmsData?.form_title_ar),
    };
  }

  static buildMapSection(cmsData) {
    const url = extractMapEmbedUrl(cmsData?.map_url);
    return { url, is_visible: Boolean(url) };
  }
}

module.exports = ContactSectionBuilder;
