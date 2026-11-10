"use client";

import { usePathname } from "next/navigation";

/**
 * Full-page enter transition. Pure CSS opacity, so it is SSR-safe and never
 * creates a containing block for fixed elements like the cart bar.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-page-in">
      {children}
    </div>
  );
}
