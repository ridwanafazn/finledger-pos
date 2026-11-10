"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSystemMetrics } from "@/hooks/use-system-metrics";
import { formatNumber, formatTime } from "@/lib/format";
import { ProofSection, StatBox, Verdict } from "./proof-ui";

export function SystemPulse() {
  const { metrics, loading, error, refresh } = useSystemMetrics();

  return (
    <ProofSection
      title="System"
      description="Metrik diambil server-side dari endpoint Prometheus backend. Angka ini berasal dari JVM, connection pool, HTTP server, dan Kafka yang benar-benar berjalan."
      action={
        <Button variant="outline" size="sm" onClick={() => void refresh()}>
          <RefreshCw className="size-4" />
          Muat ulang
        </Button>
      }
    >
      {error ? <Verdict ok={false}>{error}</Verdict> : null}

      {loading && !metrics ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : null}

      {metrics ? (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <StatBox
              label="Checkout diproses"
              value={formatNumber(metrics.checkout.count)}
            />
            <StatBox
              label="Rata-rata checkout"
              value={`${metrics.checkout.avgMs.toFixed(0)} ms`}
            />
            <StatBox
              label="Maksimum checkout"
              value={
                metrics.checkout.maxSeconds > 0
                  ? `${(metrics.checkout.maxSeconds * 1000).toFixed(0)} ms`
                  : "Belum ada"
              }
            />
            <StatBox
              label="Request HTTP"
              value={formatNumber(metrics.http.count)}
            />
            <StatBox
              label="Error rate"
              value={`${metrics.http.errorRate.toFixed(1)} persen`}
            />
            <StatBox
              label="DB pool"
              value={`${metrics.db.active} / ${metrics.db.max}`}
              hint={`${metrics.db.idle} idle, ${metrics.db.pending} menunggu`}
            />
            <StatBox
              label="Heap JVM"
              value={`${metrics.jvm.heapUsedMb.toFixed(0)} MB`}
              hint={`maksimum ${metrics.jvm.heapMaxMb.toFixed(0)} MB`}
            />
            <StatBox
              label="Event Kafka"
              value={formatNumber(metrics.kafka.listenerCount)}
            />
            <StatBox
              label="Selisih rekonsiliasi"
              value={formatNumber(metrics.reconciliation.discrepanciesLast)}
            />
          </div>

          <p className="text-[11px] text-ink-500">
            Diperbarui {formatTime(metrics.fetchedAt)}. Data disegarkan setiap
            lima detik.
          </p>
        </div>
      ) : null}
    </ProofSection>
  );
}
