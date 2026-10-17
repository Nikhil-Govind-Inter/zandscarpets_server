const { models } = require("../../../../../database/models");
const { singleMediaWithType, singleMediaWithoutType } = require("../../traits/mediaButtonHelper");

// Sections driven by the Common Items admin (content + features + how it works).
// Shared by the home and about APIs so there is a single copy of the shapes.
const commonListAttributes = ["id", "title", "title_ar", "description", "description_ar", "sort_order"];
const orderedActive = { where: { is_active: true }, order: [["sort_order", "ASC"]] };

class CommonSections {
  // One round trip batch for everything the three sections need
  static async fetch() {
    const [commonContent, features = [], howItWorks = []] = await Promise.all([
      models.CommonContent.findOne({}),
      models.CommonFeatures.findAll({ ...orderedActive, attributes: commonListAttributes }),
      models.CommonHowItWorks.findAll({ ...orderedActive, attributes: commonListAttributes }),
    ]);
    return { commonContent, features, howItWorks };
  }

  static buildFeaturesSection(features, commonContent) {
    return {
      title: commonContent?.why_choose_title ?? "",
      title_ar: commonContent?.why_choose_title_ar ?? "",
      list: features.map((item) => ({
        id: item?.id,
        title: item?.title ?? "",
        title_ar: item?.title_ar ?? "",
        description: item?.description ?? "",
        description_ar: item?.description_ar ?? "",
      })),
    };
  }

  static buildHowItWorksSection(howItWorks, commonContent) {
    return {
      title: commonContent?.how_section_title ?? "",
      title_ar: commonContent?.how_section_title_ar ?? "",
      bg_title: commonContent?.how_section_bg_title ?? "",
      bg_title_ar: commonContent?.how_section_bg_title_ar ?? "",
      media: singleMediaWithType(commonContent ?? {}, "how_section_media_type", "how_section_media_path"),
      thumbnail: singleMediaWithoutType(commonContent ?? {}, "how_section_thumbnail"),
      list: howItWorks.map((item) => ({
        id: item?.id,
        title: item?.title ?? "",
        title_ar: item?.title_ar ?? "",
        description: item?.description ?? "",
        description_ar: item?.description_ar ?? "",
      })),
    };
  }

  static buildSideSection(commonContent) {
    return {
      title: commonContent?.side_section_title ?? "",
      title_ar: commonContent?.side_section_title_ar ?? "",
      description: commonContent?.side_section_description ?? "",
      description_ar: commonContent?.side_section_description_ar ?? "",
      button: {
        text: commonContent?.button_text ?? "",
        text_ar: commonContent?.button_text_ar ?? "",
        link: commonContent?.button_link ?? "#",
      },
    };
  }
}

module.exports = CommonSections;
