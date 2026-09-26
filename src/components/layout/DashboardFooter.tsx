"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { PageFooter } from "./PageFooter";

export const DashboardFooter: React.FC = () => {
  const pathname = usePathname();

  // On full-bleed report detail views, the report canvas has its own integrated footer
  // and extends to the very bottom, preventing background orbs from peeking through
  if (pathname?.startsWith("/reports/")) {
    return null;
  }

  return <PageFooter className="mt-auto py-5 pb-24 md:pb-5" />;
};
