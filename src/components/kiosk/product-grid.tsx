"use client";

import { useMemo, useState } from "react";
import { Plus, SearchX } from "lucide-react";
import {
  CATEGORIES,
  PRODUCTS,
  type Product,
  type ProductCategory,
} from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProductIcon, productTone } from "./product-icon";

export function ProductGrid({
  query,
  onAdd,
}: {
  query: string;
  onAdd: (product: Product) => void;
}) {
  const [category, setCategory] = useState<ProductCategory | "Semua">("Semua");

  const products = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        category === "Semua" || product.category === category;
      const matchesQuery =
        needle.length === 0 || product.name.toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <section aria-labelledby="catalog-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id="catalog-heading" className="text-[13px] font-bold tracking-tight">
          Belanja kebutuhan
        </h2>
        <span className="text-[11px] font-medium text-ink-400">
          {products.length} produk
        </span>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((item) => {
          const active = category === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              aria-pressed={active}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors duration-200",
                active
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-border bg-surface text-ink-500 hover:border-ink-400/40 hover:text-ink-900",
              )}
            >
              {item}
            </button>
          );
        })}
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-surface px-6 py-10 text-center">
          <SearchX className="size-6 text-ink-400" />
          <p className="text-[13px] font-semibold">Produk tidak ditemukan</p>
          <p className="text-[12px] text-ink-500">
            Coba kata kunci atau kategori lain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xs transition-[border-color,box-shadow] duration-200 ease-out hover:border-ink-400/30 hover:shadow-sm"
            >
              <div
                className={cn(
                  "relative grid h-24 place-items-center",
                  productTone(product.category),
                )}
              >
                <ProductIcon
                  category={product.category}
                  className="size-8 opacity-80"
                />
                {product.badge ? (
                  <span className="absolute left-2 top-2 rounded-full bg-brand-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                    {product.badge}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col p-3">
                <p className="line-clamp-2 text-[12px] font-semibold leading-snug">
                  {product.name}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-ink-400">
                  {product.unit}
                </p>

                <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
                  <p className="text-[13px] font-bold tabular-nums">
                    {formatMoney(product.price, "IDR")}
                  </p>
                  <button
                    type="button"
                    onClick={() => onAdd(product)}
                    aria-label={`Tambah ${product.name} ke keranjang`}
                    className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-500 text-white transition-colors duration-200 hover:bg-brand-600 active:bg-brand-700"
                  >
                    <Plus className="size-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
