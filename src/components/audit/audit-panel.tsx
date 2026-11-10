"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWalletContext } from "@/components/providers/wallet-provider";
import { useMerchantAccounts } from "@/hooks/use-merchant-accounts";
import {
  MUTATION_PAGE_SIZE,
  useMutations,
} from "@/hooks/use-mutations";
import { formatMoney, formatTime, shortId } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Currency, MutationResponse } from "@/types/api";

function Stat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Activity;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
        <Icon className={cn("size-3", tone)} />
        {label}
      </div>
      <p className="mt-2 truncate text-[15px] font-bold tabular-nums text-ink-900">
        {value}
      </p>
    </div>
  );
}

function MutationRow({
  item,
  currency,
  flash,
}: {
  item: MutationResponse;
  currency: Currency;
  flash: boolean;
}) {
  const isCredit = item.entryType === "CREDIT";

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-3 transition-colors duration-700",
        flash
          ? isCredit
            ? "bg-credit/10"
            : "bg-debit/10"
          : "bg-transparent",
      )}
    >
      <span
        className={cn(
          "grid size-7 place-items-center rounded-lg",
          isCredit ? "bg-credit/10 text-credit" : "bg-debit/10 text-debit",
        )}
      >
        {isCredit ? (
          <ArrowDownLeft className="size-3.5" />
        ) : (
          <ArrowUpRight className="size-3.5" />
        )}
      </span>

      <div className="min-w-0">
        <p className="truncate text-[12px] font-medium text-ink-900">
          {item.description || "Mutasi ledger"}
        </p>
        <p className="mt-0.5 font-mono text-[10px] text-ink-500">
          {formatTime(item.createdAt)}, {shortId(item.transactionId, 8)}
        </p>
      </div>

      <div className="text-right">
        <p
          className={cn(
            "text-[12px] font-bold tabular-nums",
            isCredit ? "text-credit" : "text-debit",
          )}
        >
          {isCredit ? "+" : "−"}
          {formatMoney(item.amount, currency)}
        </p>
        <p className="text-[9px] font-semibold uppercase tracking-wide text-ink-400">
          {item.entryType}
        </p>
      </div>
    </div>
  );
}

export function AuditPanel({ onBack }: { onBack?: () => void }) {
  const { accounts, version } = useWalletContext();
  const merchantAccounts = useMerchantAccounts();

  const allAccounts = useMemo(
    () => [...accounts, ...merchantAccounts],
    [accounts, merchantAccounts],
  );
  const primaryIds = useMemo(
    () => accounts.map((account) => account.id),
    [accounts],
  );
  const counterpartyIds = useMemo(
    () => merchantAccounts.map((account) => account.id),
    [merchantAccounts],
  );
  const [limit, setLimit] = useState(MUTATION_PAGE_SIZE);
  const { items, loading, error, flashIds, refresh, hasMore } = useMutations(
    primaryIds,
    counterpartyIds,
    version,
    limit,
  );

  const currencyByAccount = useMemo(() => {
    const map = new Map<string, Currency>();
    allAccounts.forEach((account) => map.set(account.id, account.currency));
    return map;
  }, [allAccounts]);

  const totals = useMemo(() => {
    let debitIdr = 0;
    let creditIdr = 0;
    let debitPoints = 0;
    let creditPoints = 0;

    items.forEach((item) => {
      const currency = currencyByAccount.get(item.accountId) ?? "IDR";
      if (currency === "IDR") {
        if (item.entryType === "DEBIT") debitIdr += item.amount;
        else creditIdr += item.amount;
      } else if (item.entryType === "DEBIT") {
        debitPoints += item.amount;
      } else {
        creditPoints += item.amount;
      }
    });

    return { debitIdr, creditIdr, debitPoints, creditPoints };
  }, [items, currencyByAccount]);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/90 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Kembali ke belanja"
                className="grid size-7 place-items-center rounded-lg border border-border text-ink-500 transition-colors hover:bg-surface-muted hover:text-ink-900"
              >
                <ArrowLeft className="size-3.5" />
              </button>
            ) : null}
            <Terminal className="size-4 text-ink-500" />
            <h2 className="text-sm font-semibold tracking-tight text-ink-900">
              Immutable Ledger
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="live">
              <span className="size-1.5 rounded-full bg-credit" />
              Live
            </Badge>
            <button
              type="button"
              onClick={() => void refresh()}
              aria-label="Muat ulang ledger"
              className="grid size-7 place-items-center rounded-lg border border-border text-ink-500 transition-colors hover:bg-surface-muted hover:text-ink-900"
            >
              <RefreshCw className="size-3.5" />
            </button>
          </div>
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
          Audit trail double-entry. Setiap mutasi tidak dapat diubah.
        </p>
      </header>

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-3 gap-2">
          <Stat
            label="Mutasi"
            value={String(items.length)}
            icon={Activity}
            tone="text-ink-500"
          />
          <Stat
            label="Debit IDR"
            value={formatMoney(totals.debitIdr, "IDR")}
            icon={ArrowUpRight}
            tone="text-debit"
          />
          <Stat
            label="Kredit IDR"
            value={formatMoney(totals.creditIdr, "IDR")}
            icon={ArrowDownLeft}
            tone="text-credit"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-400">
              Mutasi terbaru
            </span>
            <span className="text-[10px] font-medium text-ink-500">
              {items.length} baris
            </span>
          </div>

          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 px-3 py-3">
                  <Skeleton className="size-7 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[12px] font-medium text-ink-900">
                Ledger tidak dapat dimuat
              </p>
              <p className="mt-1 text-[11px] text-ink-500">
                {error.detail ?? error.title}
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-[12px] font-medium text-ink-900">
                Belum ada mutasi
              </p>
              <p className="mt-1 text-[11px] text-ink-500">
                Selesaikan checkout pertama untuk melihat entri ledger.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <MutationRow
                  key={item.id}
                  item={item}
                  currency={currencyByAccount.get(item.accountId) ?? "IDR"}
                  flash={flashIds.includes(item.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-ink-500">
            Menampilkan {items.length} mutasi
          </span>
          {hasMore ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setLimit((current) =>
                  Math.min(current + MUTATION_PAGE_SIZE, 100),
                )
              }
              disabled={loading}
            >
              Muat lebih banyak
            </Button>
          ) : null}
        </div>

        <p className="text-center text-[11px] text-ink-500">
          Setiap transaksi memiliki pasangan debit dan kredit. A-Poin debit{" "}
          {formatMoney(totals.debitPoints, "A_POIN")} dan kredit{" "}
          {formatMoney(totals.creditPoints, "A_POIN")}.
        </p>
      </div>
    </div>
  );
}
