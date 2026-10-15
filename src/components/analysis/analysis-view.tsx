"use client";

import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { deleteAnalysis } from "@/app/actions/analyses";
import { CoverageRing } from "@/components/analysis/coverage-ring";
import { CoverLetterView } from "@/components/analysis/cover-letter-view";
import { GapView } from "@/components/analysis/gap-view";
import { ConfirmButton } from "@/components/confirm-button";
import { Card } from "@/components/ui/card";
import { format } from "@/i18n";
import { useI18n } from "@/i18n/client";
import type { CoverLetter, GapAnalysis } from "@/lib/ai/schemas";
import type { CheckedRequirement, Coverage } from "@/lib/analysis";
import { cn } from "@/lib/utils";

export type AnalysisViewProps = {
  id: string;
  title: string;
  createdAt: string;
  cvText: string;
  posting: string;
  provider: string;
  model: string;
  promptVersion: string;
  gap: GapAnalysis;
  requirements: CheckedRequirement[];
  coverage: Coverage;
  letter: CoverLetter | null;
};

export function AnalysisView(props: AnalysisViewProps) {
  const { t } = useI18n();
  const [tab, setTab] = useState<"gap" | "letter">("gap");
  const { coverage } = props;

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> {t.result.back}
      </Link>

      {props.provider === "mock" && (
        <div role="status" className="flex gap-3 rounded-lg border border-secondary-dark bg-secondary px-4 py-3 text-secondary-foreground">
          <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">{t.result.demoBanner}</p>
            <p className="text-sm">{t.result.demoBannerHint}</p>
          </div>
        </div>
      )}

      <Card className="flex flex-col gap-6 md:flex-row md:items-center">
        <CoverageRing score={coverage.score} size={88} />
        <div className="flex-1 space-y-2">
          <h1 className="text-2xl font-bold">{props.title}</h1>
          <p className="font-semibold" data-testid="coverage-detail">
            {t.result.coverage}: {format(t.result.coverageDetail, { ...coverage })}
          </p>
          <p className="text-sm text-muted-foreground">{props.gap.summary}</p>
          <p className="text-xs text-muted-foreground">{t.result.coverageHint}</p>
        </div>
      </Card>

      <div role="tablist" className="flex gap-2 border-b">
        {(["gap", "letter"] as const).map((value) => (
          <button
            key={value}
            role="tab"
            type="button"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition-colors duration-300",
              tab === value ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.result.tabs[value]}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === "gap" ? (
          <GapView cvText={props.cvText} posting={props.posting} requirements={props.requirements} ats={props.gap.atsRelevance} />
        ) : (
          <CoverLetterView analysisId={props.id} letter={props.letter} />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-6">
        <p className="text-xs text-muted-foreground">
          {format(t.result.meta, { provider: props.provider, model: props.model, prompt: props.promptVersion })}
        </p>
        <ConfirmButton
          size="sm"
          label={t.result.delete}
          confirmLabel={t.result.deleteConfirm}
          onConfirm={() => deleteAnalysis(props.id)}
        />
      </div>
    </div>
  );
}
