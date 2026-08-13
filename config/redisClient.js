// config/redis.js
const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      // Exponential backoff, capped at 10s
      const delay = Math.min(retries * 100, 10000);
      return delay;
    },
  },
});

redisClient.on('error', (err) => {
  console.error('[Redis] Client Error:', err.message);
});

redisClient.on('connect', () => {
  console.log('[Redis] Connecting...');
});

redisClient.on('ready', () => {
  console.log('[Redis] Connected and ready');
});

redisClient.on('reconnecting', () => {
  console.warn('[Redis] Reconnecting...');
});

// Call this once at server startup (e.g. in server.js / app.js)
async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
}

// Call this on graceful shutdown
async function disconnectRedis() {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
}

module.exports = {
  redisClient,
  connectRedis,
  disconnectRedis,
};