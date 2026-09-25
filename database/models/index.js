const sequelize = require("../config/index");

const defineAdminUser = require("./admin/adminuser");
const defineAdminRefreshToken = require("./admin/adminRefreshToken");
const defineSiteSettings = require("./siteSettings/siteSettings");
const defineSocialMedia = require("./siteSettings/socialMedia");
const defineFloatingIcon = require("./siteSettings/floatingIcon");
const defineMetaData  = require("./siteSettings/metaData");
const defineFooterMedia = require("./siteSettings/footerMedia")
const definePage = require("./masters/page");
const defineBanners = require("./siteSettings/banners");
const defineAdsBanner = require("./masters/AdsBanner");
const defineFaqs = require("./masters/faqs");
const defineIndustry = require("./masters/industry");
const defineOurFeatures = require("./masters/ourFeatures");
const defineMaterials = require("./masters/materials");
const defineWorkPlan = require("./masters/workPlan");
const defineHomeCms = require("./home/homeCms");
const defineHomeBanner = require("./home/homeBanner");
const defineHomeMilestones = require("./home/homeMilestones");
const defineHomeBrands = require("./home/homeBrands");
const defineHomeTestimonials = require("./home/homeTestimonials");
const defineAboutCms = require("./about/aboutCms");
const defineCoreValues = require("./about/coreValues");
const defineHistory = require("./about/history");
const defineAboutIndustries = require("./about/aboutIndustries");
const defineMessages = require("./about/messages");
const defineMilestones = require("./about/mileStones");
const defineContactCms = require("./contact/contactCms");
const defineConnections = require("./contact/connections");
const defineProjects = require("./projects/projects");
// policies
const definePrivacyPolicy = require("./policies/privacyPolicy");
// enquiries
const defineContactEnquiry = require("./enquiries/contactEnquiry");
// products
const defineProductCategories = require("./products/productCategory");
const defineProductHighlights = require("./products/productHightlights");
// services
const defineProcessSteps = require("./services/processSteps");
const defineServices = require("./services/services");
const defineServiceCms = require("./services/serviceCms");

const models = {
  AdminUser: defineAdminUser(sequelize),
  AdminRefreshToken: defineAdminRefreshToken(sequelize),
  SiteSettings: defineSiteSettings(sequelize),
  SocialMedia: defineSocialMedia(sequelize),
  FooterMedia: defineFooterMedia(sequelize),
  FloatingIcon: defineFloatingIcon(sequelize),

  // SITE SETTINGS
  MetaData:  defineMetaData(sequelize),
  Page: definePage(sequelize),
  Banners: defineBanners(sequelize),
  AdsBanner: defineAdsBanner(sequelize),
  Faqs: defineFaqs(sequelize),
  Industry: defineIndustry(sequelize),
  
  // HOME
  OurFeatures: defineOurFeatures(sequelize),
  Materials: defineMaterials(sequelize),
  WorkPlan: defineWorkPlan(sequelize),
  HomeCms: defineHomeCms(sequelize),
  HomeBanner: defineHomeBanner(sequelize),
  HomeMilestones: defineHomeMilestones(sequelize),
  HomeBrands: defineHomeBrands(sequelize),
  HomeTestimonials: defineHomeTestimonials(sequelize),
  
  // ABOUT
  AboutCms: defineAboutCms(sequelize),
  CoreValues: defineCoreValues(sequelize),
  History: defineHistory(sequelize),
  AboutIndustries: defineAboutIndustries(sequelize),
  Messages: defineMessages(sequelize),
  Milestones: defineMilestones(sequelize),
  
  // CONTACT
  ContactCms: defineContactCms(sequelize),
  Connections: defineConnections(sequelize),
  ContactEnquiry: defineContactEnquiry(sequelize),

  // POLICIES
  PrivacyPolicy: definePrivacyPolicy(sequelize),
 
  // PROJECTS
  Projects: defineProjects(sequelize),
  
  // PRODUCTS
  ProductCategories: defineProductCategories(sequelize),
  ProductHighlights: defineProductHighlights(sequelize),

  // SERVICES
  Services: defineServices(sequelize),
  ServiceCms: defineServiceCms(sequelize),
  ProcessSteps: defineProcessSteps(sequelize),
};



Object.keys(models).forEach((modelName) => {
  if ("associate" in models[modelName]) {
    console.log("Associating", modelName);
    models[modelName].associate(models);
  }
});

module.exports = { sequelize, models };
