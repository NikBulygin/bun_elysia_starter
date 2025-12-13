import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: true, // Don't connect immediately
  enableOfflineQueue: true, // Queue commands when offline (for graceful degradation)
  enableReadyCheck: false, // Don't wait for ready check
});

redis.on('error', (err) => {
  // Only log errors if not in test environment or if explicitly enabled
  if (process.env.NODE_ENV !== 'test' || process.env.REDIS_LOG_ERRORS === 'true') {
    console.error('Redis connection error:', err);
  }
});

redis.on('connect', () => {
  // Only log connection if not in test environment or if explicitly enabled
  if (process.env.NODE_ENV !== 'test' || process.env.REDIS_LOG_CONNECT === 'true') {
    console.log('✅ Redis connected');
  }
});

