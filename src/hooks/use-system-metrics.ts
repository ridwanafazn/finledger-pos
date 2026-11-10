"use client";

import { useCallback, useEffect, useState } from "react";
import type { SystemMetrics } from "@/lib/metrics";

export function useSystemMetrics(intervalMs = 5_000) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback((data: SystemMetrics) => {
    setMetrics(data);
    setError(null);
    setLoading(false);
  }, []);

  const fail = useCallback(() => {
    setError("Metrik backend tidak tersedia");
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/metrics", { cache: "no-store" });
      if (!response.ok) throw new Error("metrics unavailable");
      apply((await response.json()) as SystemMetrics);
    } catch {
      fail();
    }
  }, [apply, fail]);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetch("/api/metrics", { cache: "no-store" })
        .then((response) => {
          if (!response.ok) throw new Error("metrics unavailable");
          return response.json() as Promise<SystemMetrics>;
        })
        .then((data) => {
          if (!cancelled) apply(data);
        })
        .catch(() => {
          if (!cancelled) fail();
        });
    };

    load();
    const timer = window.setInterval(load, intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [apply, fail, intervalMs]);

  return { metrics, loading, error, refresh };
}
