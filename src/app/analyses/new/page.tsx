import type { Metadata } from "next";

import { NewAnalysisForm } from "@/components/analysis/new-analysis-form";
import { getI18n } from "@/i18n/server";
import { isDemoMode } from "@/lib/ai";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Ny analyse" };

export default async function NewAnalysisPage() {
  await requireUser();
  const { t } = await getI18n();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t.newAnalysis.title}</h1>
        <p className="text-muted-foreground">{t.newAnalysis.subtitle}</p>
      </div>
      <NewAnalysisForm demoMode={isDemoMode()} />
    </div>
  );
}
