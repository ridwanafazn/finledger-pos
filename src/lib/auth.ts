import type { AuthLoginResponse } from "@/types/api";

const ACCESS_TOKEN_KEY = "finledger.access_token";
const REFRESH_TOKEN_KEY = "finledger.refresh_token";
const USERNAME_KEY = "finledger.username";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getUsername(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(USERNAME_KEY);
}

export function hasSession(): boolean {
  return Boolean(getAccessToken());
}

export function setSession(auth: AuthLoginResponse): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
  if (auth.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
  }
  if (auth.username) {
    window.localStorage.setItem(USERNAME_KEY, auth.username);
  }
}

export function clearSession(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(USERNAME_KEY);
}
