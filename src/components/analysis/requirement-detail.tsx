"use client";

import { AlertTriangle, FileText, Newspaper } from "lucide-react";

import { Excerpt } from "@/components/analysis/excerpt";
import { STATUS_LABEL, TYPE_LABEL } from "@/components/analysis/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CheckedRequirement } from "@/lib/analysis";

type BodyRequirement = Pick<
  CheckedRequirement,
  "requirement" | "status" | "reasoning" | "nextStep" | "cvEvidence" | "evidenceVerified"
>;

// Why, next step and the matching lines in the CV. Also used for the specimen on the home page.
export function RequirementBody({ requirement: r, cvText }: { requirement: BodyRequirement; cvText: string }) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">Why</h3>
        <p className="leading-relaxed">{r.reasoning}</p>
      </section>

      <section className="rounded-r-md border-l-4 border-primary bg-accent px-4 py-3">
        <h3 className="mb-1 text-xs font-bold tracking-wider text-primary-dark uppercase">Next step</h3>
        <p className="leading-relaxed">{r.nextStep}</p>
      </section>

      <section className="space-y-2">
        <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">In your CV</h3>
        {r.cvEvidence ? (
          <>
            <Excerpt text={cvText} phrase={r.cvEvidence} status={r.status} mono testId="cv-excerpt" />
            {!r.evidenceVerified && (
              <p className="flex items-start gap-2 text-sm font-semibold text-warning-dark">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                The AI quoted &quot;{r.cvEvidence}&quot;, but this text wasn&apos;t found in your CV. It may have
                rephrased it or made a mistake.
              </p>
            )}
          </>
        ) : (
          <p className="text-muted-foreground italic">Not found in your CV.</p>
        )}
      </section>
    </div>
  );
}

export function RequirementDetail({
  requirement: r,
  cvText,
  onOpen,
}: {
  requirement: CheckedRequirement;
  cvText: string;
  onOpen: (kind: "cv" | "posting") => void;
}) {
  return (
    <article className="space-y-6" data-testid="requirement-detail">
      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant={r.status}>{STATUS_LABEL[r.status]}</Badge>
          <Badge variant="outline">{TYPE_LABEL[r.type]}</Badge>
        </div>
        <h2 className="text-2xl font-extrabold">{r.requirement}</h2>
      </header>

      <RequirementBody requirement={r} cvText={cvText} />

      <div className="flex flex-wrap gap-2 border-t pt-5">
        <Button variant="outline" size="sm" onClick={() => onOpen("cv")}>
          <FileText className="size-4" aria-hidden /> View full CV
        </Button>
        <Button variant="outline" size="sm" onClick={() => onOpen("posting")}>
          <Newspaper className="size-4" aria-hidden /> View full posting
        </Button>
      </div>
    </article>
  );
}
