"use client";
import { useState, useEffect, useCallback } from "react";
import { businessApi } from "@/features/business/api/businessApi";
import { BusinessDetails } from "@/features/business/components/BusinessDetailsView";
import { resolveCoordinatesForLocation } from "@/services/location-search.service";

/**
 * Returns a unique key for the currently authenticated user (email or ID).
 * Ensures businesses are strictly isolated and never mixed between different user accounts.
 */
export function getUserScopeKey(): string {
  if (typeof window === "undefined") return "server";
  const id = localStorage.getItem("ventureroot_user_id");
  const email = localStorage.getItem("ventureroot_user_email");
  if (id && id.trim()) return id.trim();
  if (email && email.trim()) return email.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
  return "guest";
}

export function normalizeBusinessLocation(biz: any) {
  if (!biz) return biz;
  if (!biz.location) return biz;
  const loc = biz.location;
  const resolved = resolveCoordinatesForLocation(loc);
  return {
    ...biz,
    location: {
      ...loc,
      lat: resolved.lat,
      lon: resolved.lon,
      latitude: resolved.lat,
      longitude: resolved.lon,
      subdistrict: loc.subdistrict || loc.block || loc.district || "",
      block: loc.block || loc.subdistrict || "",
      district: loc.district || "",
      state: loc.state || "",
      formatted: resolved.label,
    },
  };
}

export const useBusinessesComparison = () => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBusinesses = useCallback(async () => {
    setIsLoading(true);
    const scopeKey = getUserScopeKey();
    try {
      // 1. Fetch live from database for this authenticated user
      const res: any = await businessApi.list();
      const list =
        res?.data?.businesses ||
        res?.data?.data?.businesses ||
        res?.data?.items ||
        res?.items ||
        [];
      const items = Array.isArray(list) ? list : [];

      if (items.length > 0) {
        if (typeof window !== "undefined") {
          localStorage.setItem(`ventureroot_businesses_${scopeKey}`, JSON.stringify(items));
        }
        setData(items.map(normalizeBusinessLocation));
        setError(null);
        return;
      }

      // 2. If database query returned 0 items, check user-scoped local cache (newly added ventures)
      let userCached: any[] = [];
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(`ventureroot_businesses_${scopeKey}`);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) userCached = parsed;
          } catch (_) {}
        }
      }

      if (userCached.length > 0) {
        setData(userCached.map(normalizeBusinessLocation));
      } else {
        // Dynamic zero state: never display mock/hardcoded data from other accounts
        setData([]);
      }
      setError(null);
    } catch (err: any) {
      console.warn("[useBusinessesComparison] Database fetch notification:", err);
      setError(err);

      // Fallback strictly to this user's scoped cache only
      let userCached: any[] = [];
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem(`ventureroot_businesses_${scopeKey}`);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) userCached = parsed;
          } catch (_) {}
        }
      }

      if (userCached.length > 0) {
        setData(userCached.map(normalizeBusinessLocation));
      } else {
        setData([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();

    // Listen for custom event when business is created or updated
    const handleBusinessUpdate = () => {
      fetchBusinesses();
    };
    window.addEventListener("business-updated", handleBusinessUpdate);
    return () => window.removeEventListener("business-updated", handleBusinessUpdate);
  }, [fetchBusinesses]);

  return { data, isLoading, error, refetch: fetchBusinesses };
};

export const useBusinessDetails = (id: string) => {
  const [data, setData] = useState<BusinessDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const scopeKey = getUserScopeKey();

    const getFromCache = () => {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(`ventureroot_businesses_${scopeKey}`);
        if (cached) {
          try {
            const list = JSON.parse(cached);
            if (Array.isArray(list) && list.length > 0) {
              const found = list.find((b: any) => b.id === id);
              if (found) return normalizeBusinessLocation(found);
            }
          } catch (_) {}
        }
      }
      return null;
    };

    const cachedBiz = getFromCache();
    if (cachedBiz) {
      setData(cachedBiz as BusinessDetails);
      setIsLoading(false);
    }

    if (!id || id === "123") {
      if (!cachedBiz) {
        setData(null);
      }
      setIsLoading(false);
      return;
    }

    businessApi
      .get(id)
      .then((res: any) => {
        const details =
          res?.data?.business ||
          res?.data?.data?.business ||
          res?.data ||
          res;
        if (details) {
          const normalized = normalizeBusinessLocation(details);
          setData(normalized as BusinessDetails);
        } else if (!cachedBiz) {
          setData(null);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        if (!cachedBiz) {
          setData(null);
        }
        setIsLoading(false);
      });
  }, [id]);

  return { data, isLoading, error };
};

export async function deleteBusinessCompletely(id: string): Promise<boolean> {
  const scopeKey = getUserScopeKey();

  // 1. Erase from backend database
  try {
    await businessApi.delete(id);
  } catch (err: any) {
    console.warn("[deleteBusinessCompletely] Backend delete notice:", err?.message);
  }

  // 2. Erase from localStorage
  if (typeof window !== "undefined") {
    try {
      const cacheKey = `ventureroot_businesses_${scopeKey}`;
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          const filtered = list.filter((b: any) => b.id !== id);
          localStorage.setItem(cacheKey, JSON.stringify(filtered));
        }
      }

      // Also clean fallback default key if present
      const defaultKey = "ventureroot_businesses_default";
      const rawDefault = localStorage.getItem(defaultKey);
      if (rawDefault) {
        try {
          const list = JSON.parse(rawDefault);
          if (Array.isArray(list)) {
            localStorage.setItem(defaultKey, JSON.stringify(list.filter((b: any) => b.id !== id)));
          }
        } catch (_) {}
      }

      // Clean up cached selections & feasibility/finance caches
      if (localStorage.getItem("ventureroot_active_business_id") === id) {
        localStorage.removeItem("ventureroot_active_business_id");
      }
      localStorage.removeItem(`feasibility_${id}`);
      localStorage.removeItem(`finance_${id}`);
    } catch (_) {}

    // 3. Dispatch global event so all pages & hooks update instantly
    window.dispatchEvent(new Event("business-updated"));
  }

  return true;
}

