"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Store, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export type Panel = "belanja" | "akun";

const TABS: Array<{ id: Panel; label: string; icon: typeof Store }> = [
  { id: "belanja", label: "Belanja", icon: Store },
  { id: "akun", label: "Akun", icon: UserRound },
];

export function BottomTabs({
  panel,
  onChange,
  className,
}: {
  panel: Panel;
  onChange: (panel: Panel) => void;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <nav
      aria-label="Navigasi utama"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto grid max-w-md grid-cols-2 gap-1 px-3 py-2">
        {TABS.map((tab) => {
          const active = panel === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px] font-semibold transition-colors duration-200",
                active ? "text-brand-600" : "text-ink-400 hover:text-ink-700",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="bottom-tab-indicator"
                  className="absolute inset-0 rounded-xl bg-brand-50"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
                  }
                />
              ) : null}
              <Icon className="relative size-[18px]" strokeWidth={2} />
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
