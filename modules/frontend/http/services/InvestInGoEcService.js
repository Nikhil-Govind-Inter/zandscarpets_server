const { models } = require("../../../../database/models");

class InvestInGoEcService {

  static async index() {
    try {
      const cmsData = await models.AppPageCms.findOne();
      if (!cmsData) {
        throw new Error("No CMS data found for About page");
      }
      const [
        appPageFeatures = [],
        appPageChargeUrEv = []
      ] = await Promise.all([
        models.AppPageFeatures.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
        models.AppPageChargeUrEv.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
      ]);

      const data = {
        banner_section: this.buildBannerSection(cmsData),
        about_section: this.buildAboutSection(cmsData),
        advertisment_section: this.buildAdvertismentSection(cmsData, appPageFeatures),
        explore_section: this.buildExploreSection(cmsData, appPageChargeUrEv),
        why_invest_section: this.buildStartUrEvSection(cmsData),
        testimonial_section: this.buildStartUrEvSection(cmsData),
        invest_in_goec_section: this.buildStartUrEvSection(cmsData),
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

  static buildFeatureSection(cmsData, appPageFeatures) {
    return {
      title: cmsData?.feature_title ?? "",
      list:
        appPageFeatures.map((item) => ({
          title: item?.title ?? "",
          highlight_title: item?.highlight_title ?? "",
          image_one_path: item?.image_one_path ?? "",
          image_two_path: item?.image_two_path ?? "",
        })) || [],
    };
  }

  static buildHowToChargeSection(cmsData, appPageChargeUrEv) {
    return {
      title: cmsData?.charge_ur_ev_title ?? "",
      list:
        appPageChargeUrEv.map((item) => ({
          title: item?.title ?? "",
          description: item?.description ?? "",
          media: singleMediaWithoutType(
            item,
            "media_path",
            "media_alt",
          ),
        })) || [],
    };
  }

  static buildStartUrEvSection(cmsData) {
    return {
      title: cmsData?.start_ur_journey_title ?? "",
      media: singleMediaWithoutType(
        cmsData,
        "start_ur_journey_media_path",
        "start_ur_journey_media_alt",
      ),
    };
  }
}

module.exports = InvestInGoEcService;
