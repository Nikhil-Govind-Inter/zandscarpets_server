// services/cacheService.js
const { redisClient } = require("../config/redis");

// 3 days
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 3; // 3 days

/**
 * Get a value from cache. Returns null on miss OR on Redis failure
 * (fail-open: a cache problem should never break the request).
 */
async function get(key) {
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error(`[Cache] GET failed for key "${key}":`, err.message);
    return null;
  }
}

/**
 * Set a value in cache with a TTL (seconds).
 */
async function set(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (err) {
    console.error(`[Cache] SET failed for key "${key}":`, err.message);
  }
}

/**
 * Delete a single key.
 */
async function del(key) {
  try {
    await redisClient.del(key);
  } catch (err) {
    console.error(`[Cache] DEL failed for key "${key}":`, err.message);
  }
}

/**
 * Delete all keys matching a pattern, e.g. "pages:*"
 * Uses SCAN instead of KEYS to avoid blocking Redis on large datasets.
 */
async function delByPattern(pattern) {
  try {
    let cursor = 0;
    const keysToDelete = [];

    do {
      const result = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,
      });
      cursor = result.cursor;
      keysToDelete.push(...result.keys);
    } while (cursor !== 0);

    if (keysToDelete.length > 0) {
      await redisClient.del(keysToDelete);
    }

    return keysToDelete.length;
  } catch (err) {
    console.error(`[Cache] delByPattern failed for "${pattern}":`, err.message);
    return 0;
  }
}

/**
 * Wrap a data-fetching function with cache-aside logic:
 * check cache -> on miss, call fetchFn -> store result -> return it.
 */
async function getOrSet(key, fetchFn, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const cached = await get(key);
  if (cached !== null) {
    return cached;
  }

  const fresh = await fetchFn();
  // Don't cache null/undefined results (avoids caching "not found" indefinitely)
  if (fresh !== null && fresh !== undefined) {
    await set(key, fresh, ttlSeconds);
  }
  return fresh;
}

module.exports = {
  get,
  set,
  del,
  delByPattern,
  getOrSet,
  DEFAULT_TTL_SECONDS,
};
