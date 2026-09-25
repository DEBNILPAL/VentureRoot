"use client";

import React from "react";
import { useUIStore } from "@/stores/useUIStore";
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
  const language = useUIStore((s) => s.language);
  const rawText = typeof text === "string" 
    ? text 
    : (typeof children === "string" ? children : (text != null ? String(text) : ""));
  
  const { translated, isLoading } = useDynamicTranslation(rawText, language);

  if (isLoading && fallback) {
    return <>{fallback}</>;
  }

  return (
    <Component className={className}>
      {translated || rawText}
    </Component>
  );
};

