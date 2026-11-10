import type { ProductCategory } from "@/lib/catalog";
import { Cookie, CupSoda, Package, Sparkles, UtensilsCrossed } from "lucide-react";

const ICONS = {
  Sembako: Package,
  Minuman: CupSoda,
  Makanan: UtensilsCrossed,
  Snack: Cookie,
  Perawatan: Sparkles,
} as const;

const TONES: Record<ProductCategory, string> = {
  Sembako: "bg-amber-50 text-amber-700",
  Minuman: "bg-sky-50 text-sky-700",
  Makanan: "bg-orange-50 text-orange-700",
  Snack: "bg-rose-50 text-rose-700",
  Perawatan: "bg-violet-50 text-violet-700",
};

export function ProductIcon({
  category,
  className,
}: {
  category: ProductCategory;
  className?: string;
}) {
  const Icon = ICONS[category];
  return <Icon className={className} strokeWidth={1.6} />;
}

export function productTone(category: ProductCategory): string {
  return TONES[category];
}
