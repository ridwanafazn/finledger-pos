"use client";

import { useState } from "react";
import { Loader2, Ticket } from "lucide-react";
import { toast } from "sonner";
import { useWalletContext } from "@/components/providers/wallet-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useVouchers } from "@/hooks/use-vouchers";
import { api } from "@/lib/api";
import { OWNER_ID } from "@/lib/config";
import { formatNumber } from "@/lib/format";
import { newIdempotencyKey } from "@/lib/idempotency";
import type { VoucherRedemptionResponse, VoucherResponse } from "@/types/api";

export function VoucherSection() {
  const { vouchers, loading, refresh } = useVouchers();
  const { points, refresh: refreshWallet } = useWalletContext();
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState<Set<string>>(new Set());

  async function handleRedeem(voucher: VoucherResponse) {
    setRedeemingId(voucher.id);

    try {
      const key = newIdempotencyKey();
      const { data } = await api.post<VoucherRedemptionResponse>(
        `/vouchers/${voucher.id}/redeem`,
        { ownerId: OWNER_ID },
        { headers: { "X-Idempotency-Key": key } },
      );

      toast.success("Voucher berhasil ditukar", {
        description: `${data.voucherCode}, sisa kuota ${data.remainingQuota}`,
      });

      setRedeemed((current) => new Set(current).add(voucher.id));
      await Promise.all([refresh(), refreshWallet()]);
    } catch {
      // The Axios interceptor already shows the RFC 7807 problem toast.
    } finally {
      setRedeemingId(null);
    }
  }

  const balance = points?.balance ?? 0;

  return (
    <section aria-labelledby="voucher-heading" className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h2
          id="voucher-heading"
          className="text-[13px] font-bold tracking-tight"
        >
          Tukar poin
        </h2>
        <span className="text-[11px] font-medium text-ink-400">
          {formatNumber(balance)} poin tersedia
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : vouchers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-5 text-center">
          <p className="text-[12px] font-medium text-ink-900">
            Belum ada voucher aktif
          </p>
          <p className="mt-0.5 text-[11px] text-ink-500">
            Voucher baru akan muncul di sini saat tersedia.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {vouchers.map((voucher) => {
            const affordable = voucher.pointsCost <= balance;
            const available = voucher.remainingQuota > 0;
            const busy = redeemingId === voucher.id;
            const alreadyRedeemed = redeemed.has(voucher.id);

            return (
              <article
                key={voucher.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 transition-[border-color,box-shadow] duration-200 ease-out hover:border-ink-400/30 hover:shadow-sm"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Ticket className="size-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold">
                    {voucher.name}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-ink-500">
                    Kode {voucher.code}, sisa {voucher.remainingQuota} dari{" "}
                    {voucher.totalQuota}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <p className="text-[11px] font-bold text-brand-600 tabular-nums">
                    {formatNumber(voucher.pointsCost)} poin
                  </p>
                  <Button
                    size="sm"
                    variant={affordable && available ? "default" : "outline"}
                    disabled={
                      !affordable || !available || busy || alreadyRedeemed
                    }
                    onClick={() => handleRedeem(voucher)}
                    className="h-8 px-3 text-[11px]"
                  >
                    {busy ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : alreadyRedeemed ? (
                      "Ditukar"
                    ) : !available ? (
                      "Habis"
                    ) : !affordable ? (
                      "Poin kurang"
                    ) : (
                      "Tukar"
                    )}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
