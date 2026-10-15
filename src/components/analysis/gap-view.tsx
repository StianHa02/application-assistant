"use client";

import { useState } from "react";

import { HighlightedText } from "@/components/analysis/highlighted-text";
import { RequirementCard } from "@/components/analysis/requirement-card";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/i18n/client";
import type { GapAnalysis } from "@/lib/ai/schemas";
import type { CheckedRequirement } from "@/lib/analysis";

const STATUS_ORDER = { missing: 0, partial: 1, covered: 2 } as const;
const TYPE_ORDER = { must: 0, nice: 1 } as const;

export function GapView({
  cvText,
  posting,
  requirements,
  ats,
}: {
  cvText: string;
  posting: string;
  requirements: CheckedRequirement[];
  ats: GapAnalysis["atsRelevance"];
}) {
  const { t } = useI18n();
  // Must-haves first, then gaps before strengths, so the most important things are on top.
  const sorted = [...requirements].sort(
    (a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type] || STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
  );
  const [selected, setSelected] = useState<number | null>(null);
  const current = selected === null ? null : sorted[selected];

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">{t.result.selectHint}</p>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.25fr_1fr]">
        <section aria-label={t.result.columns.cv} className="order-2 lg:order-1">
          <h2 className="mb-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">{t.result.columns.cv}</h2>
          <Card className="max-h-[70vh] overflow-auto p-4" data-testid="cv-column" data-scroll-container>
            <HighlightedText text={cvText} phrase={current?.cvEvidence} />
          </Card>
        </section>

        <section aria-label={t.result.columns.requirements} className="order-1 lg:order-2">
          <h2 className="mb-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
            {t.result.columns.requirements} ({sorted.length})
          </h2>
          <ul className="max-h-[70vh] space-y-3 overflow-auto pr-1">
            {sorted.map((requirement, index) => (
              <RequirementCard
                key={`${requirement.requirement}-${index}`}
                requirement={requirement}
                selected={selected === index}
                onSelect={() => setSelected(selected === index ? null : index)}
              />
            ))}
          </ul>
        </section>

        <section aria-label={t.result.columns.posting} className="order-3">
          <h2 className="mb-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">{t.result.columns.posting}</h2>
          <Card className="max-h-[70vh] overflow-auto p-4" data-scroll-container>
            <HighlightedText text={posting} phrase={current?.requirement} className="font-sans text-sm" />
          </Card>
        </section>
      </div>

      <Card className="space-y-5">
        <div>
          <h2 className="text-xl font-bold">{t.result.atsTitle}</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">{ats.summary}</p>
        </div>
        <div>
          <h3 className="mb-3 font-bold">{t.result.phrasingTitle}</h3>
          {ats.phrasingSuggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.result.noPhrasing}</p>
          ) : (
            <ul className="space-y-3">
              {ats.phrasingSuggestions.map((s, index) => (
                <li key={index} className="grid gap-3 rounded-lg border p-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">{t.result.phrasingOriginal}</p>
                    <p className="font-mono text-[13px] line-through decoration-destructive/60">{s.original}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase">{t.result.phrasingSuggested}</p>
                    <p className="font-mono text-[13px] font-medium">{s.suggested}</p>
                  </div>
                  <p className="text-sm text-muted-foreground md:col-span-2">{s.why}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
