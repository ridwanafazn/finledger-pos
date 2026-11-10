"use client";

import { useCallback, useEffect, useState } from "react";
import { api, toApiProblem } from "@/lib/api";
import type { ApiProblem, PageResponse, VoucherResponse } from "@/types/api";

async function fetchVouchers(): Promise<VoucherResponse[]> {
  const { data } = await api.get<PageResponse<VoucherResponse>>("/vouchers", {
    params: { activeOnly: true, size: 20 },
    skipErrorToast: true,
  });
  return data.content;
}

export function useVouchers() {
  const [vouchers, setVouchers] = useState<VoucherResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiProblem | null>(null);

  const refresh = useCallback(async () => {
    try {
      setVouchers(await fetchVouchers());
      setError(null);
    } catch (caught) {
      setError(toApiProblem(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchVouchers()
      .then((next) => {
        if (cancelled) return;
        setVouchers(next);
        setError(null);
        setLoading(false);
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setError(toApiProblem(caught));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { vouchers, loading, error, refresh };
}
