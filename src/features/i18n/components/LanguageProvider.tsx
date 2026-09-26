"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Language, SUPPORTED_LANGUAGES, useUIStore } from "@/stores/useUIStore";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
});

interface LanguageProviderProps {
  initialLanguage?: Language;
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  initialLanguage = "en",
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  // Sync state if initialLanguage prop changes from server
  useEffect(() => {
    if (initialLanguage && initialLanguage !== language) {
      setLanguageState(initialLanguage);
    }
  }, [initialLanguage]);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    useUIStore.getState().setLanguage(newLang);
  };

  // Synchronize zustand store with the active language
  useEffect(() => {
    if (language) {
      useUIStore.getState().setLanguage(language);
    }
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context && context.language) {
    return context;
  }
  return {
    language: useUIStore((s) => s.language),
    setLanguage: useUIStore((s) => s.setLanguage),
  };
};
