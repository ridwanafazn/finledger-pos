import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { clearSession, getAccessToken } from "@/lib/auth";
import { defaultTitle, humanizeProblem } from "@/lib/error-copy";
import { newIdempotencyKey } from "@/lib/idempotency";
import type { ApiProblem } from "@/types/api";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** Suppress the automatic RFC 7807 toast (caller handles the error). */
    skipErrorToast?: boolean;
    /** Do not clear the session / redirect on 401. */
    skipAuthRedirect?: boolean;
  }
}

/** Upstream FinLedger Engine, used by the Next.js rewrite proxy. */
export const API_UPSTREAM_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

/**
 * Browser-facing base URL. Defaults to the same-origin proxy so the app is
 * not blocked by backend CORS rules. Set NEXT_PUBLIC_API_DIRECT=true to call
 * the upstream directly (requires the backend to allow this origin).
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_DIRECT === "true"
    ? API_UPSTREAM_URL
    : "/api/backend";

/** Fired when the API answers 401 and the session has been cleared. */
export const UNAUTHORIZED_EVENT = "finledger:unauthorized";

export class ApiProblemError extends Error {
  readonly problem: ApiProblem;

  constructor(problem: ApiProblem) {
    super(problem.title);
    this.name = "ApiProblemError";
    this.problem = problem;
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  const method = (config.method ?? "get").toUpperCase();
  const needsKey = method === "POST" || method === "PATCH";
  if (needsKey && !config.headers.has("X-Idempotency-Key")) {
    config.headers.set("X-Idempotency-Key", newIdempotencyKey());
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const problem = toApiProblem(error);
    const config = (error.config ?? {}) as AxiosRequestConfig;

    if (problem.status === 401 && !config.skipAuthRedirect) {
      clearSession();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      }
    }

    if (!config.skipErrorToast) {
      const copy = humanizeProblem(problem);
      toast.error(copy.title, { description: copy.description });
    }

    return Promise.reject(new ApiProblemError(problem));
  },
);

function readString(source: Record<string, unknown>, key: string) {
  const value = source[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * Normalizes any thrown value into an RFC 7807 shaped problem.
 * The backend advertises `application/problem+json`, but some handlers
 * still answer with `application/json`, so both are accepted.
 */
export function toApiProblem(error: unknown): ApiProblem {
  if (error instanceof ApiProblemError) {
    return error.problem;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;

    if (data && typeof data === "object" && !Array.isArray(data)) {
      const body = data as Record<string, unknown>;
      const title = readString(body, "title");
      const detail = readString(body, "detail");
      const errorCode =
        readString(body, "errorCode") ?? readString(body, "code");

      if (title || detail || errorCode) {
        return {
          status,
          title: title ?? defaultTitle(status),
          detail,
          errorCode,
          instance: readString(body, "instance"),
          type: readString(body, "type"),
        };
      }
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return {
        status: 0,
        title: "Waktu permintaan habis",
        detail: "Backend tidak merespons dalam batas waktu.",
      };
    }

    if (!error.response) {
      return {
        status: 0,
        title: "Backend tidak dapat dihubungi",
        detail: `Tidak ada respons dari ${API_UPSTREAM_URL}. Pastikan FinLedger Engine berjalan.`,
      };
    }

    return { status, title: defaultTitle(status) };
  }

  return {
    status: 0,
    title: "Terjadi kesalahan tak terduga",
    detail: error instanceof Error ? error.message : undefined,
  };
}

/**
 * Sends a request with an explicit idempotency key.
 * Used by the stress test so all five attempts share one key.
 */
export function withIdempotencyKey(key: string): AxiosRequestConfig {
  return { headers: { "X-Idempotency-Key": key } };
}
