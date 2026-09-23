"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { PrismFluxLoader } from "@/components/ui/prism-flux-loader";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    if (hasHydrated && !token) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [token, hasHydrated, router, pathname]);

  if (!hasHydrated || !token) {
    return (
      <div className="min-h-screen w-full bg-[#FFFBE7] flex items-center justify-center">
        <PrismFluxLoader size={34} speed={4} />
      </div>
    );
  }

  return <>{children}</>;
}
