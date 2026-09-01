// Shared Redis read-through cache helper for admin controllers.
//
// Follows the same `req.app.get('redisClient')` + null-guard convention already used by
// authMiddleware.js/AuthController.js for the JWT blacklist. Redis is optional — every
// function here degrades silently (returns null / no-op) if redisClient is unavailable
// or a redis call fails, so a cache outage never breaks a request.

const DEFAULT_TTL = 60 * 60 * 24 * 30; // 30 day

const getRedis = (req) => req.app.get("redisClient") || null;

const getCache = async (req, key) => {
  const redisClient = getRedis(req);
  if (!redisClient) return null;

  try {
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Cache get error:", error.message);
    return null;
  }
};

const setCache = async (req, key, value, ttlSeconds = DEFAULT_TTL) => {
  const redisClient = getRedis(req);
  if (!redisClient) return;

  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    console.error("Cache set error:", error.message);
  }
};

const invalidateCache = async (req, pattern) => {
  const redisClient = getRedis(req);
  if (!redisClient) return;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error("Cache invalidate error:", error.message);
  }
};

// Stable stringify so key order in req.query never produces two different cache keys
// for the same effective query (Object.keys order is insertion order, which is stable
// enough here, but sort defensively since query params can arrive in any order).
const stableStringify = (obj = {}) => {
  const sortedKeys = Object.keys(obj).sort();
  const sorted = {};
  sortedKeys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return JSON.stringify(sorted);
};

const cacheKeys = {
  
  // SITE SETTINGS
  siteSettings: () => "admin:cache:sitesettings",

  // HOME CMS
  homeCms: () => "admin:cache:homecms",

  // SOCIAL MEDIA
  socialMediaList: (req) => `admin:cache:socialmedia:list:${stableStringify(req.query)}`,
  socialMediaListPattern: () => "admin:cache:socialmedia:list:*",
  socialMediaItem: (id) => `admin:cache:socialmedia:item:${id}`,
 
//  USERS
  userList: (req) => `admin:cache:user:list:${stableStringify(req.query)}`,
  userListPattern: () => "admin:cache:user:list:*",
  userItem: (id) => `admin:cache:user:item:${id}`,
  
  // META DATA
  metaDataList: (req) => `admin:cache:metadata:list:${stableStringify(req.query)}`,
  metaDataListPattern: () => "admin:cache:metadata:list:*",
  metaDataItem: (id) => `admin:cache:metadata:item:${id}`,
  
  // PAGES
  pagesList: (req) => `admin:cache:pages:list:${stableStringify(req.query)}`,
  pagesListPattern: () => "admin:cache:pages:*",
  activePages: () => "admin:cache:pages:active",
  pagesItem: (id) => `admin:cache:pages:item:${id}`,

//  BANNERS
  bannersList: (req) => `admin:cache:banners:list:${stableStringify(req.query)}`,
  bannersListPattern: () => "admin:cache:banners:list:*",
  bannersItem: (id) => `admin:cache:banners:item:${id}`,
  
  // FOOTER MEDIA
  footerMediaList: (req) => `admin:cache:footermedia:list:${stableStringify(req.query)}`,
  footerMediaListPattern: () => "admin:cache:footermedia:list:*",
  footerMediaItem: (id) => `admin:cache:footermedia:item:${id}`,
  
  // ADS BANNERS
  adsBannerList: (req) => `admin:cache:adsbanner:list:${stableStringify(req.query)}`,
  adsBannerListPattern: () => "admin:cache:adsbanner:list:*",
  adsBannerItem: (id) => `admin:cache:adsbanner:item:${id}`,
  
  // FAQS
  faqsList: (req) => `admin:cache:faqs:list:${stableStringify(req.query)}`,
  faqsListPattern: () => "admin:cache:faqs:list:*",
  faqsItem: (id) => `admin:cache:faqs:item:${id}`,
  
  // INDUSTRY
  industryList: (req) => `admin:cache:industry:list:${stableStringify(req.query)}`,
  industryListPattern: () => "admin:cache:industry:list:*",
  industryItem: (id) => `admin:cache:industry:item:${id}`,
  
  // OUR FEATURES
  ourFeaturesList: (req) => `admin:cache:ourfeatures:list:${stableStringify(req.query)}`,
  ourFeaturesListPattern: () => "admin:cache:ourfeatures:list:*",
  ourFeaturesItem: (id) => `admin:cache:ourfeatures:item:${id}`,
  
  // WORK PLANS
  workPlanList: (req) => `admin:cache:workplan:list:${stableStringify(req.query)}`,
  workPlanListPattern: () => "admin:cache:workplan:list:*",
  workPlanItem: (id) => `admin:cache:workplan:item:${id}`,

  // HOME BANNER
  homeBannerList: (req) => `admin:cache:homebanner:list:${stableStringify(req.query)}`,
  homeBannerListPattern: () => "admin:cache:homebanner:list:*",
  homeBannerItem: (id) => `admin:cache:homebanner:item:${id}`,

  // HOME BRANDS
  homeBrandsList: (req) => `admin:cache:homebrands:list:${stableStringify(req.query)}`,
  homeBrandsListPattern: () => "admin:cache:homebrands:list:*",
  homeBrandsItem: (id) => `admin:cache:homebrands:item:${id}`,

  // HOME MILESTONES
  homeMilestoneList: (req) => `admin:cache:homemilestone:list:${stableStringify(req.query)}`,
  homeMilestoneListPattern: () => "admin:cache:homemilestone:list:*",
  homeMilestoneItem: (id) => `admin:cache:homemilestone:item:${id}`,

  // HOME TESTIMONAILS
  homeTestimonialsList: (req) => `admin:cache:hometestimonials:list:${stableStringify(req.query)}`,
  homeTestimonialsListPattern: () => "admin:cache:hometestimonials:list:*",
  homeTestimonialsItem: (id) => `admin:cache:hometestimonials:item:${id}`,

  // ABOUT CMS
  aboutCms: () => "admin:cache:aboutcms",

  // CORE VALUES
  coreValuesList: (req) => `admin:cache:corevalues:list:${stableStringify(req.query)}`,
  coreValuesListPattern: () => "admin:cache:corevalues:list:*",
  coreValuesItem: (id) => `admin:cache:corevalues:item:${id}`,

  // HISTORY
  historyList: (req) => `admin:cache:history:list:${stableStringify(req.query)}`,
  historyListPattern: () => "admin:cache:history:list:*",
  historyItem: (id) => `admin:cache:history:item:${id}`,

  // MESSAGES
  messagesList: (req) => `admin:cache:messages:list:${stableStringify(req.query)}`,
  messagesListPattern: () => "admin:cache:messages:list:*",
  messagesItem: (id) => `admin:cache:messages:item:${id}`,
};

module.exports = {
  DEFAULT_TTL,
  getCache,
  setCache,
  invalidateCache,
  cacheKeys,
};
