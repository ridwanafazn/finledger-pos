import type { Product } from "@/lib/catalog";

export interface CartLine {
  product: Product;
  qty: number;
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.product.price * line.qty, 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}
