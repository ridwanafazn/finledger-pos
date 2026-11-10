"use client";

import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runConcurrencyBurst, type ConcurrencyBurst } from "@/lib/proof";
import { cn } from "@/lib/utils";
import { ProofSection, StatBox, Verdict } from "./proof-ui";

export function ConcurrencyLab() {
  const [running, setRunning] = useState(false);
  const [burst, setBurst] = useState<ConcurrencyBurst | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setRunning(true);
    setError(null);
    setBurst(null);

    try {
      setBurst(await runConcurrencyBurst());
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Uji konkurensi tidak dapat dijalankan",
      );
    } finally {
      setRunning(false);
    }
  }

  const success = burst?.results.filter((result) => result.ok).length ?? 0;
  const rejected = burst ? burst.results.length - success : 0;
  const remainingQuota = burst?.voucher.remainingQuota ?? 0;
  const passed = Boolean(burst) && success === 5 && remainingQuota === 0;

  return (
    <ProofSection
      title="Concurrency"
      description="Dua puluh pemilik berbeda menebas voucher berkuota lima secara bersamaan. Pessimistic lock pada baris voucher harus membuat tepat lima berhasil dan tidak pernah minus."
      action={
        <Button onClick={handleRun} disabled={running} size="sm">
          {running ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Menjalankan
            </>
          ) : (
            <>
              <Play className="size-4" />
              Jalankan 20 redeem
            </>
          )}
        </Button>
      }
    >
      {error ? <Verdict ok={false}>{error}</Verdict> : null}

      {burst ? (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatBox label="Request" value={String(burst.results.length)} />
            <StatBox label="Berhasil" value={String(success)} />
            <StatBox label="Ditolak" value={String(rejected)} />
            <StatBox
              label="Sisa kuota"
              value={String(remainingQuota)}
              hint={`dari ${burst.voucher.totalQuota}`}
            />
          </div>

          <Verdict ok={passed}>
            {passed
              ? "Kuota lima terjual tepat lima kali. Tidak ada oversell dan tidak ada kuota negatif."
              : "Hasil tidak sesuai. Periksa jumlah keberhasilan dan sisa kuota."}
          </Verdict>

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-[1fr_70px_100px] gap-2 border-b border-border bg-surface-muted px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-400">
              <span>Pemilik</span>
              <span>Status</span>
              <span>Sisa kuota</span>
            </div>
            {burst.results.map((result) => (
              <div
                key={result.ownerId}
                className="grid grid-cols-[1fr_70px_100px] items-center gap-2 border-b border-border px-3 py-2 last:border-b-0"
              >
                <span className="truncate font-mono text-[11px] text-ink-700">
                  {result.ownerId}
                </span>
                <span
                  className={cn(
                    "text-[12px] font-semibold",
                    result.ok ? "text-credit" : "text-debit",
                  )}
                >
                  {result.status}
                </span>
                <span className="text-[11px] tabular-nums text-ink-500">
                  {result.ok
                    ? String(result.remainingQuota ?? 0)
                    : (result.errorCode ?? "ditolak")}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </ProofSection>
  );
}
