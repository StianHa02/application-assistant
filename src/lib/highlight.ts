// Finds where a quote appears in a text, tolerant of line breaks, extra spaces and case.
// Used to highlight CV evidence and requirements on the result page.

export type Range = { start: number; end: number };

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function findRanges(text: string, phrase: string | null | undefined): Range[] {
  if (!phrase) return [];
  const ranges: Range[] = [];
  for (const rawPart of phrase.split(/\.\.\.|…/)) {
    const part = rawPart.replace(/^[\s"'«»“”.,;:-]+|[\s"'«»“”.,;:]+$/g, "");
    const words = part.split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
    const match = new RegExp(words.map(escape).join("[\\s•\\-–]+"), "iu").exec(text);
    if (match) ranges.push({ start: match.index, end: match.index + match[0].length });
  }
  return ranges.sort((a, b) => a.start - b.start);
}

export type Segment = { text: string; highlighted: boolean };

export function splitByRanges(text: string, ranges: Range[]): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start < cursor) continue;
    if (range.start > cursor) segments.push({ text: text.slice(cursor, range.start), highlighted: false });
    segments.push({ text: text.slice(range.start, range.end), highlighted: true });
    cursor = range.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), highlighted: false });
  return segments;
}

export type Excerpt = {
  text: string;
  /** Highlight ranges, shifted to positions inside `text`. */
  ranges: Range[];
  /** True when lines before / after the excerpt were left out. */
  cutStart: boolean;
  cutEnd: boolean;
};

/**
 * Cuts out the lines around the first highlight, plus `contextLines` lines before and after,
 * so the result page can show a quote in context without the whole document.
 */
export function excerptAround(text: string, ranges: Range[], contextLines = 2): Excerpt | null {
  if (ranges.length === 0) return null;

  const lineStarts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") lineStarts.push(i + 1);
  const lineOf = (offset: number) => {
    let line = 0;
    while (line + 1 < lineStarts.length && lineStarts[line + 1] <= offset) line++;
    return line;
  };

  const first = ranges[0];
  const startLine = Math.max(0, lineOf(first.start) - contextLines);
  const endLine = Math.min(lineStarts.length - 1, lineOf(Math.max(first.start, first.end - 1)) + contextLines);
  const start = lineStarts[startLine];
  const end = endLine + 1 < lineStarts.length ? lineStarts[endLine + 1] - 1 : text.length;

  return {
    text: text.slice(start, end),
    ranges: ranges
      .filter((r) => r.start >= start && r.end <= end)
      .map((r) => ({ start: r.start - start, end: r.end - start })),
    cutStart: startLine > 0,
    cutEnd: endLine < lineStarts.length - 1,
  };
}
