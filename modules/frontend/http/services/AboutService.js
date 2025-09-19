const { models } = require("../../../../database/models");
const { mediaWithType, mediaWithoutType, singleMediaWithType, singleMediaWithoutType, button } = require('../traits/mediaButtonHelper');

class AboutService {
  static async index() {
    try {
      const cmsData = await models.AboutCms.findOne();
      if (!cmsData) {
        throw new Error("No CMS data found for About page");
      }
      const [
        partners = [],
        aboutOurValues = [],
        aboutOurJourney = [],
        associates = [],
        aboutMedia = [],
      ] = await Promise.all([
        models.Partner.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
        models.AboutOurValues.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
        models.AboutOurJourney.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
        models.Associates.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
        models.AboutMedia.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
      ]);

      const data = {
        banner_section: this.buildBannerSection(cmsData),
        about_section: this.buildAboutSection(cmsData),
        learn_more_section: this.buildLearnMoreSection(cmsData),
        mission_vision_section: this.buildMissionVisionSection(cmsData, partners),
        our_values_section: this.buildOurValuesSection(cmsData, aboutOurValues),
        our_journey_section: this.buildOurJourneySection(cmsData, aboutOurJourney),
        meet_team_section: this.buildMeetTeamSection(cmsData),
        our_associates_section: this.buildOurAssociatesSection(cmsData, associates),
        media_recognition_section: this.buildMediaRecognitionSection(cmsData, aboutMedia),
        partner_section: this.buildPartnerSection(cmsData),
      };

      return data;
    } catch (error) {
      throw new Error(`Error fetching about page data: ${error.message}`);
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

  static buildLearnMoreSection(cmsData) {
    return {
      title: cmsData?.learn_more_title ?? "",
      description: cmsData?.learn_more_description ?? "",
      media: singleMediaWithoutType(
        cmsData,
        "learn_more_media_path",
        "learn_more_media_alt",
      ),
    };
  }

  static buildMissionVisionSection(cmsData, partners) {
    return {
      partners_count: cmsData.partners_count || "100+ partners",
      partners_list: partners.map((item) => ({
        name: item?.name ?? "",
        media: singleMediaWithoutType(item, "media_path", "media_alt"),
      })),

      mission: {
        title: cmsData?.our_mission_title ?? "",
        description: cmsData?.our_mission_description ?? "",
      },
      vision: {
        title: cmsData?.our_vision_title ?? "",
        description: cmsData?.our_vision_description ?? "",
      },
      leading_the_game: {
        title: cmsData?.leading_game_title ?? "",
        count: cmsData?.charging_station_count ?? "",
        sub_title: cmsData?.charging_station_subtitle ?? "",
      },
    };
  }


  static buildOurValuesSection(cmsData, aboutOurValues) {
    return {
      title: cmsData?.our_values_title ?? "",
      description: cmsData?.our_values_description ?? "",
      list:
        aboutOurValues.map((item) => ({
          title: item?.title ?? "",
          description: item?.description ?? "",
        })) || [],
    };
  }

  static buildOurJourneySection(cmsData, aboutOurJourney) {
    return {
      title: cmsData?.our_journey_title ?? "",
      description: cmsData?.our_journey_description ?? "",
      list:
        aboutOurJourney.map((item) => ({
          year: item?.year ?? "",
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

  static buildMeetTeamSection(cmsData) {
    return {
      title: cmsData?.meet_team_title ?? "",
      description: cmsData?.meet_team_description ?? "",
      media: singleMediaWithoutType(
        cmsData,
        "meet_team_media_path",
        "meet_team_media_alt",
      ),
    };
  }

  static buildOurAssociatesSection(cmsData, associates) {
    return {
      title: cmsData?.our_associate_title ?? "",
      description: cmsData?.our_associate_description ?? "",
      list: associates.map((item) => ({
        name: item?.name ?? "",
        media: singleMediaWithoutType(item, "media_path", "media_alt"),
      })),
    };
  }

  static buildMediaRecognitionSection(cmsData, aboutMedia) {
    return {
      title: cmsData?.media_title ?? "",
      description: cmsData?.media_description ?? "",
      list: aboutMedia.map((item) => ({
        name: item?.name ?? "",
        thumbnail: singleMediaWithoutType(item, "thumbnail", "thumbnail_alt"),

        media: mediaWithType(
          item,
          "media_type",
          "media_desktop_path",
          "media_mobile_path",
          "media_alt"
        ),
      })),
    };
  }

  static buildPartnerSection(cmsData) {
    return {
      title: cmsData?.contact_us_super_title ?? "",
      description: cmsData?.contact_us_title ?? "",
    };
  }
}

module.exports = AboutService;
