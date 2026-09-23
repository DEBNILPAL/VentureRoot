import React from "react";

import { TopNav } from "@/components/layout/TopNav";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { DashboardBackground } from "@/components/layout/DashboardBackground";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardFooter } from "@/components/layout/DashboardFooter";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-[#f4fce8] relative">
        <DashboardBackground />
        <TopNav />
        <main className="flex-1 w-full relative z-10 flex flex-col justify-between pb-20 md:pb-0">
          <div className="flex-1 w-full">{children}</div>
          <DashboardFooter />
        </main>
        <MobileBottomNav />
      </div>
    </ProtectedRoute>
  );
}
