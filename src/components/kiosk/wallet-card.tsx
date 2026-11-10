"use client";

import { ArrowUpRight, RefreshCw, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney, formatNumber } from "@/lib/format";
import type { AccountResponse, ApiProblem } from "@/types/api";

export function WalletCard({
  idr,
  points,
  loading,
  error,
  onRetry,
  onViewLedger,
}: {
  idr: AccountResponse | null;
  points: AccountResponse | null;
  loading: boolean;
  error: ApiProblem | null;
  onRetry: () => void;
  onViewLedger: () => void;
}) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-brand-500 p-5">
        <Skeleton className="h-3 w-24 bg-white/25" />
        <Skeleton className="mt-4 h-8 w-40 bg-white/25" />
        <div className="mt-5 flex items-end justify-between">
          <Skeleton className="h-5 w-24 bg-white/25" />
          <Skeleton className="h-8 w-24 bg-white/25" />
        </div>
      </div>
    );
  }

  if (error || !idr) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-500">
            <Wallet className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold">Dompet belum tersedia</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
              {error?.detail ??
                "Akun demo belum dibuat. Masuk sebagai admin lalu muat ulang."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onRetry}
            >
              <RefreshCw className="size-3.5" />
              Coba lagi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-brand-500 p-5 text-white shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
            zLedger Card
          </p>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold">
            {idr.status === "ACTIVE" ? "Aktif" : idr.status}
          </span>
        </div>

        <p className="mt-3 text-[11px] font-medium text-white/70">Saldo IDR</p>
        <p className="text-[30px] font-extrabold leading-tight tabular-nums">
          {formatMoney(idr.balance, "IDR")}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium text-white/70">A-Poin</p>
            <p className="text-lg font-bold tabular-nums">
              {formatNumber(points?.balance ?? 0)}
              <span className="ml-1 text-[11px] font-medium text-white/70">
                poin
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onViewLedger}
            className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-3 py-2 text-[11px] font-semibold backdrop-blur transition-colors hover:bg-white/25"
          >
            Lihat mutasi
            <ArrowUpRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
