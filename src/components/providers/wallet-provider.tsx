"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, toApiProblem } from "@/lib/api";
import { OWNER_ID } from "@/lib/config";
import type { AccountResponse, ApiProblem, PageResponse } from "@/types/api";

interface WalletContextValue {
  accounts: AccountResponse[];
  idr: AccountResponse | null;
  points: AccountResponse | null;
  loading: boolean;
  error: ApiProblem | null;
  version: number;
  refresh: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

async function fetchWallet(): Promise<AccountResponse[]> {
  const { data } = await api.get<PageResponse<AccountResponse>>(
    "/ledger/accounts",
    {
      params: { ownerId: OWNER_ID, size: 10 },
      skipErrorToast: true,
    },
  );
  return data.content;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiProblem | null>(null);
  const [version, setVersion] = useState(0);

  const apply = useCallback((next: AccountResponse[]) => {
    setAccounts(next);
    setError(null);
    setLoading(false);
    setVersion((current) => current + 1);
  }, []);

  const refresh = useCallback(async () => {
    try {
      apply(await fetchWallet());
    } catch (caught) {
      setError(toApiProblem(caught));
      setLoading(false);
    }
  }, [apply]);

  useEffect(() => {
    let cancelled = false;
    fetchWallet()
      .then((next) => {
        if (!cancelled) apply(next);
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setError(toApiProblem(caught));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apply]);

  const value = useMemo<WalletContextValue>(() => {
    const idr = accounts.find((account) => account.currency === "IDR") ?? null;
    const points =
      accounts.find((account) => account.currency === "A_POIN") ?? null;
    return { accounts, idr, points, loading, error, version, refresh };
  }, [accounts, loading, error, version, refresh]);

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWalletContext(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used inside WalletProvider");
  }
  return context;
}
