const { models } = require("../../../../database/models");
const { mediaWithType, mediaWithoutType, singleMediaWithType, singleMediaWithoutType, button } = require('../traits/mediaButtonHelper');

class InvestInGoEcService {

  static async index() {
    try {
      const cmsData = await models.InvestInGoEcCms.findOne();
      if (!cmsData) {
        throw new Error("No CMS data found for Invest in go ec page");
      }
      const [
        investInGoEcExplore = [],
        investInGoEcFeatures = [],
        investInGoEcMilestone = [],
        investInGoEcPartners = [],
      ] = await Promise.all([
        models.InvestInGoEcExplore.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
        models.InvestInGoEcFeatures.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
        models.InvestInGoEcMilestone.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
        models.InvestInGoEcPartners.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
      ]);

      const data = {
        banner_section: this.buildBannerSection(cmsData),
        about_section: this.buildAboutSection(cmsData),
        growth_section: this.buildGrowthSection(cmsData),
        explore_section: this.buildExploreSection(cmsData, investInGoEcExplore),
        why_invest_section: this.buildWhyInvestSection(cmsData, investInGoEcFeatures, investInGoEcMilestone),
        testimonial_section: this.buildTestimonialSection(cmsData, investInGoEcPartners),
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
      media: mediaWithType(
        cmsData,
        "about_media_type",
        "about_media_desktop_path",
        "about_media_mobile_path",
        "about_media_alt"
      ),
    };
  }

  static buildGrowthSection(cmsData) {
    return {
      title: cmsData?.growth_title ?? "",
      description: cmsData?.growth_description ?? "",
      media: mediaWithoutType(
        cmsData,
        "growth_media_desktop_path",
        "growth_media_mobile_path",
        "growth_media_alt"
      ),
    };
  }

  static buildExploreSection(cmsData, investInGoEcExplore) {
    return {
      title: cmsData?.explore_title ?? "",
      list:
        investInGoEcExplore.map((item) => ({
          name: item?.name ?? "",
          title: item?.title ?? "",
          description: item?.description ?? "",
          points: item?.points,
          media: mediaWithoutType(
            item,
            "media_desktop_path",
            "media_mobile_path",
            "media_alt"
          ),
        })) || [],
    };
  }

  static buildWhyInvestSection(cmsData, investInGoEcFeatures, investInGoEcMilestone) {
    return {
      title: cmsData?.why_invest_title ?? "",
      description: cmsData?.why_invest_description ?? "",
      media: mediaWithoutType(
        cmsData,
        "why_invest_media_desktop_path",
        "why_invest_media_mobile_path",
        "why_invest_media_alt"
      ),
      milestone_list:
        investInGoEcMilestone.map((item) => ({
          value: item?.value ?? "",
          prefix: item?.prefix ?? "",
          subtitle: item?.subtitle ?? "",
        })) || [],
      feature_list:
        investInGoEcFeatures.map((item) => ({
          description: item?.description ?? "",
          media: singleMediaWithoutType(
            item,
            "icon_path",
            "icon_alt"
          ),
        })) || [],
    };
  }


  static buildTestimonialSection(cmsData, investInGoEcPartners) {
    return {
      title: cmsData?.partners_title ?? "",
      list:
        investInGoEcPartners.map((item) => ({
          name: item?.name ?? "",
          designation: item?.designation ?? "",
          description: item?.description ?? "",
          media: singleMediaWithoutType(
            item,
            "profile_media_path",
            "profile_media_alt"
          ),
        })) || [],

    };
  }

  static buildStartUrEvSection(cmsData) {
    return {
      title: cmsData?.invest_in_goec_title ?? "",
      media: singleMediaWithoutType(
        cmsData,
        "invest_in_goec_media_path",
        "invest_in_goec_media_alt"
      ),
    };
  }
}

module.exports = InvestInGoEcService;
