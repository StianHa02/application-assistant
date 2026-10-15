import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// AES-256-GCM encryption for personal data at rest (CV text, job postings, AI results).
// Stored format: "v1:<iv base64>:<auth tag base64>:<ciphertext base64>".

const VERSION = "v1";
const IV_LENGTH = 12;

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("ENCRYPTION_KEY is not set. See SETUP.md, step 3.");
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be 32 bytes, base64-encoded (`openssl rand -base64 32`).");
  }
  return key;
}

export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64"), tag.toString("base64"), ciphertext.toString("base64")].join(":");
}

export function decrypt(payload: string): string {
  const [version, iv, tag, ciphertext] = payload.split(":");
  if (version !== VERSION || !iv || !tag || ciphertext === undefined) {
    throw new Error("Invalid encrypted payload.");
  }
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64")), decipher.final()]).toString("utf8");
}

export function encryptJson(value: unknown): string {
  return encrypt(JSON.stringify(value));
}

export function decryptJson<T>(payload: string): T {
  return JSON.parse(decrypt(payload)) as T;
}
