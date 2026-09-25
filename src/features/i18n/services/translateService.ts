"use client";

import { useState, useEffect } from "react";
import { Language } from "@/stores/useUIStore";

// In-memory client cache: key = `${targetLang}:${text.trim()}`
const clientCache = new Map<string, string>();
// Pending request promises to prevent duplicate simultaneous calls
const pendingRequests = new Map<string, Promise<string>>();

/**
 * Translates a single dynamic string on the fly using the /api/translate route
 */
export async function translateDynamicText(
  text: string,
  targetLang: Language,
  sourceLang: string = "auto"
): Promise<string> {
  if (!text || typeof text !== "string") {
    return text || "";
  }

  // If target language is English or matches source, return original immediately
  if (targetLang === "en" || targetLang === sourceLang) {
    return text;
  }

  const trimmed = text.trim();
  if (!trimmed) return text;

  const cacheKey = `${targetLang}:${trimmed}`;

  // 1. Check in-memory cache
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey)!;
  }

  // 2. Check localStorage cache if available
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(`vr_trans_${cacheKey}`);
      if (stored) {
        clientCache.set(cacheKey, stored);
        return stored;
      }
    } catch {
      // Storage unavailable or disabled
    }
  }

  // 3. Deduplicate concurrent requests for the same key
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang, sourceLang }),
      });

      if (!res.ok) {
        throw new Error(`Translation HTTP error: ${res.status}`);
      }

      const data = await res.json();
      const translated = data.translatedText || text;

      // Update in-memory cache
      clientCache.set(cacheKey, translated);

      // Persist in localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`vr_trans_${cacheKey}`, translated);
        } catch {
          // ignore quota error
        }
      }

      return translated;
    } catch (err) {
      console.warn(`[Translate] Request failed for "${text.slice(0, 30)}...":`, err);
      return text; // Graceful fallback to original text
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

/**
 * Translates an array of strings in one single batch HTTP call
 */
export async function translateDynamicBatch(
  texts: string[],
  targetLang: Language,
  sourceLang: string = "auto"
): Promise<string[]> {
  if (!texts || !Array.isArray(texts) || texts.length === 0) return [];
  if (targetLang === "en") return texts;

  // Identify which ones are already cached
  const results = new Array<string>(texts.length);
  const missingIndices: number[] = [];
  const missingTexts: string[] = [];

  texts.forEach((item, idx) => {
    if (!item || typeof item !== "string") {
      results[idx] = item || "";
      return;
    }
    const cacheKey = `${targetLang}:${item.trim()}`;
    if (clientCache.has(cacheKey)) {
      results[idx] = clientCache.get(cacheKey)!;
    } else {
      let stored: string | null = null;
      if (typeof window !== "undefined") {
        try {
          stored = localStorage.getItem(`vr_trans_${cacheKey}`);
        } catch (_) {}
      }
      if (stored) {
        clientCache.set(cacheKey, stored);
        results[idx] = stored;
      } else {
        missingIndices.push(idx);
        missingTexts.push(item);
      }
    }
  });

  if (missingTexts.length === 0) {
    return results;
  }

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: missingTexts, targetLang, sourceLang }),
    });

    if (res.ok) {
      const data = await res.json();
      const translations: string[] = data.translations || missingTexts;
      translations.forEach((trans, i) => {
        const originalIndex = missingIndices[i];
        const originalText = missingTexts[i];
        const cacheKey = `${targetLang}:${originalText.trim()}`;
        clientCache.set(cacheKey, trans);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(`vr_trans_${cacheKey}`, trans);
          } catch (_) {}
        }
        results[originalIndex] = trans;
      });
    } else {
      missingIndices.forEach((idx, i) => {
        results[idx] = missingTexts[i];
      });
    }
  } catch (err) {
    console.warn("[Translate] Batch request failed:", err);
    missingIndices.forEach((idx, i) => {
      results[idx] = missingTexts[i];
    });
  }

  return results;
}

/**
 * React hook for dynamically translating single text on the fly
 */
export function useDynamicTranslation(text: string, targetLang: Language) {
  const [translated, setTranslated] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!text) {
      setTranslated("");
      return;
    }

    if (targetLang === "en") {
      setTranslated(text);
      return;
    }

    const cacheKey = `${targetLang}:${text.trim()}`;
    if (clientCache.has(cacheKey)) {
      setTranslated(clientCache.get(cacheKey)!);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    translateDynamicText(text, targetLang)
      .then((res) => {
        if (isMounted) {
          setTranslated(res);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTranslated(text);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [text, targetLang]);

  return { translated, isLoading };
}

/**
 * React hook for dynamically translating an array of strings
 */
export function useDynamicBatchTranslation(texts: string[], targetLang: Language) {
  const [translatedList, setTranslatedList] = useState<string[]>(texts);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!texts || texts.length === 0) {
      setTranslatedList([]);
      return;
    }

    if (targetLang === "en") {
      setTranslatedList(texts);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    translateDynamicBatch(texts, targetLang)
      .then((res) => {
        if (isMounted) {
          setTranslatedList(res);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTranslatedList(texts);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(texts), targetLang]);

  return { translatedList, isLoading };
}

