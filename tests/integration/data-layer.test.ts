import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

// Runs against a fresh SQLite file in the OS temp folder, migrated with `prisma migrate deploy`.
const dbFile = path.join(tmpdir(), `soknadsassistenten-test-${Date.now()}.db`);
process.env.DATABASE_URL = `file:${dbFile}`;

const CASE = path.join(process.cwd(), "fixtures", "cases", "a-it-support-nb");
const cvText = readFileSync(path.join(CASE, "cv.txt"), "utf8");

let db: typeof import("@/lib/db").db;
let analyses: typeof import("@/lib/analyses");
let crypto: typeof import("@/lib/crypto");

async function createUserWithAnalysis(email: string) {
  const user = await db.user.create({ data: { email, name: "Test", passwordHash: "x" } });
  const analysis = await db.analysis.create({
    data: {
      userId: user.id,
      titleEnc: crypto.encrypt("Sommerjobb IT-support"),
      cvFileNameEnc: crypto.encrypt("cv.txt"),
      cvTextEnc: crypto.encrypt(cvText),
      postingEnc: crypto.encrypt("Vi søker en IT-student"),
      keywordsEnc: crypto.encrypt("[]"),
      language: "nb",
      tone: "formal",
      gapAnalysisEnc: crypto.encrypt(readFileSync(path.join(CASE, "gap-analysis.json"), "utf8")),
      provider: "mock",
      model: "demo",
      promptVersion: "test",
    },
  });
  return { user, analysis };
}

beforeAll(async () => {
  execSync("npx prisma migrate deploy", { env: process.env, stdio: "ignore" });
  db = (await import("@/lib/db")).db;
  analyses = await import("@/lib/analyses");
  crypto = await import("@/lib/crypto");
}, 60_000);

describe("data layer", () => {
  it("stores CV text encrypted, never as plain text", async () => {
    const { analysis } = await createUserWithAnalysis("a@example.com");
    const rows = await db.$queryRaw<{ cvTextEnc: string }[]>`SELECT cvTextEnc FROM Analysis WHERE id = ${analysis.id}`;
    expect(rows[0].cvTextEnc).not.toContain("Ingrid");
    expect(rows[0].cvTextEnc.startsWith("v1:")).toBe(true);
  });

  it("decrypts an analysis for its owner", async () => {
    const { user, analysis } = await createUserWithAnalysis("b@example.com");
    const detail = await analyses.getAnalysis(user.id, analysis.id);
    expect(detail?.cvText).toContain("Ingrid Solberg");
    expect(detail?.gapAnalysis?.requirements).toHaveLength(9);
  });

  it("does not return another user's analysis", async () => {
    const owner = await createUserWithAnalysis("c@example.com");
    const other = await db.user.create({ data: { email: "d@example.com", name: "Other", passwordHash: "x" } });
    expect(await analyses.getAnalysis(other.id, owner.analysis.id)).toBeNull();
    expect(await analyses.listAnalyses(other.id)).toHaveLength(0);
  });

  it("deletes all analyses when the account is deleted", async () => {
    const { user } = await createUserWithAnalysis("e@example.com");
    await db.user.delete({ where: { id: user.id } });
    expect(await db.analysis.count({ where: { userId: user.id } })).toBe(0);
  });
});
