import 'server-only';
import { createHash, randomBytes } from 'node:crypto';

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec: number;
}

export interface RateLimiter {
  check(key: string): RateLimitResult;
}

export interface InMemoryRateLimiterOptions {
  perKeyLimit?: number;
  perKeyWindowMs?: number;
  globalLimit?: number;
  globalWindowMs?: number;
  maxKeys?: number;
  now?: () => number;
}

/**
 * Sliding window, per serverless instance (best effort). 5 requests per 10 minutes per key and a
 * global ceiling of 60 per hour, with at most 10,000 tracked keys.
 */
export class InMemoryRateLimiter implements RateLimiter {
  private readonly hits = new Map<string, number[]>();
  private globalHits: number[] = [];
  private readonly perKeyLimit: number;
  private readonly perKeyWindowMs: number;
  private readonly globalLimit: number;
  private readonly globalWindowMs: number;
  private readonly maxKeys: number;
  private readonly now: () => number;

  constructor(options: InMemoryRateLimiterOptions = {}) {
    this.perKeyLimit = options.perKeyLimit ?? 5;
    this.perKeyWindowMs = options.perKeyWindowMs ?? 10 * 60 * 1000;
    this.globalLimit = options.globalLimit ?? 60;
    this.globalWindowMs = options.globalWindowMs ?? 60 * 60 * 1000;
    this.maxKeys = options.maxKeys ?? 10_000;
    this.now = options.now ?? Date.now;
  }

  /** Number of keys currently tracked (for tests and diagnostics). */
  get size(): number {
    return this.hits.size;
  }

  check(key: string): RateLimitResult {
    const now = this.now();
    this.prune(now);

    this.globalHits = this.globalHits.filter((time) => now - time < this.globalWindowMs);
    const recent = (this.hits.get(key) ?? []).filter((time) => now - time < this.perKeyWindowMs);

    if (recent.length >= this.perKeyLimit) {
      const oldest = recent[0] ?? now;
      return deny(oldest + this.perKeyWindowMs - now);
    }
    if (this.globalHits.length >= this.globalLimit) {
      const oldest = this.globalHits[0] ?? now;
      return deny(oldest + this.globalWindowMs - now);
    }

    recent.push(now);
    this.globalHits.push(now);
    // Re-inserting keeps the Map in last-activity order, which makes pruning cheap.
    this.hits.delete(key);
    this.hits.set(key, recent);
    this.enforceKeyCap();
    return { allowed: true, retryAfterSec: 0 };
  }

  /** Drops keys whose newest hit has left the window. Stops at the first live key. */
  private prune(now: number): void {
    for (const [key, times] of this.hits) {
      const newest = times[times.length - 1] ?? 0;
      if (now - newest < this.perKeyWindowMs) break;
      this.hits.delete(key);
    }
  }

  private enforceKeyCap(): void {
    while (this.hits.size > this.maxKeys) {
      const oldest = this.hits.keys().next();
      if (oldest.done) break;
      this.hits.delete(oldest.value);
    }
  }
}

function deny(retryAfterMs: number): RateLimitResult {
  return { allowed: false, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
}

// Random per process, never logged: the key cannot be reversed to an address.
const processSalt = randomBytes(16);

export function hashClientKey(ip: string, salt: Uint8Array = processSalt): string {
  return createHash('sha256').update(salt).update(ip).digest('hex');
}

/**
 * Client IP. x-vercel-forwarded-for is set by Vercel's edge and cannot be spoofed there; the
 * other headers matter for local `next start` and tests. All unknowns share one bucket.
 */
export function getClientIp(headers: Headers): string {
  const vercel = headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim();
  if (vercel) return vercel;
  const real = headers.get('x-real-ip')?.trim();
  if (real) return real;
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || 'unknown';
}

/** Shared by all requests handled by this instance. */
export const sharedRateLimiter: RateLimiter = new InMemoryRateLimiter();
