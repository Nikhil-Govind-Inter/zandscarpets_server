const sequelize = require("../config/index");

const defineAdminUser = require("./admin/adminuser");
const defineAdminRefreshToken = require("./admin/adminRefreshToken");
const defineSiteSettings = require("./siteSettings/siteSettings");
const defineSocialMedia = require("./siteSettings/socialMedia");
const defineMetaData  = require("./siteSettings/metaData");
const defineFooterMedia = require("./siteSettings/footerMedia")
const definePage = require("./masters/page");
const defineBanners = require("./siteSettings/banners");
const defineAdsBanner = require("./masters/AdsBanner");
const defineFaqs = require("./masters/faqs");
const defineIndustry = require("./masters/industry");
const defineOurFeatures = require("./masters/ourFeatures");
const defineWorkPlan = require("./masters/workPlan");
const defineHomeCms = require("./home/homeCms");
const defineHomeBanner = require("./home/homeBanner");
const defineHomeMilestones = require("./home/homeMilestones");
const defineHomeBrands = require("./home/homeBrands");
const defineHomeTestimonials = require("./home/homeTestimonials");
const defineAboutCms = require("./about/aboutCms");
const defineCoreValues = require("./about/coreValues");
const defineHistory = require("./about/history");
const defineMessages = require("./about/messages");

const models = {
  AdminUser: defineAdminUser(sequelize),
  AdminRefreshToken: defineAdminRefreshToken(sequelize),
  SiteSettings: defineSiteSettings(sequelize),
  SocialMedia: defineSocialMedia(sequelize),
  FooterMedia: defineFooterMedia(sequelize),
  MetaData:  defineMetaData(sequelize),
  Page: definePage(sequelize),
  Banners: defineBanners(sequelize),
  AdsBanner: defineAdsBanner(sequelize),
  Faqs: defineFaqs(sequelize),
  Industry: defineIndustry(sequelize),
  OurFeatures: defineOurFeatures(sequelize),
  WorkPlan: defineWorkPlan(sequelize),
  HomeCms: defineHomeCms(sequelize),
  HomeBanner: defineHomeBanner(sequelize),
  HomeMilestones: defineHomeMilestones(sequelize),
  HomeBrands: defineHomeBrands(sequelize),
  HomeTestimonials: defineHomeTestimonials(sequelize),
  AboutCms: defineAboutCms(sequelize),
  CoreValues: defineCoreValues(sequelize),
  History: defineHistory(sequelize),
  Messages: defineMessages(sequelize),
};



Object.keys(models).forEach((modelName) => {
  if ("associate" in models[modelName]) {
    console.log("Associating", modelName);
    models[modelName].associate(models);
  }
});

module.exports = { sequelize, models };
