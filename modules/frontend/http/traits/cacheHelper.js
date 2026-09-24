// Shared Redis read-through cache helper for frontend (public) GET endpoints.
//
// Mirrors modules/admin/http/traits/cacheHelper.js's req.app.get("redisClient") +
// null-guard convention, so a Redis outage never breaks a public request. Keyed
// under its own `frontend:cache:*` namespace (separate from `admin:cache:*`) even
// though the underlying rows are shared, so the two caches never collide.
//
// Because the admin and frontend Express sub-routers are mounted on the same app
// (see server.js), admin write-path controllers invalidate these same keys directly
// via cacheKeys below after a mutation to the underlying model — check the relevant
// admin controller (e.g. aboutCmsController, historyController) before adding a new
// cached frontend GET so reads don't go stale past the mutating write.

const DEFAULT_TTL = 60 * 60 * 24 * 30; // 30 days; freshness relies on admin write-path invalidation, not just TTL expiry.

const getRedis = (ctx) => {
  // Accept either a req (has .app) or the Express app itself.
  const app = (ctx && ctx.app) || ctx;
  return (app && typeof app.get === "function" && app.get("redisClient")) || null;
};

const getCache = async (ctx, key) => {
  const redisClient = getRedis(ctx);
  if (!redisClient) return null;

  try {
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Frontend cache get error:", error.message);
    return null;
  }
};

const setCache = async (ctx, key, value, ttlSeconds = DEFAULT_TTL) => {
  const redisClient = getRedis(ctx);
  if (!redisClient) return;

  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    console.error("Frontend cache set error:", error.message);
  }
};

const invalidateCache = async (ctx, pattern) => {
  const redisClient = getRedis(ctx);
  if (!redisClient) return;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error("Frontend cache invalidate error:", error.message);
  }
};

const cacheKeys = {
  // ABOUT PAGE
  about: (lang) => `frontend:cache:about:${lang}`,
  aboutPattern: () => "frontend:cache:about:*",

  // FLOATING ICONS
  floatingIcons: (lang) => `frontend:cache:floating-icon:${lang}`,
  floatingIconsPattern: () => "frontend:cache:floating-icon:*",

  // SITE SETTINGS (header/footer/floating buttons)
  siteSettings: (lang) => `frontend:cache:site-settings:${lang}`,
  siteSettingsPattern: () => "frontend:cache:site-settings:*",

  // META TAGS (per page slug + lang)
  metaTags: (page, lang) => `frontend:cache:meta-tags:${page}:${lang}`,
  metaTagsPattern: () => "frontend:cache:meta-tags:*",
};

module.exports = {
  DEFAULT_TTL,
  getCache,
  setCache,
  invalidateCache,
  cacheKeys,
};
