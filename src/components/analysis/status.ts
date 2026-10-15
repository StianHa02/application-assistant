import type { Requirement } from "@/lib/ai/schemas";

export const STATUS_LABEL: Record<Requirement["status"], string> = {
  missing: "Missing",
  partial: "Partial",
  covered: "Covered",
};

export const TYPE_LABEL: Record<Requirement["type"], string> = { must: "Must-have", nice: "Nice to have" };

/** Highlighter colour per status: pink = missing, yellow = partial, green = covered. */
export const STATUS_SWATCH: Record<Requirement["status"], string> = {
  missing: "bg-marker-missing",
  partial: "bg-marker-partial",
  covered: "bg-marker-covered",
};

/** Display order on the result page: gaps first, must-haves before nice-to-haves within each group. */
export const STATUS_ORDER: Requirement["status"][] = ["missing", "partial", "covered"];

export function sortRequirements<T extends Pick<Requirement, "status" | "type">>(requirements: T[]): T[] {
  return [...requirements].sort(
    (a, b) =>
      STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
      (a.type === b.type ? 0 : a.type === "must" ? -1 : 1),
  );
}
