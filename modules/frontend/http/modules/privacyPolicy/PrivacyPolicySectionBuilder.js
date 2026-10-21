const { t } = require("../../traits/localeHelper");
const { articleRichText } = require("../../traits/sectionHelpers");

class PrivacyPolicySectionBuilder {
  static buildContentSection(cmsData, lang) {
    return {
      title: t(lang, cmsData?.title, cmsData?.title_ar),
      content: articleRichText(t(lang, cmsData?.content, cmsData?.content_ar)),
    };
  }
}

module.exports = PrivacyPolicySectionBuilder;
