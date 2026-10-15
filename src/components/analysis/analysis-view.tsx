"use client";

import { ArrowLeft, ListChecks, PenLine, ScanText } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";

import { deleteAnalysis } from "@/app/actions/analyses";
import { AtsView } from "@/components/analysis/ats-view";
import { CoverageBar } from "@/components/analysis/coverage-bar";
import { CoverLetterView } from "@/components/analysis/cover-letter-view";
import { DocumentDrawer } from "@/components/analysis/document-drawer";
import { RequirementDetail } from "@/components/analysis/requirement-detail";
import { RequirementList } from "@/components/analysis/requirement-list";
import { sortRequirements } from "@/components/analysis/status";
import { ConfirmButton } from "@/components/confirm-button";
import type { CoverLetter, GapAnalysis } from "@/lib/ai/schemas";
import type { CheckedRequirement, Coverage } from "@/lib/analysis";
import { cn } from "@/lib/utils";

export type AnalysisViewProps = {
  id: string;
  title: string;
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

const TABS = [
  { id: "gap", label: "Gap analysis", icon: ListChecks },
  { id: "ats", label: "ATS feedback", icon: ScanText },
  { id: "letter", label: "Cover letter", icon: PenLine },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function AnalysisView(props: AnalysisViewProps) {
  const { coverage } = props;
  const [tab, setTab] = useState<TabId>("gap");
  const [drawer, setDrawer] = useState<"cv" | "posting" | null>(null);

  // Gaps first, must-haves before nice-to-haves, so the first item is the most important one.
  const sorted = useMemo(() => sortRequirements(props.requirements), [props.requirements]);
  const [selected, setSelected] = useState(0);
  const current = sorted[selected];
  const closeDrawer = useCallback(() => setDrawer(null), []);

  // Both columns scroll with the page. If the detail panel's top is out of view after picking a
  // requirement further down the list, bring it back into view.
  const detailRef = useRef<HTMLDivElement>(null);
  const select = (index: number) => {
    setSelected(index);
    const top = detailRef.current?.getBoundingClientRect().top;
    if (top !== undefined && top < 0) detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-10">
      <header className="space-y-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="size-4" aria-hidden /> My analyses
        </Link>

        {props.provider === "mock" && (
          <p role="status" className="text-sm text-muted-foreground">
            <span className="marker font-semibold text-foreground">Demo mode</span> Example response, not a real AI
            analysis. Add an API key to analyse your own CV (see SETUP.md).
          </p>
        )}

        <h1 className="max-w-4xl text-3xl leading-tight font-extrabold md:text-4xl">{props.title}</h1>

        <div className="grid gap-x-12 gap-y-6 md:grid-cols-[auto_1fr]">
          <div className="w-full space-y-3 md:w-80">
            <p className="flex items-baseline gap-2">
              <span className="font-display text-5xl leading-none font-extrabold tracking-tight">{coverage.score}%</span>
              <span className="font-semibold text-muted-foreground">match</span>
            </p>
            <CoverageBar coverage={coverage} legend />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {coverage.mustCovered} of {coverage.mustTotal} must-haves covered. In the score, must-haves count double
              and partial matches count half.
            </p>
          </div>
          <p className="max-w-2xl leading-relaxed text-muted-foreground md:border-l md:pl-12">{props.gap.summary}</p>
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Result sections"
        className="grid grid-cols-3 gap-1 rounded-lg bg-primary/10 p-1.5"
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors duration-150 sm:px-5",
              // Same look as the active link in the header nav: white pill, teal text.
              tab === id
                ? "bg-card text-primary-dark shadow-sm"
                : "text-foreground/70 hover:bg-card/60 hover:text-foreground",
            )}
          >
            <Icon className="hidden size-4 sm:block" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === "gap" &&
          (current ? (
            <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
              <RequirementList requirements={sorted} selected={selected} onSelect={select} />
              <div ref={detailRef} className="scroll-mt-6 self-start rounded-lg bg-card p-6 shadow-paper md:p-8">
                <RequirementDetail requirement={current} cvText={props.cvText} onOpen={setDrawer} />
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No requirements were found in the posting.</p>
          ))}
        {tab === "ats" && <AtsView ats={props.gap.atsRelevance} />}
        {tab === "letter" && <CoverLetterView analysisId={props.id} letter={props.letter} />}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t pt-6">
        <p className="font-mono text-xs text-muted-foreground">
          {props.provider} · {props.model} · prompt {props.promptVersion}
        </p>
        <ConfirmButton size="sm" label="Delete analysis" confirmLabel="Click again to delete" onConfirm={() => deleteAnalysis(props.id)} />
      </footer>

      {drawer && (
        <DocumentDrawer
          title={drawer === "cv" ? "Your CV" : "Job posting"}
          text={drawer === "cv" ? props.cvText : props.posting}
          phrase={drawer === "cv" ? (current?.cvEvidence ?? null) : (current?.requirement ?? null)}
          status={current?.status}
          onClose={closeDrawer}
        />
      )}
    </div>
  );
}
