"use client";

import { useRef } from "react";

import { STATUS_LABEL, STATUS_ORDER, STATUS_SWATCH, TYPE_LABEL } from "@/components/analysis/status";
import type { CheckedRequirement } from "@/lib/analysis";
import { cn } from "@/lib/utils";

// Compact list of requirements, grouped Missing / Partial / Covered. Up/down arrows move the selection.
// It scrolls with the page: no sticky position and no scroll area of its own.
export function RequirementList({
  requirements,
  selected,
  onSelect,
}: {
  requirements: CheckedRequirement[];
  selected: number;
  onSelect: (index: number) => void;
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (delta: number) => {
    const next = Math.min(requirements.length - 1, Math.max(0, selected + delta));
    onSelect(next);
    buttons.current[next]?.focus();
  };

  return (
    <nav
      aria-label="Requirements"
      className="space-y-6"
      onKeyDown={(event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          move(1);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          move(-1);
        }
      }}
    >
      {STATUS_ORDER.map((status) => {
        const items = requirements.map((r, index) => ({ r, index })).filter(({ r }) => r.status === status);
        if (items.length === 0) return null;
        return (
          <section key={status}>
            <h3 className="mb-2 flex items-center gap-2.5 px-3 text-sm font-bold tracking-wider text-muted-foreground uppercase">
              <span className={cn("size-3 rounded-full", STATUS_SWATCH[status])} aria-hidden />
              {STATUS_LABEL[status]} ({items.length})
            </h3>
            <ul className="space-y-0.5">
              {items.map(({ r, index }) => (
                <li key={index}>
                  <button
                    ref={(el) => {
                      buttons.current[index] = el;
                    }}
                    type="button"
                    onClick={() => onSelect(index)}
                    aria-current={selected === index ? "true" : undefined}
                    data-testid="requirement"
                    data-status={r.status}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors duration-150",
                      selected === index ? "bg-card" : "hover:bg-card/50",
                    )}
                  >
                    <span className="line-clamp-2 flex-1">{r.requirement}</span>
                    {r.type === "nice" && (
                      <span className="mt-0.5 shrink-0 text-[11px] font-medium whitespace-nowrap text-muted-foreground">
                        {TYPE_LABEL.nice}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </nav>
  );
}
