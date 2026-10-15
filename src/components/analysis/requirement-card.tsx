"use client";

import { AlertTriangle, ArrowRight, Quote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/client";
import type { CheckedRequirement } from "@/lib/analysis";
import { cn } from "@/lib/utils";

const STATUS_BORDER = {
  covered: "border-l-success",
  partial: "border-l-warning",
  missing: "border-l-destructive",
} as const;

export function RequirementCard({
  requirement,
  selected,
  onSelect,
}: {
  requirement: CheckedRequirement;
  selected: boolean;
  onSelect: () => void;
}) {
  const { t } = useI18n();
  const r = requirement;

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        data-testid="requirement"
        data-status={r.status}
        className={cn(
          "w-full rounded-lg border border-l-4 bg-card p-4 text-left transition-colors duration-300 hover:bg-accent",
          STATUS_BORDER[r.status],
          selected && "ring-2 ring-primary",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={r.status}>{t.result.status[r.status]}</Badge>
          <Badge variant="outline">{t.result.type[r.type]}</Badge>
        </div>
        <p className="mt-2 font-semibold">{r.requirement}</p>

        {r.cvEvidence ? (
          <div className="mt-3 flex gap-2 text-sm">
            <Quote className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <div>
              <span className="sr-only">{t.result.evidence}: </span>
              <span className="font-mono text-[13px]">{r.cvEvidence}</span>
              {!r.evidenceVerified && (
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-warning-dark">
                  <AlertTriangle className="size-3.5" aria-hidden />
                  {t.result.evidenceNotFound}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground italic">{t.result.noEvidence}</p>
        )}

        {selected && (
          <div className="mt-4 space-y-3 border-t pt-3 text-sm">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t.result.reasoning}</p>
              <p>{r.reasoning}</p>
            </div>
            <div className="flex gap-2 rounded-md bg-secondary/40 p-3">
              <ArrowRight className="mt-0.5 size-4 shrink-0" aria-hidden />
              <div>
                <p className="text-xs font-semibold tracking-wide uppercase">{t.result.nextStep}</p>
                <p>{r.nextStep}</p>
              </div>
            </div>
          </div>
        )}
      </button>
    </li>
  );
}
