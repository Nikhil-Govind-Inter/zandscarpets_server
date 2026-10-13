// Holds the validated+normalized row set for a validationId between
// `validate` and `commit`, so commit never re-parses or re-validates the
// file — it just re-checks uniqueness (against possibly-changed DB state)
// and writes. Follows the same `req.app.get("redisClient")` + null-guard
// convention as modules/admin/http/traits/cacheHelper.js. Unlike that cache
// (a miss just costs a slower query), a miss here is user-visible — spec §9
// already designs for it ("validation expired, please re-validate"), so
// Redis's best-effort nature is an acceptable trade-off.

const crypto = require("crypto");

const TTL_SECONDS = 45 * 60; // spec §9: 30-60 minute window
const KEY_PREFIX = "bulkupload:validation:";

const keyFor = (validationId) => `${KEY_PREFIX}${validationId}`;

const getRedis = (req) => req.app.get("redisClient") || null;

async function saveValidation(req, { entity, rawRows }) {
  const validationId = crypto.randomUUID();
  const redisClient = getRedis(req);
  if (!redisClient) {
    throw new Error("Validation storage (Redis) is unavailable — please try again shortly");
  }
  await redisClient.set(
    keyFor(validationId),
    JSON.stringify({ entity, rawRows, createdAt: Date.now() }),
    { EX: TTL_SECONDS },
  );
  return validationId;
}

async function loadValidation(req, validationId) {
  const redisClient = getRedis(req);
  if (!redisClient) return null;
  const raw = await redisClient.get(keyFor(validationId));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_err) {
    return null;
  }
}

async function deleteValidation(req, validationId) {
  const redisClient = getRedis(req);
  if (!redisClient) return;
  await redisClient.del(keyFor(validationId));
}

module.exports = { saveValidation, loadValidation, deleteValidation };
