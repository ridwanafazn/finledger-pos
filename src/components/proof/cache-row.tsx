import { cn } from "@/lib/utils";

export function CacheRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] text-ink-500">{label}</span>
      <span
        className={cn(
          "truncate text-[11px] font-medium text-ink-700",
          mono && "font-mono text-[10px]",
        )}
      >
        {value}
      </span>
    </div>
  );
}
