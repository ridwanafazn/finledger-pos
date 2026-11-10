"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UNAUTHORIZED_EVENT } from "@/lib/api";
import { useHasSession } from "./use-session";

/**
 * Guards a client page: redirects when there is no session and when the API
 * reports an expired token. Returns the tri-state session value so the page
 * can render a boot screen until the client snapshot is known.
 */
export function useAuthGuard(): boolean | null {
  const router = useRouter();
  const authenticated = useHasSession();

  useEffect(() => {
    if (authenticated === false) {
      router.replace("/login");
    }
  }, [authenticated, router]);

  useEffect(() => {
    function handleUnauthorized() {
      router.replace("/login");
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [router]);

  return authenticated;
}
