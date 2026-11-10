"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";

export function CartBar({
  count,
  total,
  onCheckout,
}: {
  count: number;
  total: number;
  onCheckout: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {count > 0 ? (
        <motion.div
          initial={reduceMotion ? false : { y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { y: 16, opacity: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
          }
          className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 px-4 lg:bottom-6"
        >
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-2.5 pl-4 shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="relative grid size-9 place-items-center rounded-xl bg-surface-muted text-ink-700">
                <ShoppingBag className="size-4" />
                <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-brand-500 text-[9px] font-bold text-white">
                  {count}
                </span>
              </span>
              <div>
                <p className="text-[10px] font-medium text-ink-500">
                  Total belanja
                </p>
                <p className="text-sm font-bold tabular-nums text-ink-900">
                  {formatMoney(total, "IDR")}
                </p>
              </div>
            </div>
            <Button onClick={onCheckout} className="h-10 px-5">
              Checkout
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
