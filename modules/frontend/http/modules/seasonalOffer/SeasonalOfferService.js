const { models } = require("../../../../../database/models");
const SeasonalOfferSectionBuilder = require("./SeasonalOfferSectionBuilder");

class SeasonalOfferService {
  static async index() {
    const cmsData = await models.SeasonalOffer.findOne({});
    const data = SeasonalOfferSectionBuilder.build(cmsData);
    return { data };
  }
}

module.exports = SeasonalOfferService;
