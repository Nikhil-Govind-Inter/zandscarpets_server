const sequelize = require("../config/index");

const defineAdminUser = require("./admin/adminuser");
const defineAdminRefreshToken = require("./admin/adminRefreshToken");
const defineSiteSettings = require("./siteSettings/siteSettings");
const defineSocialMedia = require("./siteSettings/socialMedia");
const defineMetaData  = require("./siteSettings/metaData");
const defineFooterMedia = require("./siteSettings/footerMedia")
const models = {
  AdminUser: defineAdminUser(sequelize),
  AdminRefreshToken: defineAdminRefreshToken(sequelize),
  SiteSettings: defineSiteSettings(sequelize),
  SocialMedia: defineSocialMedia(sequelize),
  FooterMedia: defineFooterMedia(sequelize),
  MetaData:  defineMetaData(sequelize),
};



Object.keys(models).forEach((modelName) => {
  if ("associate" in models[modelName]) {
    console.log("Associating", modelName);
    models[modelName].associate(models);
  }
});

module.exports = { sequelize, models };
