// =============================================================================
// Trader Command Center — Rate Limiter
// =============================================================================
// In-memory token bucket rate limiter for API routes.
// Prevents excessive requests to MEXC and protects the app from abuse.
// =============================================================================

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, RateLimitBucket>();

interface RateLimitConfig {
  /** Max tokens (requests) in the bucket */
  maxTokens: number;
  /** How many tokens to add per second */
  refillRate: number;
}

// Default: 10 requests, refills at 2/second
const DEFAULT_CONFIG: RateLimitConfig = {
  maxTokens: 10,
  refillRate: 2,
};

/**
 * Check if a request should be rate-limited.
 * 
 * @param key - Unique identifier (e.g., IP address or user ID)
 * @param config - Rate limit configuration
 * @returns Object with `allowed` boolean and `remaining` tokens
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = { tokens: config.maxTokens, lastRefill: now };
    buckets.set(key, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsed = (now - bucket.lastRefill) / 1000; // seconds
  const tokensToAdd = elapsed * config.refillRate;
  bucket.tokens = Math.min(config.maxTokens, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true, remaining: Math.floor(bucket.tokens), retryAfter: 0 };
  }

  // Calculate retry-after in seconds
  const retryAfter = Math.ceil((1 - bucket.tokens) / config.refillRate);
  return { allowed: false, remaining: 0, retryAfter };
}

/**
 * Rate limit configurations for different route groups
 */
export const RATE_LIMITS = {
  /** MEXC API proxied routes — conservative to avoid bans */
  mexc: { maxTokens: 15, refillRate: 3 } as RateLimitConfig,
  /** Journal CRUD operations */
  journal: { maxTokens: 20, refillRate: 5 } as RateLimitConfig,
  /** Screenshot uploads */
  upload: { maxTokens: 5, refillRate: 1 } as RateLimitConfig,
  /** Analytics queries */
  analytics: { maxTokens: 10, refillRate: 2 } as RateLimitConfig,
};

/**
 * Create a rate-limited API response when limit is exceeded
 */
export function rateLimitResponse(retryAfter: number): Response {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please slow down.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}

// Cleanup old buckets every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;
    for (const [key, bucket] of buckets.entries()) {
      if (now - bucket.lastRefill > FIVE_MINUTES) {
        buckets.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}
