// Creates the demo user and one sample analysis (fixture case A, demo mode).
// Run: npm run seed   (also runs automatically after `npx prisma migrate reset`)

import "dotenv/config";

import { readFileSync } from "node:fs";
import path from "node:path";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";
import { PROMPT_VERSION } from "../src/lib/ai/prompts";
import { encrypt } from "../src/lib/crypto";

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "demo1234";

const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }) });

async function main() {
  const caseDir = path.join(process.cwd(), "fixtures", "cases", "a-it-support");
  const read = (file: string) => readFileSync(path.join(caseDir, file), "utf8");

  await db.user.deleteMany({ where: { email: DEMO_EMAIL } });
  const user = await db.user.create({
    data: { email: DEMO_EMAIL, name: "Demo Student", passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10) },
  });

  const posting = read("posting.txt");
  await db.analysis.create({
    data: {
      userId: user.id,
      titleEnc: encrypt(posting.split("\n")[0].trim()),
      cvFileNameEnc: encrypt("cv.pdf"),
      cvTextEnc: encrypt(read("cv.txt")),
      postingEnc: encrypt(posting),
      keywordsEnc: encrypt(JSON.stringify([])),
      language: "en",
      tone: "formal",
      gapAnalysisEnc: encrypt(read("gap-analysis.json")),
      coverLetterEnc: encrypt(read("cover-letter.json")),
      provider: "mock",
      model: "demo",
      promptVersion: PROMPT_VERSION,
    },
  });

  console.log(`Seeded demo user ${DEMO_EMAIL} / ${DEMO_PASSWORD} with one sample analysis.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
