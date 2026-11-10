import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProofSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-ink-500">
            {description}
          </p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Verdict({
  ok,
  children,
}: {
  ok: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mt-4 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[12px] font-medium leading-relaxed",
        ok
          ? "border-credit/20 bg-credit/5 text-credit"
          : "border-debit/20 bg-debit/5 text-debit",
      )}
    >
      {ok ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      ) : (
        <XCircle className="mt-0.5 size-4 shrink-0" />
      )}
      <span>{children}</span>
    </div>
  );
}

export function StatBox({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-muted p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-400">
        {label}
      </p>
      <p className="mt-1.5 text-[15px] font-bold tabular-nums text-ink-900">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[10px] text-ink-500">{hint}</p> : null}
    </div>
  );
}
