import { lockKey, redisGet, redisSet, redisDel } from "./redis.js";

export async function acquireLock(resource, ttlMs = 3000) {
  const key = lockKey(resource);
  const token = `${Date.now()}-${Math.random()}`;
  const existing = await redisGet(key);
  if (existing) return null;
  await redisSet(key, token);
  // naive TTL for dev fallback (Upstash would use PX)
  setTimeout(() => redisDel(key), ttlMs).unref?.();
  return token;
}

export async function releaseLock(resource, token) {
  const key = lockKey(resource);
  const curr = await redisGet(key);
  if (curr === token) await redisDel(key);
}
