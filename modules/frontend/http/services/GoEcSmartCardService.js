const { models } = require("../../../../database/models");
const { mediaWithType, mediaWithoutType, singleMediaWithType, singleMediaWithoutType, button } = require('../traits/mediaButtonHelper');

class GoEcSmartCardService {
  static async index() {
    try {
      const cmsData = await models.GoEcSmartCardCms.findOne();
      if (!cmsData) {
        throw new Error("No CMS data found for Invest in go ec page");
      }
      const [
        goEcSmartCardKeyBenefits = [],
        goEcSmartCardApplyStep = [],
      ] = await Promise.all([
        models.GoEcSmartCardKeyBenefits.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
        models.GoEcSmartCardApplyStep.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
      ]);

      const data = {
        banner_section: this.buildBannerSection(cmsData),
        about_section: this.buildAboutSection(cmsData),
        key_benefit_section: this.buildKeyBenefitSection(cmsData, goEcSmartCardKeyBenefits),
        get_the_goec_section: this.buildGetTheGoecSection(cmsData, goEcSmartCardApplyStep),
        get_ur_ev_section: this.buildGetUrEvSection(cmsData),
      };

      return data;
    } catch (error) {
      throw new Error(`Error fetching home page data: ${error.message}`);
    }
  }

  static buildBannerSection(cmsData) {
    return {
      title: cmsData?.banner_title ?? "",
      media: mediaWithoutType(
        cmsData,
        "banner_media_desktop_path",
        "banner_media_mobile_path",
        "banner_media_alt"
      ),
    };
  }

  static buildAboutSection(cmsData) {
    return {
      description: cmsData?.about_description ?? "",
    };
  }

  static buildKeyBenefitSection(cmsData, goEcSmartCardKeyBenefits) {
    return {
      title: cmsData?.key_benefits_title ?? "",
      list:
        goEcSmartCardKeyBenefits.map((item) => ({
          title: item?.title ?? "",
          description: item?.description ?? "",
        })) || [],
    };
  }

  static buildGetTheGoecSection(cmsData, goEcSmartCardApplyStep) {
    return {
      title: cmsData?.card_apply_steps_title ?? "",
      description: cmsData?.card_apply_steps_description ?? "",
      list:
        goEcSmartCardApplyStep.map((item) => ({
          title: item?.title ?? "",
          description: item?.description ?? "",
          media: singleMediaWithoutType(
            cmsData,
            "media_path",
            "media_alt",
          ),
        })) || [],
    };
  }

  static buildGetUrEvSection(cmsData) {
    return {
      title: cmsData?.get_your_ev_title ?? "",
    };
  }

  
}

module.exports = GoEcSmartCardService;
