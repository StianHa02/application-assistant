import "server-only";

import type { CoverLetter, GapAnalysis, Language, Tone } from "@/lib/ai/schemas";
import { decrypt, decryptJson } from "@/lib/crypto";
import { db } from "@/lib/db";

// Data access for analyses. Every query is scoped to the user id, so one user can never read
// another user's data, even by guessing an id.

export type AnalysisSummary = {
  id: string;
  title: string;
  createdAt: Date;
  provider: string;
  gapAnalysis: GapAnalysis | null;
};

export type AnalysisDetail = AnalysisSummary & {
  cvFileName: string;
  cvText: string;
  posting: string;
  keywords: string[];
  language: Language;
  tone: Tone;
  coverLetter: CoverLetter | null;
  model: string;
  promptVersion: string;
};

export async function listAnalyses(userId: string): Promise<AnalysisSummary[]> {
  const rows = await db.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, titleEnc: true, createdAt: true, provider: true, gapAnalysisEnc: true },
  });
  return rows.map((row) => ({
    id: row.id,
    title: decrypt(row.titleEnc),
    createdAt: row.createdAt,
    provider: row.provider,
    gapAnalysis: row.gapAnalysisEnc ? decryptJson<GapAnalysis>(row.gapAnalysisEnc) : null,
  }));
}

export async function getAnalysis(userId: string, id: string): Promise<AnalysisDetail | null> {
  const row = await db.analysis.findFirst({ where: { id, userId } });
  if (!row) return null;
  return {
    id: row.id,
    title: decrypt(row.titleEnc),
    createdAt: row.createdAt,
    provider: row.provider,
    cvFileName: decrypt(row.cvFileNameEnc),
    cvText: decrypt(row.cvTextEnc),
    posting: decrypt(row.postingEnc),
    keywords: JSON.parse(decrypt(row.keywordsEnc)) as string[],
    language: row.language as Language,
    tone: row.tone as Tone,
    gapAnalysis: row.gapAnalysisEnc ? decryptJson<GapAnalysis>(row.gapAnalysisEnc) : null,
    coverLetter: row.coverLetterEnc ? decryptJson<CoverLetter>(row.coverLetterEnc) : null,
    model: row.model,
    promptVersion: row.promptVersion,
  };
}

export async function countAnalyses(userId: string): Promise<number> {
  return db.analysis.count({ where: { userId } });
}

/** A short title for the dashboard: the posting's first non-empty line. */
export function titleFromPosting(posting: string): string {
  const first = posting.split(/\r?\n/).find((line) => line.trim().length > 0)?.trim() ?? "";
  return first.length > 90 ? `${first.slice(0, 87)}…` : first;
}
