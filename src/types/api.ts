export type Currency = "IDR" | "A_POIN";
export type AccountType = "ASSET" | "LIABILITY" | "REVENUE" | "EXPENSE";
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "CLOSED";
export type EntryType = "DEBIT" | "CREDIT";
export type ReferenceType =
  | "PAYMENT"
  | "REDEMPTION"
  | "REFUND"
  | "REWARD"
  | "SETTLEMENT";
export type VoucherStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "EXPIRED";

export interface PageMetadata {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface SortInfo {
  field: string;
  direction: string;
}

export interface PageResponse<T> {
  content: T[];
  page: PageMetadata;
  sort: SortInfo[];
  filters: Record<string, unknown>;
}

export interface AccountResponse {
  id: string;
  ownerId: string;
  accountName: string;
  accountType: AccountType;
  currency: Currency;
  balance: number;
  openingBalance: number;
  status: AccountStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccountCreateRequest {
  ownerId: string;
  accountName: string;
  accountType: AccountType;
  currency: Currency;
  initialBalance?: number;
}

export interface BalanceResponse {
  accountId: string;
  ownerId: string;
  currency: Currency;
  balance: number;
  status: AccountStatus;
  asOf: string;
}

export interface MutationResponse {
  id: string;
  transactionId: string;
  accountId: string;
  entryType: EntryType;
  amount: number;
  description: string;
  createdAt: string;
}

export interface TransactionSummaryResponse {
  id: string;
  idempotencyKey: string;
  referenceType: ReferenceType;
  description: string;
  createdAt: string;
  entryCount: number;
  totalAmount: number;
}

export interface Entry {
  id: string;
  accountId: string;
  ownerId: string;
  accountType: AccountType;
  currency: Currency;
  entryType: EntryType;
  amount: number;
  createdAt: string;
}

export interface TransactionDetailResponse {
  id: string;
  idempotencyKey: string;
  referenceType: ReferenceType;
  description: string;
  createdAt: string;
  totalDebit: number;
  totalCredit: number;
  balanced: boolean;
  entries: Entry[];
}

export interface TenderDetail {
  currency: Currency;
  amount: number;
  description: string;
}

export interface CheckoutRequest {
  ownerId: string;
  merchantId: string;
  totalAmount: number;
  tenders: TenderDetail[];
  idempotencyKey: string;
  currency: Currency;
}

export interface CheckoutResponse {
  transactionId: string;
  ownerId: string;
  merchantId: string;
  currency: Currency;
  totalAmount: number;
  balanceRemaining: number;
  processedAt: string;
  status: string;
}

export interface AuthLoginRequest {
  username: string;
  password: string;
}

export interface AuthLoginResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  refreshToken: string;
  username: string;
  roles: string[];
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  fullName: string;
  enabled: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VoucherResponse {
  id: string;
  code: string;
  name: string;
  description: string;
  pointsCost: number;
  totalQuota: number;
  remainingQuota: number;
  startsAt: string;
  endsAt: string;
  status: VoucherStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherRedeemRequest {
  ownerId: string;
}

export interface VoucherRedemptionResponse {
  voucherId: string;
  voucherCode: string;
  ownerId: string;
  transactionId: string;
  pointsSpent: number;
  remainingQuota: number;
  redeemedAt: string;
  status: string;
}

/**
 * Normalized RFC 7807 problem. The backend advertises
 * `application/problem+json`; the interceptor also accepts `application/json`.
 */
export interface ApiProblem {
  status: number;
  title: string;
  detail?: string;
  errorCode?: string;
  instance?: string;
  type?: string;
}

export interface ReconciliationDiscrepancy {
  id: string;
  accountId: string;
  discrepancyType: string;
  expectedBalance: number;
  actualBalance: number;
  variance: number;
  detail: string;
  createdAt: string;
}

export interface ReconciliationRunResponse {
  id: string;
  status: "BALANCED" | "DISCREPANCY";
  accountsChecked: number;
  discrepancyCount: number;
  unbalancedJournalCount: number;
  totalAbsVariance: number;
  triggeredBy: string | null;
  notes: string | null;
  startedAt: string;
  completedAt: string;
  discrepancies?: ReconciliationDiscrepancy[];
}

export interface OutboxEventResponse {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  status: "PENDING" | "PUBLISHED" | "FAILED";
  attempts: number;
  lastError: string | null;
  createdAt: string;
  publishedAt: string | null;
  payload: string;
}

export interface OutboxSummaryResponse {
  pending: number;
  published: number;
  failed: number;
  total: number;
}

export interface IdempotencyInspectionResponse {
  key: string;
  entries: Array<{
    redisKey: string;
    scope: string | null;
    ttlSeconds: number;
    fingerprint: string | null;
    cachedResponse: unknown;
  }>;
}

export interface VoucherCreateRequest {
  code: string;
  name: string;
  description?: string;
  pointsCost: number;
  totalQuota: number;
  startsAt: string;
  endsAt: string;
}

export interface VoucherStatusRequest {
  status: VoucherStatus;
}
