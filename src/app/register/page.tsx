import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Registrer deg" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <AuthForm mode="register" />;
}
