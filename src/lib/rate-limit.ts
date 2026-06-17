const ipBuckets = new Map<string, { count: number; resetAt: number }>();
const emailBuckets = new Map<string, { count: number; resetAt: number }>();

const IP_LIMIT = 5;
const EMAIL_LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function check(
  buckets: Map<string, { count: number; resetAt: number }>,
  key: string,
  limit: number
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count++;
  return true;
}

export function checkRateLimit(ip: string, email: string): { ok: boolean; message?: string } {
  if (!check(ipBuckets, ip, IP_LIMIT)) {
    return { ok: false, message: "Too many requests from this IP address. Please try again later." };
  }
  if (!check(emailBuckets, email.toLowerCase(), EMAIL_LIMIT)) {
    return { ok: false, message: "Too many requests for this email. Please try again later." };
  }
  return { ok: true };
}
