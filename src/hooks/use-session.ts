"use client";

import { useSyncExternalStore } from "react";
import { getUsername, hasSession } from "@/lib/auth";

const subscribe = () => () => {};

/**
 * Reads session state from localStorage without hydration mismatches.
 * Returns `null` until the client snapshot is known, so callers never
 * redirect based on the server's "no session" placeholder.
 */
export function useHasSession(): boolean | null {
  return useSyncExternalStore(subscribe, hasSession, () => null);
}

export function useUsername(): string | null {
  return useSyncExternalStore(subscribe, getUsername, () => null);
}
