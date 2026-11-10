"use client";

import { useState } from "react";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/format";
import { fetchReconciliationHistory, runReconciliation } from "@/lib/proof";
import type { ReconciliationRunResponse } from "@/types/api";
import { ProofSection, StatBox, Verdict } from "./proof-ui";

export function IntegrityLab() {
  const [running, setRunning] = useState(false);
  const [run, setRun] = useState<ReconciliationRunResponse | null>(null);
  const [history, setHistory] = useState<ReconciliationRunResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setRunning(true);
    setError(null);

    try {
      const result = await runReconciliation();
      setRun(result);
      try {
        setHistory(await fetchReconciliationHistory());
      } catch {
        setHistory([]);
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Rekonsiliasi tidak dapat dijalankan",
      );
    } finally {
      setRunning(false);
    }
  }

  const passed =
    Boolean(run) &&
    run?.status === "BALANCED" &&
    run.discrepancyCount === 0 &&
    run.unbalancedJournalCount === 0;

  return (
    <ProofSection
      title="Integrity"
      description="Rekonsiliasi membandingkan saldo setiap akun dengan jumlah mutasi ledger, lalu memeriksa keseimbangan setiap jurnal. Satu selisih pun akan muncul di sini."
      action={
        <Button onClick={handleRun} disabled={running} size="sm">
          {running ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Memeriksa
            </>
          ) : (
            <>
              <Play className="size-4" />
              Jalankan rekonsiliasi
            </>
          )}
        </Button>
      }
    >
      {error ? <Verdict ok={false}>{error}</Verdict> : null}

      {run ? (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatBox
              label="Akun diperiksa"
              value={formatNumber(run.accountsChecked)}
            />
            <StatBox
              label="Temuan saldo"
              value={formatNumber(run.discrepancyCount)}
            />
            <StatBox
              label="Jurnal tidak seimbang"
              value={formatNumber(run.unbalancedJournalCount)}
            />
            <StatBox
              label="Total selisih"
              value={formatMoney(Number(run.totalAbsVariance), "IDR")}
            />
          </div>

          <Verdict ok={passed}>
            {passed
              ? "Semua saldo cocok dengan ledger dan seluruh jurnal seimbang."
              : "Ditemukan selisih. Periksa daftar temuan pada detail rekonsiliasi."}
          </Verdict>

          <div className="rounded-xl border border-border bg-surface-muted p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-400">
              Ringkasan
            </p>
            <p className="mt-1 text-[12px] text-ink-700">
              Status {run.status}. Selesai{" "}
              {formatDateTime(run.completedAt ?? run.startedAt)}.
            </p>
          </div>
        </div>
      ) : null}

      {history.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-400">
            Riwayat pemeriksaan
          </p>
          {history.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2"
            >
              <span className="text-[12px] font-medium text-ink-700">
                {formatDateTime(item.completedAt ?? item.startedAt)}
              </span>
              <span className="text-[11px] text-ink-500">
                {formatNumber(item.accountsChecked)} akun,{" "}
                {formatNumber(item.discrepancyCount)} temuan
              </span>
              <span
                className={
                  item.status === "BALANCED"
                    ? "text-[11px] font-semibold text-credit"
                    : "text-[11px] font-semibold text-debit"
                }
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </ProofSection>
  );
}
