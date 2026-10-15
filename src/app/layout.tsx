import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";

import "./globals.css";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/i18n/client";
import { getLocale } from "@/i18n/server";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const ibmPlexMono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-ibm" });

export const metadata: Metadata = {
  title: { default: "Søknadsassistenten", template: "%s | Søknadsassistenten" },
  description: "Gap-analyse av CV mot stillingsannonse, med begrunnelser og forslag til søknadsbrev.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale === "nb" ? "no" : "en"} suppressHydrationWarning>
      <body className={`${inter.variable} ${ibmPlexMono.variable} flex min-h-screen flex-col bg-background font-sans text-foreground antialiased`}>
        <ThemeProvider>
          <I18nProvider locale={locale}>
            <SiteHeader />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">{children}</main>
            <SiteFooter />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
