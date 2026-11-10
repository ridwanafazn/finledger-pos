"use client";

import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney, shortId } from "@/lib/format";
import {
  fetchIdempotencyCache,
  runIdempotencyBurst,
  type IdempotencyBurst,
} from "@/lib/proof";
import type {
  Currency,
  IdempotencyInspectionResponse,
} from "@/types/api";
import { cn } from "@/lib/utils";
import { CacheRow } from "./cache-row";
import { ProofSection, StatBox, Verdict } from "./proof-ui";

const AMOUNT = 1_000;

export function IdempotencyLab() {
  const [running, setRunning] = useState(false);
  const [burst, setBurst] = useState<IdempotencyBurst | null>(null);
  const [cache, setCache] = useState<IdempotencyInspectionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setRunning(true);
    setError(null);
    setBurst(null);
    setCache(null);

    try {
      const result = await runIdempotencyBurst(AMOUNT);
      setBurst(result);
      try {
        setCache(await fetchIdempotencyCache(result.key));
      } catch {
        setCache(null);
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Uji idempotency tidak dapat dijalankan",
      );
    } finally {
      setRunning(false);
    }
  }

  const uniqueTransactions = burst
    ? new Set(
        burst.results
          .map((result) => result.transactionId)
          .filter((value): value is string => Boolean(value)),
      ).size
    : 0;
  const delta = burst ? burst.before - burst.after : 0;
  const passed =
    Boolean(burst) &&
    uniqueTransactions === 1 &&
    delta === AMOUNT &&
    burst?.replay.ok === true;

  const cached = (cache?.entries[0]?.cachedResponse ?? null) as Record<
    string,
    unknown
  > | null;
  const balances = (cached?.balances ?? {}) as Record<string, number>;

  return (
    <ProofSection
      title="Idempotency"
      description={`Lima request checkout identik dikirim bersamaan dengan satu X-Idempotency-Key. Backend harus membuat satu transaksi dan memotong saldo tepat ${formatMoney(AMOUNT, "IDR")} satu kali.`}
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
              Jalankan 5 request
            </>
          )}
        </Button>
      }
    >
      {error ? <Verdict ok={false}>{error}</Verdict> : null}

      {burst ? (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <StatBox label="Request" value="5" />
            <StatBox
              label="Transaksi unik"
              value={String(uniqueTransactions)}
            />
            <StatBox label="Saldo turun" value={formatMoney(delta, "IDR")} />
          </div>

          <Verdict ok={passed}>
            {passed
              ? "Lima request menghasilkan satu transaksi dan saldo hanya berkurang satu kali."
              : "Hasil tidak sesuai. Periksa jumlah transaksi unik dan perubahan saldo."}
          </Verdict>

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-[40px_70px_90px_1fr] gap-2 border-b border-border bg-surface-muted px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-400">
              <span>No</span>
              <span>Status</span>
              <span>Durasi</span>
              <span>ID transaksi</span>
            </div>
            {burst.results.map((result) => (
              <div
                key={result.index}
                className="grid grid-cols-[40px_70px_90px_1fr] items-center gap-2 border-b border-border px-3 py-2 last:border-b-0"
              >
                <span className="text-[12px] text-ink-400">
                  {result.index + 1}
                </span>
                <span
                  className={cn(
                    "text-[12px] font-semibold",
                    result.ok ? "text-credit" : "text-debit",
                  )}
                >
                  {result.status}
                </span>
                <span className="text-[12px] tabular-nums text-ink-700">
                  {result.durationMs.toFixed(0)} ms
                </span>
                <span className="truncate font-mono text-[10px] text-ink-500">
                  {result.transactionId
                    ? shortId(result.transactionId, 12)
                    : (result.errorCode ?? "gagal")}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2">
            <span className="text-[12px] text-ink-500">
              Replay setelah burst
            </span>
            <span
              className={cn(
                "text-[12px] font-semibold",
                burst.replay.ok ? "text-credit" : "text-debit",
              )}
            >
              {burst.replay.status}, {burst.replay.durationMs.toFixed(0)} ms
            </span>
            <span className="w-full truncate font-mono text-[10px] text-ink-500 sm:w-auto">
              {burst.replay.transactionId
                ? shortId(burst.replay.transactionId, 12)
                : (burst.replay.errorCode ?? "gagal")}
            </span>
          </div>

          {cache && cache.entries.length > 0 ? (
            <div className="rounded-xl border border-border bg-surface-muted p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-400">
                  Cache Redis
                </p>
                <span className="text-[11px] text-ink-500">
                  TTL {cache.entries[0].ttlSeconds} detik
                </span>
              </div>
              <p className="mt-1 truncate font-mono text-[10px] text-ink-500">
                {cache.entries[0].scope}
              </p>
              <div className="mt-2 grid gap-1">
                <CacheRow
                  label="Transaksi"
                  value={String(cached?.transactionId ?? "tidak tersedia")}
                  mono
                />
                <CacheRow
                  label="Status"
                  value={String(cached?.status ?? "tidak tersedia")}
                />
                <CacheRow
                  label="Total"
                  value={formatMoney(
                    Number(cached?.totalAmount ?? 0),
                    (cached?.currency as Currency) ?? "IDR",
                  )}
                />
                <CacheRow
                  label="Saldo IDR"
                  value={formatMoney(Number(balances.IDR ?? 0), "IDR")}
                />
                <CacheRow
                  label="Saldo A-Poin"
                  value={formatMoney(Number(balances.A_POIN ?? 0), "A_POIN")}
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </ProofSection>
  );
}
