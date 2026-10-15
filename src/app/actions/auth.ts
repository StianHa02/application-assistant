"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";

// Error values are keys into t.auth.errors, translated in the form component.
export type AuthErrorKey = "invalid" | "emailTaken" | "nameRequired" | "emailInvalid" | "passwordShort";
export type AuthState = { error?: AuthErrorKey; email?: string; name?: string } | undefined;

const RegisterSchema = z.object({
  name: z.string().trim().min(1, "nameRequired"),
  email: z.email("emailInvalid"),
  password: z.string().min(8, "passwordShort"),
});

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message as AuthErrorKey, email: raw.email, name: raw.name };
  }

  const { name, email, password } = parsed.data;
  if (await db.user.findUnique({ where: { email } })) {
    return { error: "emailTaken", email, name };
  }

  const user = await db.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 10) },
  });
  await createSession(user.id);
  redirect("/dashboard");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await db.user.findUnique({ where: { email } });
  // Same message for unknown email and wrong password, so accounts can't be probed.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "invalid", email };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
