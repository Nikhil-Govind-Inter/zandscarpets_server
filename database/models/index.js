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



};

Object.keys(models).forEach((modelName) => {
  if ("associate" in models[modelName]) {
    console.log("Associating", modelName);
    models[modelName].associate(models);
  }
});

module.exports = { sequelize, models };
