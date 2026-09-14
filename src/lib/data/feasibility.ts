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
  const [data, setData] = useState<any | null>(
    DATA_SOURCE === "json" ? feasibilityData : null
  );
  const [isLoading, setIsLoading] = useState(DATA_SOURCE === "database");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchFeasibility = useCallback(async (isSilent = false) => {
    if (DATA_SOURCE !== "database" || !businessId) return;

    if (isSilent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const res: any = await feasibilityApi.getFeasibility(businessId);
      // API response shape: { success, message, data: { feasibility: { business, profile, mlStatus, feasibility } } }
      const rawPayload =
        res?.data?.feasibility?.feasibility ||   // nested: data.feasibility.feasibility (the FeasibilityData)
        res?.data?.feasibility ||                 // flat: data.feasibility
        res?.data ||
        res;

      const payload = (rawPayload && (rawPayload.market || rawPayload.pricing))
        ? rawPayload
        : (res?.data?.feasibility?.feasibility || feasibilityData);

      setData(payload || feasibilityData);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.warn("[useFeasibility] Falling back to baseline feasibility data:", err);
      if (!data) {
        setData(feasibilityData);
      }
      setError(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [businessId, data]);

  // Initial fetch on mount / businessId change
  useEffect(() => {
    fetchFeasibility(false);
  }, [businessId]);

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
