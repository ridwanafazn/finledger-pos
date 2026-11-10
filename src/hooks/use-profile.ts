"use client";

import { useCallback, useEffect, useState } from "react";
import { api, toApiProblem } from "@/lib/api";
import type { ApiProblem, UserResponse } from "@/types/api";

async function fetchProfile(): Promise<UserResponse> {
  const { data } = await api.get<UserResponse>("/auth/me", {
    skipErrorToast: true,
  });
  return data;
}

export function useProfile() {
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiProblem | null>(null);

  const refresh = useCallback(async () => {
    try {
      setProfile(await fetchProfile());
      setError(null);
    } catch (caught) {
      setError(toApiProblem(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchProfile()
      .then((next) => {
        if (cancelled) return;
        setProfile(next);
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

  return { profile, loading, error, refresh };
}
