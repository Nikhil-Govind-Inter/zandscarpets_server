const sequelize = require("../config/index");

const defineAdminUser = require("./adminuser");
const defineMetaTags = require("./metaTags");
const definePolicy = require("./policy");

// HOMEPAGE
const defineHomeCms = require("./home/homeCms");
const defineHomeBanner = require("./home/homeBanner");
const defineHomeMilestone = require("./home/homeMilestone");
const defineHomeMap = require("./home/homeMap");
const defineHomeExploreOurExpertise = require("./home/homeExploreOurExpertise");
const defineHomeAppFeatures = require("./home/homeAppFeatures");
const defineHomeInvestment = require("./home/homeInvestment");

// ABOUT PAGE
const defineAboutOurValues = require("./about/aboutOurValues");
const defineAboutOurJourney = require("./about/aboutOurJourney");
const defineAboutMedia = require("./about/aboutMedia");

// INVESTMENT PAGE
const defineInvestmentBusinessModels = require("./investments/investmentBusinessModels");
const defineInvestmentValues = require("./investments/investmentValues");
const defineInvestmentCards = require("./investments/investmentCards");
const defineInvestmentTestimonials = require("./investments/investmentTestimonials");


const models = {
  AdminUser: defineAdminUser(sequelize),
  MetaTags: defineMetaTags(sequelize),
  Policy: definePolicy(sequelize),

  // HOMEPAGE
  HomeCms: defineHomeCms(sequelize),
  HomeBanner: defineHomeBanner(sequelize),
  HomeMilestone: defineHomeMilestone(sequelize),
  HomeMap: defineHomeMap(sequelize),
  HomeExploreOurExpertise: defineHomeExploreOurExpertise(sequelize),
  HomeAppFeatures: defineHomeAppFeatures(sequelize),
  HomeInvestment: defineHomeInvestment(sequelize),

  // ABOUT PAGE
  AboutOurValues: defineAboutOurValues(sequelize),
  AboutOurJourney: defineAboutOurJourney(sequelize),
  AboutMedia: defineAboutMedia(sequelize),
  
  
  // INVESTMENT PAGE
  InvestmentBusinessModels: defineInvestmentBusinessModels(sequelize),
  InvestmentValues: defineInvestmentValues(sequelize),
  InvestmentCards: defineInvestmentCards(sequelize),
  InvestmentTestimonials: defineInvestmentTestimonials(sequelize),


};

Object.keys(models).forEach((modelName) => {
  if ("associate" in models[modelName]) {
    console.log("Associating", modelName);
    models[modelName].associate(models);
  }
});

module.exports = { sequelize, models };
