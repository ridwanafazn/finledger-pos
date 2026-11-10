/**
 * Demo identity used by the kiosk. The backend has no user -> owner mapping,
 * so the wallet owner is configured explicitly.
 */
export const OWNER_ID = process.env.NEXT_PUBLIC_OWNER_ID ?? "demo-customer";
export const MERCHANT_ID = process.env.NEXT_PUBLIC_MERCHANT_ID ?? "merch-001";

export const APP_NAME = "zLedger";
export const APP_TAGLINE = "Belanja hemat, poin tetap utuh.";
