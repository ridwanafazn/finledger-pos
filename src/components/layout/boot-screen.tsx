import { BrandMark } from "./brand-mark";

export function BootScreen() {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="flex flex-col items-center gap-4">
        <BrandMark className="size-11 rounded-2xl" />
        <div className="space-y-1.5 text-center">
          <p className="text-sm font-semibold">Menyiapkan sesi</p>
          <p className="text-[12px] text-ink-500">
            Memeriksa kredensial dan koneksi backend.
          </p>
        </div>
        <div className="h-1 w-40 overflow-hidden rounded-full bg-black/5">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-brand-500" />
        </div>
      </div>
    </div>
  );
}
