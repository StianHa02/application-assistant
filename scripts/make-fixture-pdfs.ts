// Generates fixtures/cases/<case>/cv.pdf from cv.txt, so PDF parsing can be tested on fictional CVs.
// Case C uses a two-column layout to test that column CVs still parse.
// Run: npm run fixtures:pdf

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { PDFDocument, type PDFFont, StandardFonts } from "pdf-lib";

const CASES_DIR = path.join(process.cwd(), "fixtures", "cases");
const PAGE = { width: 595, height: 842, margin: 50 };

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function makePdf(cvText: string, twoColumn: boolean): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([PAGE.width, PAGE.height]);
  const blocks = cvText.trim().split(/\n\s*\n/);

  // Column layout: header block full width, then the rest split in two columns.
  const columns = twoColumn
    ? [
        { x: PAGE.margin, width: 160, blocks: blocks.slice(1).filter((b) => /^(SKILLS|EDUCATION)/.test(b)) },
        { x: PAGE.margin + 190, width: 305, blocks: blocks.slice(1).filter((b) => !/^(SKILLS|EDUCATION)/.test(b)) },
      ]
    : [{ x: PAGE.margin, width: PAGE.width - 2 * PAGE.margin, blocks: blocks.slice(1) }];

  let headerY = PAGE.height - PAGE.margin;
  blocks[0].split("\n").forEach((line, index) => {
    const size = index === 0 ? 18 : 10;
    page.drawText(line, { x: PAGE.margin, y: headerY, size, font: index === 0 ? bold : regular });
    headerY -= size + 6;
  });

  for (const column of columns) {
    let y = headerY - 14;
    for (const block of column.blocks) {
      for (const [index, line] of block.split("\n").entries()) {
        const isHeading = index === 0 && line === line.toUpperCase();
        const font = isHeading ? bold : regular;
        const size = isHeading ? 11 : 9.5;
        for (const wrapped of wrap(line, font, size, column.width)) {
          page.drawText(wrapped, { x: column.x, y, size, font });
          y -= size + 4;
        }
      }
      y -= 10;
    }
  }
  return doc.save();
}

async function main() {
  for (const entry of readdirSync(CASES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(CASES_DIR, entry.name);
    const cv = readFileSync(path.join(dir, "cv.txt"), "utf8");
    const twoColumn = entry.name.startsWith("c-");
    writeFileSync(path.join(dir, "cv.pdf"), await makePdf(cv, twoColumn));
    console.log(`Wrote ${entry.name}/cv.pdf${twoColumn ? " (two columns)" : ""}`);
  }
}

main();
