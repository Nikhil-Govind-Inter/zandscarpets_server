const { models } = require("../../../../database/models");
const { mediaWithType, mediaWithoutType, singleMediaWithType, singleMediaWithoutType, button } = require('../traits/mediaButtonHelper');

class HeaderFooterService {

   

    static async index() {
    try {
      const [
        cmsData = {},
        homeBanner = [],
      ] = await Promise.all([
        models.HomeCms.findOne(),
        models.HomeBanner.findAll({
          where: { status: true },
          order: [["sort_order", "ASC"]],
        }),
      ]);

      const aboutData = {
        home_banner: this.buildBannerSection(cmsData, homeBanner),
      };

      return aboutData;
    } catch (error) {
      throw new Error(`Error fetching power of ai page data: ${error.message}`);
    }
  }


 

  static buildBannerSection(cmsData, homeBanner) {
    return {
      milestone_description: cmsData?.milestone_description ?? '',
      list: homeBanner.map((item) => ({
        title: item?.title ?? '',
        description: item?.description ?? '',
      })) || [],
    };
  }


    
}

module.exports = HeaderFooterService;