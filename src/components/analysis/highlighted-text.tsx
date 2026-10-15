"use client";

import { useEffect, useMemo, useRef } from "react";

import type { Requirement } from "@/lib/ai/schemas";
import { findRanges, splitByRanges } from "@/lib/highlight";
import { cn } from "@/lib/utils";

export function HighlightedText({
  text,
  phrase,
  status,
  className,
}: {
  text: string;
  phrase?: string | null;
  status?: Requirement["status"];
  className?: string;
}) {
  const segments = useMemo(() => splitByRanges(text, findRanges(text, phrase)), [text, phrase]);
  const firstMark = useRef<HTMLElement>(null);

  // Scroll only the surrounding column (not the whole page) so the highlight is visible.
  useEffect(() => {
    const mark = firstMark.current;
    const container = mark?.closest<HTMLElement>("[data-scroll-container]");
    if (!mark || !container) return;
    const offset = mark.getBoundingClientRect().top - container.getBoundingClientRect().top;
    container.scrollBy({ top: offset - container.clientHeight / 3, behavior: "smooth" });
  }, [phrase]);

  const firstHighlighted = segments.findIndex((segment) => segment.highlighted);
  return (
    <div className={cn("whitespace-pre-wrap font-mono text-[13px] leading-relaxed", className)}>
      {segments.map((segment, index) => {
        if (!segment.highlighted) return <span key={index}>{segment.text}</span>;
        return (
          <mark key={index} ref={index === firstHighlighted ? firstMark : undefined} className="evidence" data-status={status}>
            {segment.text}
          </mark>
        );
      })}
    </div>
  );
}
