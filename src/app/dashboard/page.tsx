import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { CoverageBar } from "@/components/analysis/coverage-bar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { listAnalyses } from "@/lib/analyses";
import { computeCoverage } from "@/lib/analysis";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "My analyses" };

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

export default async function DashboardPage() {
  const user = await requireUser();
  const analyses = await listAnalyses(user.id);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl font-extrabold">My analyses</h1>
        <Link href="/analyses/new" className={buttonVariants()}>
          New analysis
        </Link>
      </div>

      {analyses.length === 0 ? (
        <div className="flex flex-col items-start gap-5 rounded-lg border-2 border-dashed px-8 py-12">
          <p className="font-display text-2xl font-bold">You don&apos;t have any analyses yet.</p>
          <p className="max-w-lg text-muted-foreground">
            Upload a CV and paste a job posting to see which requirements you meet, and what to do about the ones you
            don&apos;t.
          </p>
          <Link href="/analyses/new" className={buttonVariants()}>
            New analysis
          </Link>
        </div>
      ) : (
        <ul className="divide-y overflow-hidden rounded-lg bg-card shadow-paper">
          {analyses.map((analysis) => {
            const coverage = analysis.gapAnalysis ? computeCoverage(analysis.gapAnalysis.requirements) : null;
            return (
              <li key={analysis.id}>
                <Link
                  href={`/analyses/${analysis.id}`}
                  className="group flex flex-wrap items-center gap-x-6 gap-y-3 px-6 py-5 transition-colors duration-150 hover:bg-muted"
                >
                  <div className="min-w-0 flex-1 basis-64">
                    <p className="truncate font-display text-lg font-bold group-hover:text-primary">{analysis.title}</p>
                    <p className="font-mono text-xs text-muted-foreground">{dateFormat.format(analysis.createdAt)}</p>
                  </div>
                  {analysis.provider === "mock" && <Badge variant="secondary">Demo</Badge>}
                  {coverage && (
                    <div className="flex items-center gap-3">
                      {coverage.total > 0 && <CoverageBar coverage={coverage} className="w-28" />}
                      <span className="w-12 text-right font-display text-xl leading-none font-extrabold">
                        {coverage.score}%
                      </span>
                    </div>
                  )}
                  <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
