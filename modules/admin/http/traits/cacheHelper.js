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
  siteSettings: () => "admin:cache:sitesettings",
  socialMediaList: (req) => `admin:cache:socialmedia:list:${stableStringify(req.query)}`,
  socialMediaListPattern: () => "admin:cache:socialmedia:list:*",
  socialMediaItem: (id) => `admin:cache:socialmedia:item:${id}`,
  userList: (req) => `admin:cache:user:list:${stableStringify(req.query)}`,
  userListPattern: () => "admin:cache:user:list:*",
  userItem: (id) => `admin:cache:user:item:${id}`,
  metaDataList: (req) => `admin:cache:metadata:list:${stableStringify(req.query)}`,
  metaDataListPattern: () => "admin:cache:metadata:list:*",
  metaDataItem: (id) => `admin:cache:metadata:item:${id}`,
  pagesList: (req) => `admin:cache:pages:list:${stableStringify(req.query)}`,
  pagesListPattern: () => "admin:cache:pages:*",
  activePages: () => "admin:cache:pages:active",
  pagesItem: (id) => `admin:cache:pages:item:${id}`,
  bannersList: (req) => `admin:cache:banners:list:${stableStringify(req.query)}`,
  bannersListPattern: () => "admin:cache:banners:list:*",
  bannersItem: (id) => `admin:cache:banners:item:${id}`,
  footerMediaList: (req) => `admin:cache:footermedia:list:${stableStringify(req.query)}`,
  footerMediaListPattern: () => "admin:cache:footermedia:list:*",
  footerMediaItem: (id) => `admin:cache:footermedia:item:${id}`,
};

module.exports = {
  DEFAULT_TTL,
  getCache,
  setCache,
  invalidateCache,
  cacheKeys,
};
