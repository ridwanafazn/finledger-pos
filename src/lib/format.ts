import type { Currency } from "@/types/api";

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number, currency: Currency): string {
  if (currency === "IDR") {
    return idrFormatter.format(amount);
  }
  return `${numberFormatter.format(amount)} A-Poin`;
}

export function formatNumber(amount: number): string {
  return numberFormatter.format(amount);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function shortId(id: string, length = 8): string {
  if (!id) return "—";
  return id.length <= length ? id : id.slice(0, length);
}
