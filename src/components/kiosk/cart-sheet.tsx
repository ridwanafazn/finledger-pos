"use client";

import { useState } from "react";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api, ApiProblemError } from "@/lib/api";
import { cartCount, cartTotal, type CartLine } from "@/lib/cart";
import { MERCHANT_ID, OWNER_ID } from "@/lib/config";
import { formatMoney, formatNumber } from "@/lib/format";
import { newIdempotencyKey } from "@/lib/idempotency";
import type { CheckoutRequest, CheckoutResponse } from "@/types/api";

function parseAmount(value: string): number {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function CartSheet({
  open,
  onOpenChange,
  lines,
  idrBalance,
  pointsBalance,
  onQtyChange,
  onRemove,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lines: CartLine[];
  idrBalance: number;
  pointsBalance: number;
  onQtyChange: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onSuccess: (result: CheckoutResponse) => void;
}) {
  const total = cartTotal(lines);
  const count = cartCount(lines);

  const [pointsInput, setPointsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxPoints = Math.min(total, pointsBalance);
  const points = clamp(parseAmount(pointsInput), 0, maxPoints);
  const idr = total - points;
  const insufficientIdr = idr > idrBalance;
  const canPay = total > 0 && !insufficientIdr && !submitting;

  function handlePointsChange(value: string) {
    const next = clamp(parseAmount(value), 0, maxPoints);
    setPointsInput(next === 0 ? "" : String(next));
    setError(null);
  }

  async function handleSubmit() {
    if (!canPay) return;
    setSubmitting(true);
    setError(null);

    const key = newIdempotencyKey();
    const currency = idr >= points ? "IDR" : "A_POIN";

    const payload: CheckoutRequest = {
      ownerId: OWNER_ID,
      merchantId: MERCHANT_ID,
      totalAmount: total,
      currency,
      idempotencyKey: key,
      tenders: [
        ...(idr > 0
          ? [
              {
                currency: "IDR" as const,
                amount: idr,
                description: "Pembayaran saldo IDR",
              },
            ]
          : []),
        ...(points > 0
          ? [
              {
                currency: "A_POIN" as const,
                amount: points,
                description: "Pembayaran A-Poin",
              },
            ]
          : []),
      ],
    };

    try {
      const { data } = await api.post<CheckoutResponse>(
        "/ledger/checkout",
        payload,
        { headers: { "X-Idempotency-Key": key } },
      );
      onSuccess(data);
      onOpenChange(false);
    } catch (caught) {
      if (caught instanceof ApiProblemError) {
        setError(
          caught.problem.detail ??
            caught.problem.title ??
            "Pembayaran gagal diproses.",
        );
      } else {
        setError("Pembayaran gagal diproses.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="inset-x-0 bottom-0 left-0 top-auto w-full max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-3xl p-0 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100%-2rem)] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
        <div className="flex max-h-[88dvh] flex-col">
          <div className="border-b border-border px-5 py-4">
            <DialogTitle>Keranjang belanja</DialogTitle>
            <DialogDescription>
              {count} item, {formatMoney(total, "IDR")}
            </DialogDescription>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
            <ul className="space-y-3">
              {lines.map((line) => (
                <li key={line.product.id} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">
                      {line.product.name}
                    </p>
                    <p className="text-[11px] text-ink-500">
                      {formatMoney(line.product.price, "IDR")},{" "}
                      {line.product.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onQtyChange(line.product.id, -1)}
                      aria-label={`Kurangi ${line.product.name}`}
                      className="grid size-7 place-items-center rounded-lg border border-border text-ink-500 transition-colors duration-150 hover:bg-surface-muted active:bg-border"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-6 text-center text-[13px] font-bold tabular-nums">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQtyChange(line.product.id, 1)}
                      aria-label={`Tambah ${line.product.name}`}
                      className="grid size-7 place-items-center rounded-lg border border-border text-ink-500 transition-colors duration-150 hover:bg-surface-muted active:bg-border"
                    >
                      <Plus className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(line.product.id)}
                      aria-label={`Hapus ${line.product.name}`}
                      className="ml-1 grid size-7 place-items-center rounded-lg text-ink-400 transition-colors duration-150 hover:bg-debit/10 hover:text-debit active:bg-debit/15"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="points-tender">Bayar dengan A-Poin</Label>
                <button
                  type="button"
                  onClick={() => handlePointsChange(String(maxPoints))}
                  className="text-[11px] font-semibold text-brand-600 hover:underline"
                >
                  Pakai semua
                </button>
              </div>
              <Input
                id="points-tender"
                inputMode="numeric"
                placeholder="0"
                value={pointsInput}
                onChange={(event) => handlePointsChange(event.target.value)}
              />
              <p className="text-[11px] text-ink-500">
                Tersedia {formatNumber(pointsBalance)} poin, maksimal{" "}
                {formatNumber(maxPoints)} poin untuk pesanan ini
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="idr-tender">Dibayar dengan IDR</Label>
                <Input
                  id="idr-tender"
                  value={formatMoney(idr, "IDR")}
                  readOnly
                  className="bg-surface-muted font-semibold tabular-nums"
                />
                <p className="text-[11px] text-ink-500">
                  Saldo IDR {formatMoney(idrBalance, "IDR")}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-surface-muted p-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-ink-500">Total tagihan</span>
                <span className="font-semibold tabular-nums">
                  {formatMoney(total, "IDR")}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[12px]">
                <span className="text-ink-500">A-Poin dipakai</span>
                <span className="font-semibold tabular-nums text-brand-600">
                  {formatNumber(points)} poin
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[12px]">
                <span className="text-ink-500">IDR dipotong</span>
                <span className="font-semibold tabular-nums">
                  {formatMoney(idr, "IDR")}
                </span>
              </div>
            </div>

            {insufficientIdr ? (
              <p
                role="alert"
                className="rounded-xl border border-debit/20 bg-debit/5 px-3 py-2.5 text-[12px] font-medium leading-relaxed text-debit"
              >
                Saldo IDR tidak cukup. Kurangi nominal atau gunakan A-Poin.
              </p>
            ) : null}

            {error ? (
              <p
                role="alert"
                className="rounded-xl border border-debit/20 bg-debit/5 px-3 py-2.5 text-[12px] font-medium leading-relaxed text-debit"
              >
                {error}
              </p>
            ) : null}
          </div>

          <div className="border-t border-border p-5">
            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={!canPay}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Memproses pembayaran
                </>
              ) : (
                <>Bayar {formatMoney(total, "IDR")}</>
              )}
            </Button>
            <p className="mt-2 text-center text-[10px] leading-relaxed text-ink-400">
              Ledger mencatat pembayaran pada akun mata uang utama.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
