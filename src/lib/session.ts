import "server-only";

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/session-cookie";

// Stateless session: a signed JWT in an httpOnly cookie, following the Next.js authentication guide.

const SESSION_DAYS = 7;

type SessionPayload = { userId: string; expiresAt: string };

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set. See SETUP.md, step 3.");
  return new TextEncoder().encode(secret);
}

export async function encryptSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());
}

export async function decryptSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, getSecret(), { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const token = await encryptSession({ userId, expiresAt: expiresAt.toISOString() });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = await decryptSession(cookieStore.get(SESSION_COOKIE)?.value);
  return session?.userId ?? null;
}
