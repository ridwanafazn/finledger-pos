"use client";

import { api, toApiProblem } from "@/lib/api";
import { MERCHANT_ID, OWNER_ID } from "@/lib/config";
import { newIdempotencyKey } from "@/lib/idempotency";
import type {
  AccountResponse,
  CheckoutRequest,
  CheckoutResponse,
  Currency,
  IdempotencyInspectionResponse,
  OutboxSummaryResponse,
  PageResponse,
  ReconciliationRunResponse,
  VoucherRedemptionResponse,
  VoucherResponse,
} from "@/types/api";

export interface BurstResult {
  index: number;
  ok: boolean;
  status: number;
  durationMs: number;
  transactionId?: string;
  errorCode?: string;
  detail?: string;
}

export interface IdempotencyBurst {
  key: string;
  before: number;
  after: number;
  results: BurstResult[];
  replay: BurstResult;
}

export interface ConcurrencyResult {
  ownerId: string;
  ok: boolean;
  status: number;
  durationMs: number;
  remainingQuota?: number;
  errorCode?: string;
  detail?: string;
}

export interface ConcurrencyBurst {
  voucher: VoucherResponse;
  results: ConcurrencyResult[];
}

const PROOF_ACCOUNT_COUNT = 20;
const PROOF_ACCOUNT_PREFIX = "proof-user-";

function proofOwnerId(index: number): string {
  return `${PROOF_ACCOUNT_PREFIX}${String(index + 1).padStart(2, "0")}`;
}

async function fetchBalance(currency: Currency): Promise<number> {
  const { data } = await api.get<PageResponse<AccountResponse>>(
    "/ledger/accounts",
    {
      params: { ownerId: OWNER_ID, currency, size: 1 },
      skipErrorToast: true,
    },
  );
  return data.content[0]?.balance ?? 0;
}

/**
 * Sends five identical checkouts with one shared idempotency key.
 * The backend must create exactly one transaction and debit the balance once.
 */
export async function runIdempotencyBurst(amount = 1_000): Promise<IdempotencyBurst> {
  const key = newIdempotencyKey();
  const before = await fetchBalance("IDR");

  const payload: CheckoutRequest = {
    ownerId: OWNER_ID,
    merchantId: MERCHANT_ID,
    totalAmount: amount,
    currency: "IDR",
    idempotencyKey: key,
    tenders: [
      {
        currency: "IDR",
        amount,
        description: "Proof idempotency",
      },
    ],
  };

  const results = await Promise.all(
    Array.from({ length: 5 }, (_, index) => {
      const started = performance.now();
      return api
        .post<CheckoutResponse>("/ledger/checkout", payload, {
          headers: { "X-Idempotency-Key": key },
          skipErrorToast: true,
        })
        .then((response) => ({
          index,
          ok: true,
          status: 200,
          durationMs: performance.now() - started,
          transactionId: response.data.transactionId,
        }))
        .catch((caught: unknown) => {
          const problem = toApiProblem(caught);
          return {
            index,
            ok: false,
            status: problem.status,
            durationMs: performance.now() - started,
            errorCode: problem.errorCode,
            detail: problem.detail ?? problem.title,
          };
        });
    }),
  );

  // A sequential replay after the burst should be served from the Redis cache.
  const replayStarted = performance.now();
  let replay: BurstResult;
  try {
    const { data } = await api.post<CheckoutResponse>("/ledger/checkout", payload, {
      headers: { "X-Idempotency-Key": key },
      skipErrorToast: true,
    });
    replay = {
      index: -1,
      ok: true,
      status: 200,
      durationMs: performance.now() - replayStarted,
      transactionId: data.transactionId,
    };
  } catch (caught) {
    const problem = toApiProblem(caught);
    replay = {
      index: -1,
      ok: false,
      status: problem.status,
      durationMs: performance.now() - replayStarted,
      errorCode: problem.errorCode,
      detail: problem.detail ?? problem.title,
    };
  }

  const after = await fetchBalance("IDR");
  return { key, before, after, results, replay };
}

/**
 * Creates the proof accounts once, then ignores "already exists" responses.
 * Each account starts with 1.000 A-Poin so repeated runs stay cheap.
 */
async function ensureProofAccounts(): Promise<void> {
  try {
    const { data } = await api.get<PageResponse<AccountResponse>>(
      "/ledger/accounts",
      {
        params: { ownerId: proofOwnerId(0), size: 1 },
        skipErrorToast: true,
      },
    );
    if (data.content.length > 0) return;
  } catch {
    // Fall through to creation when the probe fails.
  }

  await Promise.allSettled(
    Array.from({ length: PROOF_ACCOUNT_COUNT }, (_, index) =>
      api.post(
        "/ledger/accounts",
        {
          ownerId: proofOwnerId(index),
          accountName: `Proof User ${index + 1}`,
          accountType: "LIABILITY",
          currency: "A_POIN",
          initialBalance: 1_000,
        },
        { skipErrorToast: true },
      ),
    ),
  );
}

function localDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Creates a voucher with quota 5, then fires 20 concurrent redemptions from
 * 20 distinct owners. Exactly five must succeed and the quota must reach zero.
 */
export async function runConcurrencyBurst(): Promise<ConcurrencyBurst> {
  await ensureProofAccounts();

  const now = Date.now();
  const startsAt = localDateTime(new Date(now - 60 * 60 * 1_000));
  const endsAt = localDateTime(new Date(now + 60 * 60 * 1_000));

  const { data: created } = await api.post<VoucherResponse>("/vouchers", {
    code: `PROOF-${now}`,
    name: "Proof Concurrency",
    description: "Voucher untuk membuktikan kuota tidak oversell",
    pointsCost: 1,
    totalQuota: 5,
    startsAt,
    endsAt,
  });

  await api.patch(`/vouchers/${created.id}/status`, { status: "ACTIVE" });

  const results = await Promise.all(
    Array.from({ length: PROOF_ACCOUNT_COUNT }, (_, index) => {
      const ownerId = proofOwnerId(index);
      const started = performance.now();
      return api
        .post<VoucherRedemptionResponse>(
          `/vouchers/${created.id}/redeem`,
          { ownerId },
          {
            headers: { "X-Idempotency-Key": newIdempotencyKey() },
            skipErrorToast: true,
          },
        )
        .then((response) => ({
          ownerId,
          ok: true,
          status: 200,
          durationMs: performance.now() - started,
          remainingQuota: response.data.remainingQuota,
        }))
        .catch((caught: unknown) => {
          const problem = toApiProblem(caught);
          return {
            ownerId,
            ok: false,
            status: problem.status,
            durationMs: performance.now() - started,
            errorCode: problem.errorCode,
            detail: problem.detail ?? problem.title,
          };
        });
    }),
  );

  const { data: voucher } = await api.get<VoucherResponse>(
    `/vouchers/${created.id}`,
  );

  return { voucher, results };
}

export async function runReconciliation(): Promise<ReconciliationRunResponse> {
  const { data } = await api.post<ReconciliationRunResponse>(
    "/reconciliation/runs",
    { notes: "Proof Center" },
  );
  return data;
}

export async function fetchReconciliationHistory(): Promise<
  ReconciliationRunResponse[]
> {
  const { data } = await api.get<PageResponse<ReconciliationRunResponse>>(
    "/reconciliation/runs",
    { params: { size: 5 }, skipErrorToast: true },
  );
  return data.content;
}

export async function fetchIdempotencyCache(
  key: string,
): Promise<IdempotencyInspectionResponse> {
  const { data } = await api.get<IdempotencyInspectionResponse>(
    "/admin/idempotency",
    { params: { key }, skipErrorToast: true },
  );
  return data;
}

export async function fetchOutboxSummary(): Promise<OutboxSummaryResponse> {
  const { data } = await api.get<OutboxSummaryResponse>(
    "/admin/outbox/summary",
    { skipErrorToast: true },
  );
  return data;
}
