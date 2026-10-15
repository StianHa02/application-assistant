import type { Coverage } from "@/lib/analysis";
import { cn } from "@/lib/utils";

const SEGMENTS = [
  { key: "covered", label: "covered", className: "bg-marker-covered" },
  { key: "partial", label: "partial", className: "bg-marker-partial" },
  { key: "missing", label: "missing", className: "bg-marker-missing" },
] as const;

// One bar split by how many requirements are covered / partial / missing.
// With `legend`, the counts are written out underneath, so the colours never need explaining.
export function CoverageBar({
  coverage,
  legend = false,
  className,
}: {
  coverage: Pick<Coverage, "total" | "covered" | "partial" | "missing">;
  legend?: boolean;
  className?: string;
}) {
  const summary = SEGMENTS.map(({ key, label }) => `${coverage[key]} ${label}`).join(", ");

  return (
    <div className={cn("space-y-2", className)}>
      <div
        role="img"
        aria-label={`Requirements: ${summary}`}
        title={summary}
        className="flex h-3 overflow-hidden rounded-full bg-muted shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)]"
      >
        {SEGMENTS.map(({ key, className: color }) =>
          coverage[key] > 0 ? (
            <span key={key} className={color} style={{ width: `${(coverage[key] / coverage.total) * 100}%` }} />
          ) : null,
        )}
      </div>
      {legend && (
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm" data-testid="coverage-detail" aria-hidden>
          {SEGMENTS.map(({ key, label, className: color }) => (
            <span key={key} className="inline-flex items-center gap-1.5">
              <span className={cn("size-2.5 rounded-full", color)} />
              <span className="font-semibold">{coverage[key]}</span> {label}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
