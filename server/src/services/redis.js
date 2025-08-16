import { Redis } from "@upstash/redis";

// Dev fallback (in-memory) for local runs without Upstash
const devStore = new Map();
const haveUpstash = !!(process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN);

let redis = null;
if (haveUpstash) {
  redis = new Redis({ url: process.env.UPSTASH_REDIS_URL, token: process.env.UPSTASH_REDIS_TOKEN });
}

export const highestBidKey = (auctionId) => `auction:${auctionId}:highest`;
export const lockKey = (auctionId) => `auction:${auctionId}:lock`;

export async function redisGet(key) {
  if (redis) return await redis.get(key);
  return devStore.get(key) ?? null;
}

export async function redisSet(key, value, opts = {}) {
  if (redis) return await redis.set(key, value, opts);
  devStore.set(key, value);
  return "OK";
}

export async function redisDel(key) {
  if (redis) return await redis.del(key);
  devStore.delete(key);
  return 1;
}

export async function redisGetHighest(auctionId) {
  return await redisGet(highestBidKey(auctionId));
}
