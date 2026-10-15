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
