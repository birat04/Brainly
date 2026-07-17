import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });
    return NextResponse.json({
      success: true,
      status: "ok",
      checks: {
        mongodb: "ok",
      },
      latencyMs: Date.now() - started,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed", error);
    return NextResponse.json(
      {
        success: false,
        status: "degraded",
        checks: {
          mongodb: "error",
        },
        latencyMs: Date.now() - started,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
