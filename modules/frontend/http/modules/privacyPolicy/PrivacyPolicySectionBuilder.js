const {
  mediaWithoutType,
  singleMediaWithoutType,
} = require("../../traits/mediaButtonHelper");

const { t,  } = require("../../traits/localeHelper");

class PrivacyPolicySectionBuilder {
  static buildContentSection(cmsData, lang) {
    return {
      title: t(lang, cmsData?.title, cmsData?.title_ar),
      content: t(lang, cmsData?.content, cmsData?.content_ar),
    };
  }
}

module.exports = PrivacyPolicySectionBuilder;
