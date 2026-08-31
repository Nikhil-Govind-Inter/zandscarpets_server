const PolicyRepository = require("./PolicyRepository");
const { mediaWithoutType } = require('../traits/mediaButtonHelper');

class PolicyService {
  static async index(slug) {
    const cmsData = await PolicyRepository.findBySlug(slug);

    if (!cmsData) {
      throw new Error(`No CMS data found for slug: ${slug}`);
    }

    const data = {
      banner_section: this.buildBannerSection(cmsData),
      content: this.buildContentSection(cmsData),
    };

    return data;
  }

  static buildBannerSection(cmsData) {
    return {
      banner_title: cmsData?.banner_title ?? "",
      media: mediaWithoutType(
        cmsData,
        "banner_media_desktop_path",
        "banner_media_mobile_path",
        "banner_media_alt"
      ),
    };
  }

  static buildContentSection(cmsData) {
    return {
      title: cmsData?.title ?? "",
      description: cmsData?.description ?? "",
    };
  }
}

module.exports = PolicyService;
