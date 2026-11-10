"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, toApiProblem } from "@/lib/api";
import type { ApiProblem, MutationResponse, PageResponse } from "@/types/api";

const PAGE_SIZE = 6;
const MAX_LIMIT = 100;
const FLASH_MS = 1_400;

export const MUTATION_PAGE_SIZE = PAGE_SIZE;

interface AccountMutations {
  items: MutationResponse[];
  total: number;
}

interface MutationPage {
  items: MutationResponse[];
  maxAccountTotal: number;
}

async function fetchAccountMutations(
  accountId: string,
  size: number,
): Promise<AccountMutations> {
  const { data } = await api.get<PageResponse<MutationResponse>>(
    `/ledger/accounts/${accountId}/mutations`,
    { params: { size }, skipErrorToast: true },
  );
  return { items: data.content, total: data.page.totalElements };
}

async function fetchMutations(
  primaryIds: string[],
  counterpartyIds: string[],
  limit: number,
): Promise<MutationPage> {
  const [primaryGroups, counterpartyGroups] = await Promise.all([
    Promise.all(primaryIds.map((id) => fetchAccountMutations(id, limit))),
    Promise.all(counterpartyIds.map((id) => fetchAccountMutations(id, limit))),
  ]);

  const primary = primaryGroups.flatMap((group) => group.items);
  const maxAccountTotal = primaryGroups.reduce(
    (max, group) => Math.max(max, group.total),
    0,
  );
  const transactionIds = new Set(primary.map((item) => item.transactionId));

  const counterparty = counterpartyGroups
    .flatMap((group) => group.items)
    .filter((item) => transactionIds.has(item.transactionId));

  return {
    items: [...primary, ...counterparty].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    ),
    maxAccountTotal,
  };
}

export function useMutations(
  primaryIds: string[],
  counterpartyIds: string[],
  version: number,
  limit: number = PAGE_SIZE,
) {
  const primaryKey = primaryIds.join(",");
  const counterpartyKey = counterpartyIds.join(",");
  const safeLimit = Math.min(limit, MAX_LIMIT);
  const requestKey = `${primaryKey}|${counterpartyKey}#${version}#${safeLimit}`;

  const [items, setItems] = useState<MutationResponse[]>([]);
  const [maxAccountTotal, setMaxAccountTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiProblem | null>(null);
  const [flashIds, setFlashIds] = useState<string[]>([]);

  const seen = useRef<Set<string>>(new Set());
  const newest = useRef<string | null>(null);
  const firstLoad = useRef(true);
  const timer = useRef<number | null>(null);

  const apply = useCallback((page: MutationPage) => {
    const merged = page.items;

    if (firstLoad.current) {
      merged.forEach((item) => seen.current.add(item.id));
      firstLoad.current = false;
    } else {
      const fresh = merged
        .filter((item) => !seen.current.has(item.id))
        .filter(
          (item) => !newest.current || item.createdAt > newest.current,
        )
        .map((item) => item.id);

      merged.forEach((item) => seen.current.add(item.id));

      if (fresh.length > 0) {
        setFlashIds(fresh);
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setFlashIds([]), FLASH_MS);
      }
    }

    if (merged.length > 0) {
      const maxCreated = merged.reduce(
        (max, item) => (item.createdAt > max ? item.createdAt : max),
        merged[0].createdAt,
      );
      if (!newest.current || maxCreated > newest.current) {
        newest.current = maxCreated;
      }
    }

    setItems(merged);
    setMaxAccountTotal(page.maxAccountTotal);
    setError(null);
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    const [groups] = requestKey.split("#");
    const [primary, counterparty] = groups.split("|");
    const primaryList = primary.split(",").filter(Boolean);

    if (primaryList.length === 0) {
      setLoading(false);
      return;
    }

    try {
      apply(
        await fetchMutations(
          primaryList,
          counterparty.split(",").filter(Boolean),
          safeLimit,
        ),
      );
    } catch (caught) {
      setError(toApiProblem(caught));
      setLoading(false);
    }
  }, [requestKey, safeLimit, apply]);

  useEffect(() => {
    const [groups] = requestKey.split("#");
    const [primary, counterparty] = groups.split("|");
    const primaryList = primary.split(",").filter(Boolean);

    if (primaryList.length === 0) return;

    let cancelled = false;
    fetchMutations(
      primaryList,
      counterparty.split(",").filter(Boolean),
      safeLimit,
    )
      .then((page) => {
        if (!cancelled) apply(page);
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setError(toApiProblem(caught));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey, safeLimit, apply]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return {
    items,
    loading: loading && Boolean(primaryKey),
    error,
    flashIds,
    refresh,
    hasMore: maxAccountTotal > safeLimit && safeLimit < MAX_LIMIT,
  };
}
