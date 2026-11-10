"use client";

import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { formatMoney, shortId } from "@/lib/format";
import type { Product } from "@/lib/catalog";
import type { CartLine } from "@/lib/cart";
import { useWalletContext } from "@/components/providers/wallet-provider";
import type { CheckoutResponse } from "@/types/api";
import { CartBar } from "./cart-bar";
import { CartSheet } from "./cart-sheet";
import { KioskHeader } from "./kiosk-header";
import { ProductGrid } from "./product-grid";
import { PromoBanner } from "./promo-banner";
import { VoucherSection } from "./voucher-section";
import { WalletCard } from "./wallet-card";

export function KioskPanel({
  onOpenAccount,
  onViewLedger,
}: {
  onOpenAccount: () => void;
  onViewLedger: () => void;
}) {
  const { idr, points, loading, error, refresh } = useWalletContext();
  const [query, setQuery] = useState("");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [lastCheckout, setLastCheckout] = useState<CheckoutResponse | null>(
    null,
  );

  function addProduct(product: Product) {
    setLines((previous) => {
      const existing = previous.find(
        (line) => line.product.id === product.id,
      );
      if (existing) {
        return previous.map((line) =>
          line.product.id === product.id
            ? { ...line, qty: line.qty + 1 }
            : line,
        );
      }
      return [...previous, { product, qty: 1 }];
    });
  }

  function changeQty(productId: string, delta: number) {
    setLines((previous) =>
      previous
        .map((line) =>
          line.product.id === productId
            ? { ...line, qty: line.qty + delta }
            : line,
        )
        .filter((line) => line.qty > 0),
    );
  }

  function removeLine(productId: string) {
    setLines((previous) =>
      previous.filter((line) => line.product.id !== productId),
    );
  }

  function handleSuccess(result: CheckoutResponse) {
    setLines([]);
    setLastCheckout(result);
    void refresh();
    toast.success("Pembayaran berhasil", {
      description: `Transaksi ${shortId(result.transactionId, 12)}, ${formatMoney(
        result.totalAmount,
        result.currency,
      )}`,
    });
  }

  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  const total = lines.reduce(
    (sum, line) => sum + line.product.price * line.qty,
    0,
  );

  return (
    <div className="w-full">
      <KioskHeader
        query={query}
        onQueryChange={setQuery}
        onOpenAccount={onOpenAccount}
      />

      <div className="mx-auto w-full max-w-2xl space-y-5 px-4 pb-44 pt-4 sm:px-6 lg:pb-32">
        {lastCheckout ? (
          <div className="flex items-start gap-3 rounded-2xl border border-credit/20 bg-credit/5 p-4">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-credit" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold">Pembayaran berhasil</p>
              <p className="mt-0.5 text-[11px] text-ink-500">
                ID transaksi{" "}
                <span className="font-mono">
                  {shortId(lastCheckout.transactionId, 12)}
                </span>
              </p>
              <button
                type="button"
                onClick={onViewLedger}
                className="mt-2 text-[11px] font-semibold text-brand-600 hover:underline"
              >
                Lihat di ledger
              </button>
            </div>
            <button
              type="button"
              onClick={() => setLastCheckout(null)}
              aria-label="Tutup notifikasi"
              className="grid size-7 shrink-0 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-black/5 hover:text-ink-700"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : null}

        <WalletCard
          idr={idr}
          points={points}
          loading={loading}
          error={error}
          onRetry={() => void refresh()}
          onViewLedger={onViewLedger}
        />

        <PromoBanner />

        <VoucherSection />

        <ProductGrid query={query} onAdd={addProduct} />
      </div>

      <CartBar
        count={count}
        total={total}
        onCheckout={() => setCartOpen(true)}
      />

      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        lines={lines}
        idrBalance={idr?.balance ?? 0}
        pointsBalance={points?.balance ?? 0}
        onQtyChange={changeQty}
        onRemove={removeLine}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
