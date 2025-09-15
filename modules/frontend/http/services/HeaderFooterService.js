const { models } = require("../../../../database/models");
const { mediaWithType, mediaWithoutType, singleMediaWithType, singleMediaWithoutType, button } = require('../traits/mediaButtonHelper');

class HeaderFooterService {



  static async index() {
    try {
      const cmsData = await models.HeaderFooter.findOne();
      if (!cmsData) {
        throw new Error("No CMS data found for header and footer section");
      }

      const [
        socialMedia = [],
      ] = await Promise.all([
        models.SocialMedia.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
      ]);


      const data = {
        header_section: this.buildHeaderSection(cmsData),
        footer_section: this.buildFooterSection(cmsData, socialMedia),
      };

      return data;
    } catch (error) {
      throw new Error(`Error fetching power of ai page data: ${error.message}`);
    }
  }




  static buildFooterSection(cmsData) {
    return {
      logo: cmsData?.logo ?? '',
      logo_alt: cmsData?.logo_alt ?? '',
      favicon: cmsData?.favicon ?? '',

    };
  }
  static buildHeaderSection(cmsData, socialMedia) {
    return {
      common_section: {
        title: cmsData?.footer_title ?? '',
      },
      footer_logo: cmsData?.footer_logo ?? '',
      footer_logo_alt: cmsData?.logo_alt ?? '',

      location_one: {
        address: cmsData?.location_one_address ?? '',
        email: cmsData?.location_one_email ?? '',
        phone_number: cmsData?.location_one_phone ?? '',
      },

      location_two: {
        address: cmsData?.location_two_address ?? '',
        email: cmsData?.location_two_email ?? '',
        phone_number: cmsData?.location_two_phone ?? '',
      },
      play_store: {
        image: cmsData?.apple_app_store_image ?? '',
        image_alt: cmsData?.apple_app_store_image_alt ?? '',
        image_link: cmsData?.apple_app_store_image_link ?? '',
      },
      apple_store: {
        image: cmsData?.playstore_image ?? '',
        image_alt: cmsData?.playstore_image_alt ?? '',
        image_link: cmsData?.playstore_image_link ?? '',
      },

      social_media_list: socialMedia?.map((item) => ({
        name: item?.name ?? '',
        icon: item?.icon ?? '',
        icon_alt: item?.icon_alt ?? '',
        link: item?.link ?? '',
      })) || [],
    };
  }






}

module.exports = HeaderFooterService;