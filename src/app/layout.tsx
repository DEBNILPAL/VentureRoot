import type { Metadata, Viewport } from "next";
import { Poppins, Lora } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/features/i18n/components/LanguageProvider";
import { Language } from "@/stores/useUIStore";
import { GoogleTranslateProvider } from "@/features/i18n/components/GoogleTranslateProvider";
import { TourProvider } from "@/components/tour/TourProvider";
import PwaRegister from "@/components/pwa/PwaRegister";
import InstallPrompt from "@/components/pwa/InstallPrompt";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-heading",
});

export const viewport: Viewport = {
  themeColor: "#1E6702",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "VentureRoot — Business Feasibility & Planning",
    template: "%s | VentureRoot",
  },
  description: "VentureRoot — Business Feasibility & Planning Platform",
  applicationName: "VentureRoot",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VentureRoot",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

const VALID_LANGUAGES: Language[] = ["en", "bn", "hi", "pa", "mr", "ta", "te"];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get("ventureroot_locale")?.value as Language;
  const locale: Language = VALID_LANGUAGES.includes(rawLocale) ? rawLocale : "en";

  return (
    <html lang={locale} className={`${poppins.variable} ${lora.variable} font-sans`} suppressHydrationWarning>
      <body className="antialiased text-[#200813] bg-[#f4fce8]" suppressHydrationWarning>
        <LanguageProvider initialLanguage={locale}>
          <GoogleTranslateProvider />
          <TourProvider>
            {children}
          </TourProvider>
          <PwaRegister />
          <InstallPrompt />
        </LanguageProvider>
      </body>
    </html>
  );
}

