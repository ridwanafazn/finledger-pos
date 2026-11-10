"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { MERCHANT_ID } from "@/lib/config";
import type { AccountResponse, PageResponse } from "@/types/api";

/**
 * Merchant accounts are included in the audit view so both sides of each
 * double-entry transaction (customer debit + merchant credit) are visible.
 */
export function useMerchantAccounts(): AccountResponse[] {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);

  useEffect(() => {
    let cancelled = false;
    api
      .get<PageResponse<AccountResponse>>("/ledger/accounts", {
        params: { ownerId: MERCHANT_ID, size: 10 },
        skipErrorToast: true,
      })
      .then(({ data }) => {
        if (!cancelled) setAccounts(data.content);
      })
      .catch(() => {
        // Audit still works with the customer accounts only.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return accounts;
}
