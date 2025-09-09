const { models } = require("../../../../database/models");

class GoEcSmartCardService {
  static async index() {
    try {
      const [cmsData = {}, homeBanners = []] = await Promise.all([
        models.HomeCms.findOne(),
        models.HomeBanner.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
      ]);

      const data = {
        banner_section: this.buildBannerSection(cmsData, homeBanners),
        milestone_section: this.buildMilestoneSection(cmsData, homeBanners),
        company_growth_section: this.buildCompanyGrowthSection(cmsData, homeBanners),
        advertisement_section: this.buildAdvertisementSection(cmsData, homeBanners),
        explore_section: this.buildExploreSection(cmsData, homeBanners),
        app_feature_section: this.buildAppFeatureSection(cmsData, homeBanners),
        investment_section: this.buildInvestmentSection(cmsData, homeBanners),
      };

      return data;
    } catch (error) {
      throw new Error(`Error fetching home page data: ${error.message}`);
    }
  }

  static buildBannerSection(cmsData, homeBanners) {
    return {
      milestone_description: cmsData?.milestone_description ?? "",
      list:
        homeBanners.map((item) => ({
          title: item?.title ?? "",
          description: item?.description ?? "",
        })) || [],
    };
  }

  static buildMilestoneSection(cmsData, homeBanners) {
    return {
      milestone_description: cmsData?.milestone_description ?? "",
      list:
        homeBanners.map((item) => ({
          title: item?.title ?? "",
          description: item?.description ?? "",
        })) || [],
    };
  }

  static buildCompanyGrowthSection(cmsData, homeBanners) {
    return {
      milestone_description: cmsData?.milestone_description ?? "",
      list:
        homeBanners.map((item) => ({
          title: item?.title ?? "",
          description: item?.description ?? "",
        })) || [],
    };
  }

  static buildAdvertisementSection(cmsData, homeBanners) {
    return {
      milestone_description: cmsData?.milestone_description ?? "",
      list:
        homeBanners.map((item) => ({
          title: item?.title ?? "",
          description: item?.description ?? "",
        })) || [],
    };
  }

  static buildExploreSection(cmsData, homeBanners) {
    return {
      milestone_description: cmsData?.milestone_description ?? "",
      list:
        homeBanners.map((item) => ({
          title: item?.title ?? "",
          description: item?.description ?? "",
        })) || [],
    };
  }

  static buildAppFeatureSection(cmsData, homeBanners) {
    return {
      milestone_description: cmsData?.milestone_description ?? "",
      list:
        homeBanners.map((item) => ({
          title: item?.title ?? "",
          description: item?.description ?? "",
        })) || [],
    };
  }

  static buildInvestmentSection(cmsData, homeBanners) {
    return {
      milestone_description: cmsData?.milestone_description ?? "",
      list:
        homeBanners.map((item) => ({
          title: item?.title ?? "",
          description: item?.description ?? "",
        })) || [],
    };
  }
}

module.exports = GoEcSmartCardService;
