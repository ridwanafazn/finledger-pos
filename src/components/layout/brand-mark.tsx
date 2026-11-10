import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-xl bg-brand-500 text-white shadow-sm",
        className,
      )}
    >
      <span className="text-[18px] font-extrabold leading-none tracking-tight">
        z
      </span>
    </span>
  );
}
