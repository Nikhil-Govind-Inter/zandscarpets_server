const ABOUT = "frontend:cache:about:*";
const SITE_SETTINGS = "frontend:cache:site-settings:*";
const FLOATING = "frontend:cache:floating-icon:*";
const META_TAGS = "frontend:cache:meta-tags:*";
const SERVICES = "frontend:cache:services:*";

const cmsResources = {
  "social-media": {
    model: "SocialMedia",
    cachePrefix: "socialmedia",
    frontend: [SITE_SETTINGS],
  },
  "footer-media": {
    model: "FooterMedia",
    cachePrefix: "footermedia",
    frontend: [SITE_SETTINGS],
  },
  "floating-icons": {
    model: "FloatingIcon",
    cachePrefix: "floatingicon",
    frontend: [FLOATING, SITE_SETTINGS],
  },
  pages: {
    model: "Page",
    cachePrefix: "pages",
    frontend: [META_TAGS],
    sortable: false,
  },
  "ads-banner": { model: "AdsBanner", cachePrefix: "adsbanner" },
  faqs: { model: "Faqs", cachePrefix: "faqs" },
  industry: { model: "Industry", cachePrefix: "industry", frontend: [SERVICES] },
  "our-features": { model: "OurFeatures", cachePrefix: "ourfeatures", frontend: [ABOUT] },
  materials: { model: "Materials", cachePrefix: "materials" },
  "work-plan": {
    model: "WorkPlan",
    cachePrefix: "workplan",
    frontend: [ABOUT],
  },
  "home-banner": { model: "HomeBanner", cachePrefix: "homebanner" },
  "home-milestones": { model: "HomeMilestones", cachePrefix: "homemilestone" },
  "home-brands": { model: "HomeBrands", cachePrefix: "homebrands" },
  "home-testimonials": {
    model: "HomeTestimonials",
    cachePrefix: "hometestimonials",
  },
  "core-values": { model: "CoreValues", cachePrefix: "corevalues", frontend: [ABOUT] },
  history: { model: "History", cachePrefix: "history", frontend: [ABOUT] },
  "about-industries": {
    model: "AboutIndustries",
    cachePrefix: "aboutindustries",
    frontend: [ABOUT],
  },
  messages: { model: "Messages", cachePrefix: "messages", frontend: [ABOUT] },
  milestones: {
    model: "Milestones",
    cachePrefix: "milestones",
    frontend: [ABOUT],
  },
  connections: { model: "Connections", cachePrefix: "connections" },
  projects: { model: "Projects", cachePrefix: "projects" },
  services: { model: "Services", cachePrefix: "services", frontend: [SERVICES] },
  "process-steps": { model: "ProcessSteps", cachePrefix: "processsteps", frontend: [SERVICES] },
  "product-categories": {
    model: "ProductCategories",
    cachePrefix: "productcategories",
  },
  // category responses embed highlights, so highlight changes bust them too
  "product-highlights": {
    model: "ProductHighlights",
    cachePrefix: "producthighlights",
    frontend: ["admin:cache:productcategories:*"],
  },
};

module.exports = { cmsResources };
