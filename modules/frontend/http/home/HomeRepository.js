const { models } = require("../../../../database/models");
const BaseRepository = require("../shared/BaseRepository");

const orderedActive = { where: { status: true }, order: [["sort_order", "ASC"]] };

class HomeRepository {
  constructor() {
    this.homeCms = new BaseRepository(models.HomeCms);
    this.homeBanner = new BaseRepository(models.HomeBanner);
    this.homeMilestone = new BaseRepository(models.HomeMilestone);
    this.homeMap = new BaseRepository(models.HomeMap);
    this.homeExploreOurExpertise = new BaseRepository(models.HomeExploreOurExpertise);
    this.homeAppFeatures = new BaseRepository(models.HomeAppFeatures);
    this.homeInvestment = new BaseRepository(models.HomeInvestment);
    this.partner = new BaseRepository(models.Partner);
    this.news = new BaseRepository(models.News);
    this.blogs = new BaseRepository(models.Blogs);
  }

  findCms(options = {}) {
    return this.homeCms.findOne({}, options);
  }

  findBanners() {
    return this.homeBanner.findAll(orderedActive);
  }

  findMilestones() {
    return this.homeMilestone.findAll(orderedActive);
  }

  findMap() {
    return this.homeMap.findAll(orderedActive);
  }

  findExploreOurExpertise() {
    return this.homeExploreOurExpertise.findAll(orderedActive);
  }

  findAppFeatures() {
    return this.homeAppFeatures.findAll(orderedActive);
  }

  findInvestment() {
    return this.homeInvestment.findAll(orderedActive);
  }

  findPartners() {
    return this.partner.findAll(orderedActive);
  }

  findNews() {
    return this.news.findAll(orderedActive);
  }

  findBlogs() {
    return this.blogs.findAll(orderedActive);
  }
}

module.exports = new HomeRepository();
