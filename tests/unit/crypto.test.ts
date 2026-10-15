import { describe, expect, it } from "vitest";

import { decrypt, decryptJson, encrypt, encryptJson } from "@/lib/crypto";

describe("crypto", () => {
  it("round-trips text, including Norwegian characters", () => {
    const text = "Søknad for Ærlige Øyvind – «sommerjobb»";
    expect(decrypt(encrypt(text))).toBe(text);
  });

  it("does not store plaintext and uses a fresh IV every time", () => {
    const a = encrypt("Ingrid Solberg");
    const b = encrypt("Ingrid Solberg");
    expect(a).not.toContain("Ingrid");
    expect(a).not.toBe(b);
  });

  it("detects tampering", () => {
    const parts = encrypt("hemmelig").split(":");
    parts[3] = Buffer.from("tampered").toString("base64");
    expect(() => decrypt(parts.join(":"))).toThrow();
  });

  it("round-trips JSON", () => {
    const value = { requirements: [{ status: "covered" }] };
    expect(decryptJson(encryptJson(value))).toEqual(value);
  });

  it("refuses to run without a valid key", () => {
    const original = process.env.ENCRYPTION_KEY;
    process.env.ENCRYPTION_KEY = "too-short";
    expect(() => encrypt("x")).toThrow(/32 bytes/);
    process.env.ENCRYPTION_KEY = original;
  });
});
