"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BootScreen } from "@/components/layout/boot-screen";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { cn } from "@/lib/utils";
import { ConcurrencyLab } from "./concurrency-lab";
import { IdempotencyLab } from "./idempotency-lab";
import { IntegrityLab } from "./integrity-lab";
import { SystemPulse } from "./system-pulse";

type Tab = "idempotency" | "concurrency" | "integrity" | "system";

const TABS: Array<{ id: Tab; label: string; caption: string }> = [
  { id: "idempotency", label: "Idempotency", caption: "5 request, 1 transaksi" },
  { id: "concurrency", label: "Concurrency", caption: "20 redeem, kuota 5" },
  { id: "integrity", label: "Integrity", caption: "Saldo vs ledger" },
  { id: "system", label: "System", caption: "Metrik backend" },
];

export function ProofPage() {
  const router = useRouter();
  const authenticated = useAuthGuard();
  const [tab, setTab] = useState<Tab>("idempotency");

  if (authenticated !== true) {
    return <BootScreen />;
  }

  return (
    <div className="min-h-dvh bg-surface-muted">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            aria-label="Kembali ke belanja"
            className="grid size-9 place-items-center rounded-xl border border-border text-ink-500 transition-colors hover:bg-surface-muted hover:text-ink-900"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold tracking-tight">
              Proof Center
            </h1>
            <p className="text-[11px] text-ink-500">
              Bukti perilaku backend, bukan klaim
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 px-4 py-5 sm:px-6">
        <div
          role="tablist"
          aria-label="Jenis bukti"
          className="grid grid-cols-2 gap-1.5 rounded-2xl border border-border bg-surface p-1.5 sm:grid-cols-4"
        >
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
                className={cn(
                  "rounded-xl px-3 py-2 text-left transition-colors",
                  active
                    ? "bg-brand-50 text-brand-600"
                    : "text-ink-500 hover:bg-surface-muted hover:text-ink-900",
                )}
              >
                <span className="block text-[12px] font-semibold">
                  {item.label}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-[10px]",
                    active ? "text-brand-500" : "text-ink-400",
                  )}
                >
                  {item.caption}
                </span>
              </button>
            );
          })}
        </div>

        {tab === "idempotency" ? <IdempotencyLab /> : null}
        {tab === "concurrency" ? <ConcurrencyLab /> : null}
        {tab === "integrity" ? <IntegrityLab /> : null}
        {tab === "system" ? <SystemPulse /> : null}

        <p className="pb-6 text-center text-[11px] leading-relaxed text-ink-400">
          Halaman ini memanggil endpoint nyata. Setiap pengujian menambah data
          demo pada database lokal.
        </p>
      </main>
    </div>
  );
}
