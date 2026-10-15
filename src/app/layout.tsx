import type { Metadata } from "next";
import { IBM_Plex_Mono, Schibsted_Grotesk, Work_Sans } from "next/font/google";

import "./globals.css";

import { SiteHeader } from "@/components/site-header";

const schibsted = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-schibsted" });
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans" });
const ibmPlexMono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-ibm" });

export const metadata: Metadata = {
  title: { default: "Application Assistant", template: "%s | Application Assistant" },
  description: "Gap analysis of your CV against a job posting, with reasoning and cover-letter suggestions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${schibsted.variable} ${workSans.variable} ${ibmPlexMono.variable} flex min-h-screen flex-col bg-background font-sans text-foreground antialiased`}
      >
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-12 pb-24">{children}</main>
      </body>
    </html>
  );
}
