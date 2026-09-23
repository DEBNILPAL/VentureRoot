"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { DATA_SOURCE } from "./source";
import feasibilityData from "@/data/feasibility.json";
import { feasibilityApi } from "@/features/feasibility/api/feasibilityApi";

interface UseFeasibilityOptions {
  refreshIntervalMs?: number;
  autoRefresh?: boolean;
}

export const useFeasibility = (businessId: string, options?: UseFeasibilityOptions) => {
  // Helper to load persistent venture feasibility from client localStorage
  const getPersistedData = useCallback(() => {
    if (typeof window === "undefined" || !businessId) return null;
    try {
      const stored = localStorage.getItem(`ventureroot_feasibility_${businessId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (_) {}
    return null;
  }, [businessId]);

  const [data, setData] = useState<any | null>(() => {
    if (DATA_SOURCE === "json") return feasibilityData;
    return getPersistedData();
  });

  const [isLoading, setIsLoading] = useState(() => {
    if (DATA_SOURCE !== "database") return false;
    // If we already have persistent cached data for this venture, don't show blank loading state
    return !getPersistedData();
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchFeasibility = useCallback(async (isSilent = false) => {
    if (DATA_SOURCE !== "database" || !businessId) return;

    if (isSilent) {
      setIsRefreshing(true);
    } else {
      // Only set loading true if we don't already have persistent data
      const existing = getPersistedData();
      if (!existing) {
        setIsLoading(true);
      }
    }
    setError(null);

    try {
      const res: any = await feasibilityApi.getFeasibility(businessId);
      // API response shape: { success, message, data: { feasibility: { business, profile, mlStatus, feasibility, competitorRadar } } }
      const container = res?.data?.feasibility || res?.data || res;
      const core = container?.feasibility || container;

      const payload = (core && (core.market || core.pricing))
        ? {
            ...core,
            competitorRadar: container?.competitorRadar || res?.data?.competitorRadar || core?.competitorRadar || null,
            business: container?.business || res?.data?.business || core?.business || null,
            mlStatus: container?.mlStatus || null,
          }
        : (res?.data?.feasibility?.feasibility || null);

      if (payload) {
        setData(payload);
        setLastUpdated(new Date());

        // Persist on client so page refresh or tab switches remain 100% deterministic and fixed
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(`ventureroot_feasibility_${businessId}`, JSON.stringify(payload));
          } catch (_) {}
        }
      }
    } catch (err: any) {
      console.warn("[useFeasibility] Warning during fetch:", err?.message);
      setError(err);

      // Do NOT overwrite with mock dairy farm if we already have persistent venture data!
      setData((prev: any) => {
        if (prev) return prev;
        const persisted = getPersistedData();
        return persisted || feasibilityData;
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [businessId, getPersistedData]);

  // Initial fetch on mount / businessId change
  useEffect(() => {
    const persisted = getPersistedData();
    if (persisted) {
      setData(persisted);
      setIsLoading(false);
    } else {
      setData(null);
    }
    fetchFeasibility(false);
  }, [businessId, fetchFeasibility, getPersistedData]);

  // Periodic background refresh if refreshIntervalMs is set
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const intervalMs = options?.refreshIntervalMs || (options?.autoRefresh ? 60000 : 0);
    if (intervalMs > 0 && businessId) {
      intervalRef.current = setInterval(() => {
        fetchFeasibility(true);
      }, intervalMs);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [businessId, options?.refreshIntervalMs, options?.autoRefresh, fetchFeasibility]);

  const refetch = useCallback(() => {
    return fetchFeasibility(true);
  }, [fetchFeasibility]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refetch,
  };
};
