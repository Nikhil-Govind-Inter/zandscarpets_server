const { models } = require("../../../../database/models");
const {
  mediaWithType,
  mediaWithoutType,
  singleMediaWithType,
  singleMediaWithoutType,
  button,
} = require("../traits/mediaButtonHelper");

class HomeService {
  static async index() {
    try {
      const cmsData = await models.HomeCms.findOne();
      if (!cmsData) {
        throw new Error("No CMS data found for About page");
      }
      const [
        homeBanners = [],
        homeMilestone = [],
        homeMap = [],
        homeExploreOurExpertise = [],
        homeAppFeatures = [],
        homeInvestment = [],
        partners = [],
        news = [],
        blogs = [],
      ] = await Promise.all([
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
        models.Partner.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
        models.News.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
        models.Blogs.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
      ]);


      const data = {
        banner_section: this.buildBannerSection(homeBanners),
        milestone_section: this.buildMilestoneSection(cmsData, homeMilestone),
        company_growth_section: this.buildCompanyGrowthSection(homeMap),
        make_ride_section: this.buildMakeRideSection(cmsData),
        explore_section: this.buildExploreSection(
          cmsData,
          homeExploreOurExpertise
        ),
        app_feature_section: this.buildAppFeatureSection(
          cmsData,
          homeAppFeatures
        ),
        investment_section: this.buildInvestmentSection(
          cmsData,
          homeInvestment
        ),
        partners_section: this.buildPartnersSection(cmsData, partners),
        news_section: this.buildNewsSection(cmsData, news),
        blog_section: this.buildBlogSection(cmsData, blogs),
      };

      return data;
    } catch (error) {
      throw new Error(`Error fetching home page data: ${error.message}`);
    }
  }

  static buildBannerSection(homeBanners) {
    return {
      list:
        homeBanners.map((item) => ({
          title: item?.title ?? "",
          description: item?.description ?? "",
          buttons: [
            button(item, "button_text_one", "button_text_one_link"),
            button(item, "button_text_two", "button_text_two_link"),
          ].filter((btn) => btn.text),
          media: mediaWithType(
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
          media: singleMediaWithoutType(item, "media_path", "media_alt"),
        })) || [],
    };
  }

  static buildMakeRideSection(cmsData) {
    return {
      title: cmsData?.make_ride_title ?? "",
      highlight_title: cmsData?.make_ride_highlight_title ?? "",
      description: cmsData?.make_ride_description ?? "",
      media: mediaWithType(
        cmsData,
        "make_ride_media_type",
        "make_ride_media_desktop_path",
        "make_ride_media_mobile_path",
        "make_ride_media_alt"
      ),
    };
  }

  static buildExploreSection(cmsData, homeExploreOurExpertise) {
    return {
      title: cmsData?.explore_title ?? "",
      description: cmsData?.explore_description ?? "",
      list:
        homeExploreOurExpertise.map((item) => ({
          title: item?.title ?? "",
          description: item?.description ?? "",
          buttons: [button(item, "button_text", "button_text_link")].filter(
            (btn) => btn.text
          ),
          media: singleMediaWithoutType(item, "media_path", "media_alt"),
        })) || [],
    };
  }

  static buildAppFeatureSection(cmsData, homeAppFeatures) {
    return {
      title: cmsData?.app_feature_title ?? "",
      sub_title: cmsData?.app_feature_sub_title ?? "",
      description: cmsData?.app_feature_description ?? "",
      hand_image: cmsData?.app_feature_hand_image ?? "",
      hand_image_alt: cmsData?.app_feature_hand_image_alt ?? "",
      hand_video: cmsData?.app_feature_hand_video ?? "",
      hand_video_alt: cmsData?.app_feature_hand_video_alt ?? "",
      list:
        homeAppFeatures.map((item) => ({
          title: item?.title ?? "",
          icon: item?.icon ?? "",
          icon_alt: item?.icon_alt ?? "",
        })) || [],
    };
  }

  static buildInvestmentSection(cmsData, homeInvestment) {
    return {
      milestone_description: cmsData?.investment_title ?? "",
      media: mediaWithType(
        cmsData,
        "investment_media_type",
        "investment_media_desktop_path",
        "investment_media_mobile_path",
        "investment_media_alt"
      ),
      list:
        homeInvestment.map((item) => ({
          title: item?.title ?? "",
          subtitle: item?.subtitle ?? "",
          description: item?.description ?? "",
          buttons: [button(item, "button_text", "button_text_link")].filter(
            (btn) => btn.text
          ),
        })) || [],
    };
  }

  static buildPartnersSection(cmsData, partners) {
    return {
      title: cmsData?.partners_title ?? "",
      list:
        partners.map((item) => ({
          name: cmsData?.name ?? "",
          media: singleMediaWithoutType(item, "media_path", "media_alt"),
        })) || [],
    };
  }

  static buildNewsSection(cmsData, news) {
    return {
      title: cmsData?.news_title ?? "",
      list:
        news.map((item) => ({
          title: item?.title ?? "",
          slug: item?.slug ?? "",
          description: item?.description ?? "",
          reading_time: item?.reading_time ?? "",
          published_on: item?.published_on ?? "",
          media: singleMediaWithoutType(item, "thumbnail", "thumbnail_alt"),
        })) || [],
    };
  }

  static buildBlogSection(cmsData, blogs) {
    return {
      title: cmsData?.blog_title ?? "",
      list:
        blogs.map((item) => ({
          title: item?.title ?? "",
          slug: item?.slug ?? "",
          description: item?.description ?? "",
          published_on: item?.published_on ?? "",
          media: singleMediaWithoutType(item, "thumbnail", "thumbnail_alt"),
        })) || [],
    };
  }
}

module.exports = HomeService;
