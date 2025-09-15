const sequelize = require("../config/index");

const defineAdminUser = require("./adminuser");
const defineMetaTags = require("./metaTags");
const definePolicy = require("./policy");
const definePartner = require("./partner");
const defineAssociates = require("./associates");
const defineSocialMedia = require("./socialMedia");

// HOMEPAGE
const defineHomeCms = require("./home/homeCms");
const defineHomeBanner = require("./home/homeBanner");
const defineHomeMilestone = require("./home/homeMilestone");
const defineHomeMap = require("./home/homeMap");
const defineHomeExploreOurExpertise = require("./home/homeExploreOurExpertise");
const defineHomeAppFeatures = require("./home/homeAppFeatures");
const defineHomeInvestment = require("./home/homeInvestment");

// ABOUT PAGE
const defineAboutCms = require("./about/aboutCms");
const defineAboutOurValues = require("./about/aboutOurValues");
const defineAboutOurJourney = require("./about/aboutOurJourney");
const defineAboutMedia = require("./about/aboutMedia");

// INVESTMENT PAGE
const defineInvestInGoEcCms = require("./investInGoEc/investInGoEcCms");
const defineInvestInGoEcExplore = require("./investInGoEc/investInGoEcExplore");
const defineInvestInGoEcMilestone = require("./investInGoEc/investInGoEcMilestone");
const defineInvestInGoEcFeatures = require("./investInGoEc/investInGoEcFeatures");
const defineInvestInGoEcPartners = require("./investInGoEc/investInGoEcPartners");


//NEWS
const defineNewsCms = require("./news/newsCms");
const defineNews = require("./news/news");

//BLOGS
const defineBlogCms = require("./blogs/blogCms");
const defineBlogs = require("./blogs/blogs");

//APP PAGE
const defineAppPageCms = require("./appPage/appPageCms");
const defineAppPageFeatures = require("./appPage/appPageFeatures");
const defineAppPageChargeUrEv = require("./appPage/appPageChargeUrEv");

// SMART CARD PAGE
const defineGoEcSmartCardCms = require("./goEcSmartCard/goEcSmartCardCms");
const defineGoEcSmartCardKeyBenefits = require("./goEcSmartCard/goEcSmartCardKeyBenefits");
const defineGoEcSmartCardApplyStep = require("./goEcSmartCard/goEcSmartCardApplyStep");




const models = {
  AdminUser: defineAdminUser(sequelize),
  MetaTags: defineMetaTags(sequelize),
  Policy: definePolicy(sequelize),
  Partner: definePartner(sequelize),
  Associates: defineAssociates(sequelize),
  SocialMedia: defineSocialMedia(sequelize),

  // HOMEPAGE
  HomeCms: defineHomeCms(sequelize),
  HomeBanner: defineHomeBanner(sequelize),
  HomeMilestone: defineHomeMilestone(sequelize),
  HomeMap: defineHomeMap(sequelize),
  HomeExploreOurExpertise: defineHomeExploreOurExpertise(sequelize),
  HomeAppFeatures: defineHomeAppFeatures(sequelize),
  HomeInvestment: defineHomeInvestment(sequelize),

  // ABOUT PAGE
  AboutCms: defineAboutCms(sequelize),
  AboutOurValues: defineAboutOurValues(sequelize),
  AboutOurJourney: defineAboutOurJourney(sequelize),
  AboutMedia: defineAboutMedia(sequelize),

  // INVESTMENT PAGE
  InvestInGoEcCms: defineInvestInGoEcCms(sequelize),
  InvestInGoEcExplore: defineInvestInGoEcExplore(sequelize),
  InvestInGoEcMilestone: defineInvestInGoEcMilestone(sequelize),
  InvestInGoEcFeatures: defineInvestInGoEcFeatures(sequelize),
  InvestInGoEcPartners: defineInvestInGoEcPartners(sequelize),


  //NEWS
  NewsCms: defineNewsCms(sequelize),
  News: defineNews(sequelize),

  //Blogs
  BlogCms: defineBlogCms(sequelize),
  Blogs: defineBlogs(sequelize),

  //APP PAGE
  AppPageCms: defineAppPageCms(sequelize),
  AppPageFeatures: defineAppPageFeatures(sequelize),
  AppPageChargeUrEv: defineAppPageChargeUrEv(sequelize),


  // SMART CARD PAGE
  GoEcSmartCardCms: defineGoEcSmartCardCms(sequelize),
  GoEcSmartCardKeyBenefits: defineGoEcSmartCardKeyBenefits(sequelize),
  GoEcSmartCardApplyStep: defineGoEcSmartCardApplyStep(sequelize),


};

Object.keys(models).forEach((modelName) => {
  if ("associate" in models[modelName]) {
    console.log("Associating", modelName);
    models[modelName].associate(models);
  }
});

module.exports = { sequelize, models };



















