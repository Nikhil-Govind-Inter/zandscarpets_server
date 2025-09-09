const { models } = require("../../../../database/models");
const { createMediaObject, createButtonObject } = require('../traits/mediaButtonHelper');

class HomeService {
  static async index() {
    try {
      const [
        cmsData = {},
        homeBanners = [],
        homeMilestone = [],
        homeMap = [],
        homeExploreOurExpertise = [],
        homeAppFeatures = [],
        homeInvestment = [],
      ] = await Promise.all([
        models.HomeCms.findOne(),
        models.HomeBanner.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
        models.HomeMilestone.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
        models.HomeMap.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
        models.HomeExploreOurExpertise.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
        models.HomeAppFeatures.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
        models.HomeInvestment.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
      ]);

      const data = {
        banner_section: this.buildBannerSection(homeBanners),
        milestone_section: this.buildMilestoneSection(cmsData, homeMilestone),
        company_growth_section: this.buildCompanyGrowthSection(homeMap),
        advertisement_section: this.buildAdvertisementSection(cmsData),
        // explore_section: this.buildExploreSection(cmsData, homeExploreOurExpertise),
        // app_feature_section: this.buildAppFeatureSection(cmsData, homeAppFeatures),
        // investment_section: this.buildInvestmentSection(cmsData, homeInvestment),
      };

      return data;
    } catch (error) {
      throw new Error(`Error fetching home page data: ${error.message}`);
    }
  }

  static buildBannerSection(homeBanners) {
    return {
      list: homeBanners.map((item) => ({
        title: item?.title ?? "",
        description: item?.description ?? "",
        buttons: [
          createButtonObject(item, "button_text_one", "button_text_one_link"),
          createButtonObject(item, "button_text_two", "button_text_two_link"),
        ].filter(btn => btn.text),
        media: createMediaObject(
          item,
          "media_type",
          "media_desktop_path",
          "media_mobile_path",
          "media_alt"
        ),
      })) || [],
    };
  }

  static buildMilestoneSection(cmsData, homeMilestone) {
    return {
      description: cmsData?.milestone_description ?? "",
      list:
        homeMilestone.map((item) => ({
          title: item?.title ?? "",
          value: item?.value ?? "",
        })) || [],
    };
  }

  static buildCompanyGrowthSection(homeMap) {
    return {
      list:
        homeMap.map((item) => ({
          year: item?.year ?? "",
          title: item?.title ?? "",
          media: createMediaObject(
            item,
            "media_path",
            "media_alt"
          ),
        })) || [],
    };
  }

  static buildAdvertisementSection(cmsData) {
    return {
      title: cmsData?.make_ride_title ?? "",
      description: cmsData?.make_ride_description ?? "",
      title: cmsData?.make_ride_title ?? "",
      
    };
  }

  static buildExploreSection(cmsData, homeExploreOurExpertise) {
    return {
      milestone_description: cmsData?.milestone_description ?? "",
      list:
        homeExploreOurExpertise.map((item) => ({
          title: item?.title ?? "",
          description: item?.description ?? "",
        })) || [],
    };
  }

  static buildAppFeatureSection(cmsData, homeAppFeatures) {
    return {
      milestone_description: cmsData?.milestone_description ?? "",
      list:
        homeAppFeatures.map((item) => ({
          title: item?.title ?? "",
          description: item?.description ?? "",
        })) || [],
    };
  }

  static buildInvestmentSection(cmsData, homeInvestment) {
    return {
      milestone_description: cmsData?.milestone_description ?? "",
      list:
        homeInvestment.map((item) => ({
          title: item?.title ?? "",
          description: item?.description ?? "",
        })) || [],
    };
  }
}

module.exports = HomeService;
