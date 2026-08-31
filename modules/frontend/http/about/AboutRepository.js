const { models } = require("../../../../database/models");
const BaseRepository = require("../shared/BaseRepository");

const orderedActive = { where: { status: true }, order: [["sort_order", "ASC"]] };

class AboutRepository {
  constructor() {
    this.aboutCms = new BaseRepository(models.AboutCms);
    this.partner = new BaseRepository(models.Partner);
    this.aboutOurValues = new BaseRepository(models.AboutOurValues);
    this.aboutOurJourney = new BaseRepository(models.AboutOurJourney);
    this.associates = new BaseRepository(models.Associates);
    this.aboutMedia = new BaseRepository(models.AboutMedia);
  }

  findCms(options = {}) {
    return this.aboutCms.findOne({}, options);
  }

  findPartners() {
    return this.partner.findAll(orderedActive);
  }

  findOurValues() {
    return this.aboutOurValues.findAll(orderedActive);
  }

  findOurJourney() {
    return this.aboutOurJourney.findAll(orderedActive);
  }

  findAssociates() {
    return this.associates.findAll(orderedActive);
  }

  findMedia() {
    return this.aboutMedia.findAll(orderedActive);
  }
}

module.exports = new AboutRepository();
