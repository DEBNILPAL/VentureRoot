"use client";

import React from "react";
import { useLanguage } from "./LanguageProvider";
import { useDynamicTranslation } from "../services/translateService";

interface DynamicTextProps {
  text?: string | number | null;
  children?: React.ReactNode;
  as?: React.ElementType;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Component for translating dynamic, user-generated, or AI-generated strings on the fly
 */
export const DynamicText: React.FC<DynamicTextProps> = ({
  text,
  children,
  as: Component = "span",
  className = "",
  fallback,
}) => {
  const { language } = useLanguage();
  const rawText = typeof text === "string" 
    ? text 
    : (typeof children === "string" ? children : (text != null ? String(text) : ""));
  
  const { translated, isLoading } = useDynamicTranslation(rawText, language);

  if (isLoading && fallback) {
    return <>{fallback}</>;
  }

  return (
    <Component className={`notranslate ${className}`.trim()} translate="no">
      {translated || rawText}
    </Component>
  );
};

