import { NextResponse } from "next/server";
import { API_UPSTREAM_URL } from "@/lib/api";
import { buildSystemMetrics, parsePrometheus } from "@/lib/metrics";

export const dynamic = "force-dynamic";

/**
 * Server-side bridge to the backend's Prometheus endpoint.
 * The browser never talks to Prometheus directly, so no CORS or auth
 * configuration is needed and only aggregate metrics are exposed.
 */
export async function GET() {
  const origin = new URL(API_UPSTREAM_URL).origin;

  try {
    const response = await fetch(`${origin}/actuator/prometheus`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Metrik backend tidak tersedia" },
        { status: 502 },
      );
    }

    const text = await response.text();
    return NextResponse.json(buildSystemMetrics(parsePrometheus(text)));
  } catch {
    return NextResponse.json(
      { error: "Metrik backend tidak tersedia" },
      { status: 502 },
    );
  }
}
