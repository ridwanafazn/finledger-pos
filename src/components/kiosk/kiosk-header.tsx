"use client";

import { MapPin, Search } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import { useUsername } from "@/hooks/use-session";

function initials(name: string | null): string {
  if (!name) return "Z";
  const parts = name.replace(/[._-]+/g, " ").trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function KioskHeader({
  query,
  onQueryChange,
  onOpenAccount,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onOpenAccount: () => void;
}) {
  const username = useUsername();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-surface/90 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-4 pt-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <div>
            <p className="text-[15px] font-extrabold leading-none tracking-tight">
              zLedger
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-ink-500">
              <MapPin className="size-3" />
              Jakarta Selatan
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAccount}
          aria-label="Buka akun"
          className="grid size-9 place-items-center rounded-full bg-brand-50 text-[12px] font-bold text-brand-600 ring-1 ring-brand-100 transition-colors duration-200 hover:bg-brand-100"
        >
          {initials(username)}
        </button>
      </div>

      <div className="px-4 pb-3 pt-3 sm:px-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Cari produk di zLedger"
            aria-label="Cari produk"
            className="h-11 w-full rounded-xl border border-border bg-surface-muted pl-10 pr-3 text-sm text-ink-900 transition-all duration-200 ease-out placeholder:text-ink-400 focus-visible:border-brand-500 focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-brand-500/20"
          />
        </div>
      </div>
    </header>
  );
}
