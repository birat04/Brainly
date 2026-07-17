import type { NextRequest } from "next/server";
import { AppError } from "@/lib/errors";

type Bucket = { count: number; resetAt: number };

const memoryBuckets = new Map<string, Bucket>();

function pruneMemory() {
  const now = Date.now();
  for (const [key, bucket] of memoryBuckets) {
    if (bucket.resetAt <= now) memoryBuckets.delete(key);
  }
}

async function incrUpstash(key: string, windowSec: number): Promise<number> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    throw new Error("Upstash not configured");
  }

  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, windowSec, "NX"],
    ]),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Upstash error: ${res.status}`);
  }

  const data = (await res.json()) as Array<{ result: number }>;
  return Number(data[0]?.result ?? 0);
}

function incrMemory(key: string, windowMs: number): number {
  pruneMemory();
  const now = Date.now();
  const existing = memoryBuckets.get(key);
  if (!existing || existing.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return 1;
  }
  existing.count += 1;
  return existing.count;
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export async function rateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<{ success: boolean; remaining: number }> {
  const windowSec = Math.max(1, Math.ceil(params.windowMs / 1000));
  const useUpstash = Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() && process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );

  let count: number;
  try {
    count = useUpstash
      ? await incrUpstash(params.key, windowSec)
      : incrMemory(params.key, params.windowMs);
  } catch (error) {
    console.warn("[rate-limit] backend failed, allowing request", error);
    return { success: true, remaining: params.limit };
  }

  const remaining = Math.max(0, params.limit - count);
  return { success: count <= params.limit, remaining };
}

export async function enforceRateLimit(
  request: NextRequest,
  opts: { prefix: string; limit: number; windowMs: number; identity?: string },
) {
  const id = opts.identity || getClientIp(request);
  const result = await rateLimit({
    key: `rl:${opts.prefix}:${id}`,
    limit: opts.limit,
    windowMs: opts.windowMs,
  });
  if (!result.success) {
    throw AppError.rateLimited();
  }
  return result;
}

/** Reject cross-site mutating requests when Origin is present and mismatched. */
export function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return;

  const allowed = new Set<string>();
  allowed.add(new URL(request.url).origin);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    try {
      allowed.add(new URL(appUrl).origin);
    } catch {
      /* ignore bad env */
    }
  }

  if (!allowed.has(origin)) {
    throw AppError.forbidden("Invalid request origin");
  }
}
