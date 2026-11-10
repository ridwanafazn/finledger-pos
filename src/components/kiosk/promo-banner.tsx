import { Gift, Percent, Ticket } from "lucide-react";

const PROMOS = [
  {
    icon: Percent,
    title: "Diskon 20 persen",
    subtitle: "Maksimal Rp20.000, minimal belanja Rp100.000",
    tone: "bg-brand-50 text-brand-600",
  },
  {
    icon: Ticket,
    title: "Tukar 100 poin",
    subtitle: "Voucher belanja mingguan terbatas",
    tone: "bg-ink-900 text-white",
  },
  {
    icon: Gift,
    title: "Gratis ongkir",
    subtitle: "Khusus pengambilan di toko",
    tone: "bg-amber-50 text-amber-700",
  },
];

export function PromoBanner() {
  return (
    <section aria-labelledby="promo-heading" className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h2 id="promo-heading" className="text-[13px] font-bold tracking-tight">
          Promo hari ini
        </h2>
        <span className="text-[11px] font-medium text-ink-400">
          {PROMOS.length} penawaran
        </span>
      </div>

      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {PROMOS.map((promo) => {
          const Icon = promo.icon;
          return (
            <article
              key={promo.title}
              className="w-[240px] shrink-0 snap-start rounded-2xl border border-border bg-surface p-4 transition-colors duration-200 hover:border-ink-400/30"
            >
              <span
                className={`grid size-9 place-items-center rounded-xl ${promo.tone}`}
              >
                <Icon className="size-4" />
              </span>
              <p className="mt-3 text-[14px] font-semibold leading-tight text-ink-900">
                {promo.title}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                {promo.subtitle}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
