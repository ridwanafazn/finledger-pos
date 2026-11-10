"use client";

import {
  ArrowLeft,
  ChevronRight,
  FlaskConical,
  LogOut,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/layout/brand-mark";
import { useWalletContext } from "@/components/providers/wallet-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-profile";
import { clearSession } from "@/lib/auth";
import { MERCHANT_ID, OWNER_ID } from "@/lib/config";
import { formatMoney, formatNumber } from "@/lib/format";

function initials(name: string | null): string {
  if (!name) return "Z";
  const parts = name.replace(/[._-]+/g, " ").trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-[12px] text-ink-500">{label}</span>
      <span className="max-w-[60%] truncate font-mono text-[11px] font-medium text-ink-700">
        {value}
      </span>
    </div>
  );
}

export function AccountPanel({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { profile, loading } = useProfile();
  const { idr, points } = useWalletContext();

  function handleLogout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <div className="w-full">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/70 bg-surface/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali ke belanja"
          className="grid size-9 place-items-center rounded-xl border border-border text-ink-500 transition-colors hover:bg-surface-muted hover:text-ink-900"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="text-[15px] font-bold tracking-tight">Akun</h1>
      </header>

      <div className="mx-auto w-full max-w-2xl space-y-4 px-4 pb-32 pt-5 sm:px-6">
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-[15px] font-extrabold text-brand-600 ring-1 ring-brand-100">
              {initials(profile?.username ?? null)}
            </span>
            <div className="min-w-0">
              {loading ? (
                <>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-2 h-3 w-20" />
                </>
              ) : (
                <>
                  <p className="truncate text-[15px] font-bold">
                    {profile?.fullName || profile?.username || "Pengguna zLedger"}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-ink-500">
                    {profile?.email || profile?.username || "customer"}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {(profile?.roles ?? ["CUSTOMER"]).map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-500"
              >
                <ShieldCheck className="size-3" />
                {role}
              </span>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">
              Saldo IDR
            </p>
            <p className="mt-2 text-lg font-extrabold tabular-nums">
              {idr ? formatMoney(idr.balance, "IDR") : "—"}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">
              A-Poin
            </p>
            <p className="mt-2 text-lg font-extrabold tabular-nums">
              {points ? `${formatNumber(points.balance)} poin` : "—"}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface px-4 py-2 shadow-sm">
          <InfoRow label="Owner ID" value={OWNER_ID} />
          <div className="h-px bg-border" />
          <InfoRow label="Merchant ID" value={MERCHANT_ID} />
        </section>

        <Link
          href="/ledger"
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors duration-200 hover:bg-surface-muted"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink-900 text-white">
            <Terminal className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold">Audit trail</p>
            <p className="text-[11px] text-ink-500">
              Tampilan teknis mutasi double-entry
            </p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-ink-400" />
        </Link>

        <Link
          href="/proof"
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors duration-200 hover:bg-surface-muted"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <FlaskConical className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold">Proof Center</p>
            <p className="text-[11px] text-ink-500">
              Uji idempotency, konkurensi, dan integritas
            </p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-ink-400" />
        </Link>

        <section className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
          <BrandMark />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold">zLedger POS</p>
            <p className="text-[11px] text-ink-500">
              Demo client untuk FinLedger Engine
            </p>
          </div>
          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-ink-500">
            v0.1
          </span>
        </section>

        <Button
          variant="outline"
          className="w-full text-debit hover:bg-debit/5"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Keluar dari akun
        </Button>
      </div>
    </div>
  );
}
