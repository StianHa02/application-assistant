import type { Metadata } from "next";

import { NewAnalysisForm } from "@/components/analysis/new-analysis-form";
import { getAiProvider } from "@/lib/ai";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "New analysis" };

export default async function NewAnalysisPage() {
  await requireUser();
  const provider = getAiProvider();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-4xl font-extrabold">New analysis</h1>
        <p className="mt-1 text-muted-foreground">Upload your CV and paste the job posting you want to apply for.</p>
      </div>
      <NewAnalysisForm demoMode={provider.name === "mock"} model={provider.model} />
    </div>
  );
}
