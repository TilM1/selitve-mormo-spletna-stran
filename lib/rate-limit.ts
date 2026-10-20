import "server-only";

// Sliding-window limit per client IP, kept in memory. On serverless hosting every warm instance
// has its own memory, so this is a brake against bursts, not a hard global quota. The honeypot and
// timing check in the route catch most automated spam; add a shared store (e.g. Upstash) if abuse appears.

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;
const hits = new Map<string, number[]>();

export function rateLimited(key: string, now = Date.now()) {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  }
  return recent.length > MAX_HITS;
}
