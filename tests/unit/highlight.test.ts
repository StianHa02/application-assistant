import { describe, expect, it } from "vitest";

import { excerptAround, findRanges, splitByRanges } from "@/lib/highlight";

const text = ["Line 1", "Line 2", "Line 3", "Built an Excel dashboard", "with pivot tables", "Line 6", "Line 7", "Line 8"].join("\n");

describe("findRanges", () => {
  it("finds a quote across a line break, ignoring case", () => {
    const [range] = findRanges(text, "built an excel dashboard with pivot tables");
    expect(text.slice(range.start, range.end)).toBe("Built an Excel dashboard\nwith pivot tables");
  });

  it("returns nothing for missing or empty phrases", () => {
    expect(findRanges(text, "Python")).toEqual([]);
    expect(findRanges(text, null)).toEqual([]);
  });
});

describe("excerptAround", () => {
  it("returns the highlighted lines plus context, with shifted ranges", () => {
    const ranges = findRanges(text, "Built an Excel dashboard with pivot tables");
    const excerpt = excerptAround(text, ranges, 1);

    expect(excerpt?.text).toBe("Line 3\nBuilt an Excel dashboard\nwith pivot tables\nLine 6");
    expect(excerpt?.cutStart).toBe(true);
    expect(excerpt?.cutEnd).toBe(true);
    const [range] = excerpt!.ranges;
    expect(excerpt!.text.slice(range.start, range.end)).toBe("Built an Excel dashboard\nwith pivot tables");
  });

  it("does not cut when the highlight is near the start or end", () => {
    const excerpt = excerptAround(text, findRanges(text, "Line 1"), 2);
    expect(excerpt?.text).toBe("Line 1\nLine 2\nLine 3");
    expect(excerpt?.cutStart).toBe(false);
    expect(excerptAround(text, findRanges(text, "Line 8"), 2)?.cutEnd).toBe(false);
  });

  it("returns null when there is nothing to highlight", () => {
    expect(excerptAround(text, [], 2)).toBeNull();
  });

  it("works with splitByRanges to render the highlight", () => {
    const excerpt = excerptAround(text, findRanges(text, "Line 6"), 0)!;
    expect(splitByRanges(excerpt.text, excerpt.ranges)).toEqual([{ text: "Line 6", highlighted: true }]);
  });
});
