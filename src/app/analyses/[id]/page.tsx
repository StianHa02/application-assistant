import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AnalysisView } from "@/components/analysis/analysis-view";
import { getAnalysis } from "@/lib/analyses";
import { checkEvidence, computeCoverage } from "@/lib/analysis";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Analyse" };

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const analysis = await getAnalysis(user.id, id);
  // Other users' analyses look exactly like ones that don't exist.
  if (!analysis || !analysis.gapAnalysis) notFound();

  return (
    <AnalysisView
      id={analysis.id}
      title={analysis.title}
      cvText={analysis.cvText}
      posting={analysis.posting}
      provider={analysis.provider}
      model={analysis.model}
      promptVersion={analysis.promptVersion}
      gap={analysis.gapAnalysis}
      requirements={checkEvidence(analysis.gapAnalysis, analysis.cvText)}
      coverage={computeCoverage(analysis.gapAnalysis.requirements)}
      letter={analysis.coverLetter}
    />
  );
}
