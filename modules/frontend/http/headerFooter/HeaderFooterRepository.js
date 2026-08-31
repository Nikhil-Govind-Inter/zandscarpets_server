const { models } = require("../../../../database/models");
const BaseRepository = require("../shared/BaseRepository");

class HeaderFooterRepository {
  constructor() {
    this.headerFooter = new BaseRepository(models.HeaderFooter);
    this.socialMedia = new BaseRepository(models.SocialMedia);
  }

  findCms(options = {}) {
    return this.headerFooter.findOne({}, options);
  }

  findSocialMedia() {
    return this.socialMedia.findAll({
      where: { status: true },
      order: [["sort_order", "ASC"]],
    });
  }
}

module.exports = new HeaderFooterRepository();
