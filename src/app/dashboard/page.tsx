import type { Metadata } from "next";
import Link from "next/link";

import { CoverageRing } from "@/components/analysis/coverage-ring";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getI18n } from "@/i18n/server";
import { listAnalyses } from "@/lib/analyses";
import { computeCoverage } from "@/lib/analysis";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Mine analyser" };

export default async function DashboardPage() {
  const user = await requireUser();
  const [{ t, locale }, analyses] = await Promise.all([getI18n(), listAnalyses(user.id)]);
  const dateFormat = new Intl.DateTimeFormat(locale === "nb" ? "nb-NO" : "en-GB", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t.dashboard.title}</h1>
          <p className="text-muted-foreground">{t.dashboard.subtitle}</p>
        </div>
        <Link href="/analyses/new" className={buttonVariants()}>
          {t.nav.newAnalysis}
        </Link>
      </div>

      {analyses.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-lg text-muted-foreground">{t.dashboard.empty}</p>
          <Link href="/analyses/new" className={buttonVariants({ variant: "secondary" })}>
            {t.dashboard.emptyCta}
          </Link>
        </Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {analyses.map((analysis) => {
            const coverage = analysis.gapAnalysis ? computeCoverage(analysis.gapAnalysis.requirements) : null;
            return (
              <li key={analysis.id}>
                <Link href={`/analyses/${analysis.id}`} className="block rounded-lg transition-colors duration-300 hover:bg-accent">
                  <Card className="flex items-center gap-4 bg-transparent">
                    {coverage && <CoverageRing score={coverage.score} />}
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate font-semibold">{analysis.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {t.dashboard.created} {dateFormat.format(analysis.createdAt)}
                      </p>
                    </div>
                    {analysis.provider === "mock" && <Badge variant="secondary">{t.dashboard.demoTag}</Badge>}
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
