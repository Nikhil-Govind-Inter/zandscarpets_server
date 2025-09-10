const { models } = require("../../../../database/models");

class AboutService {
  static async index() {
    try {
      const [
        cmsData = {}, 
        homeBanners = []
      ] = await Promise.all([
        models..findOne(),
        models.HomeBanner.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
      ]);

      const data = {
        banner_section: this.buildBannerSection(cmsData, homeBanners),
        section_two: this.buildSectionTwo(cmsData, homeBanners),
        learn_more_section: this.buildLearnMoreSection(cmsData, homeBanners),
        mission_vision_section: this.buildMissionVisionSection(cmsData, homeBanners),
        our_values_section: this.buildOurValuesSection(cmsData, homeBanners),
        our_journey_section: this.buildOurJourneySection(cmsData, homeBanners),
        meet_team_section: this.buildMeetTeamSection(cmsData, homeBanners),
        our_associates_section: this.buildOurAssociatesSection(cmsData, homeBanners),
        media_recognition_section: this.buildMediaRecognitionSection(cmsData, homeBanners),
        partner_section: this.buildPartnerSection(cmsData, homeBanners),
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

module.exports = AboutService;
