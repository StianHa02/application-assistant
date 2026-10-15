"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { AiError, getAiProvider, PROMPT_VERSION } from "@/lib/ai";
import type { AiErrorCode } from "@/lib/ai/errors";
import type { AnalysisInput } from "@/lib/ai/schemas";
import { getAnalysis, titleFromPosting } from "@/lib/analyses";
import { requireUser } from "@/lib/auth";
import { encrypt, encryptJson } from "@/lib/crypto";
import { db } from "@/lib/db";
import { CvParseError, type CvParseErrorCode, parseCv } from "@/lib/parse-cv";
import { deleteSession } from "@/lib/session";

// Error values are codes; src/lib/messages.ts turns them into user-facing messages.
export type CreateAnalysisState =
  | { error?: { kind: "form"; key: CvParseErrorCode | "postingShort" | "postingLong" } | { kind: "ai"; key: AiErrorCode } }
  | undefined;

const SettingsSchema = z.object({
  posting: z.string().trim().min(50, "postingShort").max(20000, "postingLong"),
  keywords: z.string().max(500).default(""),
  tone: z.enum(["formal", "conversational"]),
});

export async function createAnalysis(_prev: CreateAnalysisState, formData: FormData): Promise<CreateAnalysisState> {
  const user = await requireUser();

  const settings = SettingsSchema.safeParse({
    posting: formData.get("posting") ?? "",
    keywords: formData.get("keywords") ?? "",
    tone: formData.get("tone"),
  });
  if (!settings.success) {
    const key = settings.error.issues[0].message;
    return { error: { kind: "form", key: key === "postingLong" ? "postingLong" : "postingShort" } };
  }

  const file = formData.get("cv");
  let cvText: string;
  try {
    if (!(file instanceof File)) throw new CvParseError("no_file");
    cvText = await parseCv(file);
  } catch (error) {
    if (error instanceof CvParseError) return { error: { kind: "form", key: error.code } };
    throw error;
  }

  const input: AnalysisInput = {
    cvText,
    posting: settings.data.posting,
    keywords: settings.data.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    tone: settings.data.tone,
  };

  const provider = getAiProvider();
  let gapAnalysis;
  try {
    gapAnalysis = await provider.analyzeGap(input);
  } catch (error) {
    if (error instanceof AiError) return { error: { kind: "ai", key: error.code } };
    throw error;
  }

  const analysis = await db.analysis.create({
    data: {
      userId: user.id,
      titleEnc: encrypt(titleFromPosting(input.posting)),
      cvFileNameEnc: encrypt((file as File).name),
      cvTextEnc: encrypt(input.cvText),
      postingEnc: encrypt(input.posting),
      keywordsEnc: encrypt(JSON.stringify(input.keywords)),
      language: "en", // the app is English-only; column kept for older rows
      tone: input.tone,
      gapAnalysisEnc: encryptJson(gapAnalysis),
      provider: provider.name,
      model: provider.model,
      promptVersion: PROMPT_VERSION,
    },
    select: { id: true },
  });

  revalidatePath("/dashboard");
  redirect(`/analyses/${analysis.id}`);
}

export type CoverLetterState = { error?: AiErrorCode } | undefined;

export async function generateCoverLetter(analysisId: string): Promise<CoverLetterState> {
  const user = await requireUser();
  const analysis = await getAnalysis(user.id, analysisId);
  if (!analysis || !analysis.gapAnalysis) return { error: "unknown" };

  const provider = getAiProvider();
  try {
    const letter = await provider.writeCoverLetter(
      {
        cvText: analysis.cvText,
        posting: analysis.posting,
        keywords: analysis.keywords,
        tone: analysis.tone,
      },
      analysis.gapAnalysis,
    );
    await db.analysis.update({
      where: { id: analysis.id, userId: user.id },
      data: { coverLetterEnc: encryptJson(letter) },
    });
  } catch (error) {
    if (error instanceof AiError) return { error: error.code };
    throw error;
  }

  revalidatePath(`/analyses/${analysisId}`);
  return {};
}

/** Rewrites one paragraph of the stored cover letter and leaves the others unchanged. */
export async function rewriteParagraph(analysisId: string, index: number): Promise<CoverLetterState> {
  const user = await requireUser();
  const analysis = await getAnalysis(user.id, analysisId);
  const letter = analysis?.coverLetter;
  if (!analysis || !analysis.gapAnalysis || !letter || !Number.isInteger(index) || !letter.paragraphs[index]) {
    return { error: "unknown" };
  }

  const provider = getAiProvider();
  try {
    const paragraph = await provider.rewriteParagraph(
      {
        cvText: analysis.cvText,
        posting: analysis.posting,
        keywords: analysis.keywords,
        tone: analysis.tone,
      },
      analysis.gapAnalysis,
      letter,
      index,
    );
    const paragraphs = letter.paragraphs.map((p, i) => (i === index ? paragraph : p));
    await db.analysis.update({
      where: { id: analysis.id, userId: user.id },
      data: { coverLetterEnc: encryptJson({ paragraphs }) },
    });
  } catch (error) {
    if (error instanceof AiError) return { error: error.code };
    throw error;
  }

  revalidatePath(`/analyses/${analysisId}`);
  return {};
}

export async function deleteAnalysis(analysisId: string) {
  const user = await requireUser();
  await db.analysis.deleteMany({ where: { id: analysisId, userId: user.id } });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteAllAnalyses(): Promise<{ deleted: number }> {
  const user = await requireUser();
  const { count } = await db.analysis.deleteMany({ where: { userId: user.id } });
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { deleted: count };
}

export async function deleteAccount() {
  const user = await requireUser();
  // Analyses are removed by the cascade on Analysis.user.
  await db.user.delete({ where: { id: user.id } });
  await deleteSession();
  redirect("/");
}
