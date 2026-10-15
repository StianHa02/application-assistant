import type { Requirement } from "@/lib/ai/schemas";
import { excerptAround, findRanges, splitByRanges } from "@/lib/highlight";
import { cn } from "@/lib/utils";

// A few lines of a document around a highlighted phrase. The marker colour follows the status.
export function Excerpt({
  text,
  phrase,
  status,
  mono = false,
  testId,
}: {
  text: string;
  phrase: string | null;
  status?: Requirement["status"];
  mono?: boolean;
  testId?: string;
}) {
  const excerpt = excerptAround(text, findRanges(text, phrase), 2);
  if (!excerpt) return null;

  return (
    <div
      data-testid={testId}
      className={cn(
        "rounded-md border border-dashed bg-muted px-4 py-3 whitespace-pre-wrap",
        mono ? "font-mono text-[13px] leading-relaxed" : "text-sm leading-relaxed",
      )}
    >
      {excerpt.cutStart && <span className="text-muted-foreground">…{"\n"}</span>}
      {splitByRanges(excerpt.text, excerpt.ranges).map((segment, index) =>
        segment.highlighted ? (
          <mark key={index} className="evidence" data-status={status}>
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
      {excerpt.cutEnd && <span className="text-muted-foreground">{"\n"}…</span>}
    </div>
  );
}
