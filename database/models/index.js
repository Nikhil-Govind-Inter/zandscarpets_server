const sequelize = require("../config/index");


const defineAdminUser = require("./adminuser");
const defineMetaTags = require("./metaTags");
const definePolicy = require("./policy");

const models = {
  AdminUser: defineAdminUser(sequelize),
  MetaTags: defineMetaTags(sequelize),
  Policy: definePolicy(sequelize),

};

Object.keys(models).forEach((modelName) => {
  if ("associate" in models[modelName]) {
    console.log("Associating", modelName);
    models[modelName].associate(models);
  }
});

module.exports = { sequelize, models };