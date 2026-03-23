const requestMap = new Map<string, number[]>();

export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = requestMap.get(identifier) ?? [];
  const valid = timestamps.filter((t) => t > windowStart);

  if (valid.length >= limit) {
    requestMap.set(identifier, valid);
    return { success: false, remaining: 0 };
  }

  const updated = [...valid, now];
  requestMap.set(identifier, updated);

  // Auto-clean expired entries periodically
  if (requestMap.size > 10_000) {
    for (const [key, ts] of requestMap) {
      const filtered = ts.filter((t) => t > windowStart);
      if (filtered.length === 0) {
        requestMap.delete(key);
      } else {
        requestMap.set(key, filtered);
      }
    }
  }

  return { success: true, remaining: limit - updated.length };
}
