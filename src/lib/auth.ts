import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";

export type CurrentUser = { id: string; name: string; email: string };

// Data Access Layer: every page and Server Action that touches user data calls one of these.

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });
  return user;
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
