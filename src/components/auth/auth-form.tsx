"use client";

import Link from "next/link";
import { useActionState } from "react";

import { type AuthErrorKey, type AuthState, login, register } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { FieldHint, FormError, Input, Label } from "@/components/ui/form";

const ERRORS: Record<AuthErrorKey, string> = {
  invalid: "Wrong email or password.",
  emailTaken: "An account with this email already exists.",
  nameRequired: "Enter your name.",
  emailInvalid: "Enter a valid email address.",
  passwordShort: "The password must be at least 8 characters.",
};

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? login : register, undefined);
  const isLogin = mode === "login";

  return (
    <Card className="mx-auto w-full max-w-md space-y-6 p-8">
      <div className="space-y-1">
        <CardTitle className="text-3xl font-extrabold">{isLogin ? "Log in" : "Create account"}</CardTitle>
        <CardDescription>{isLogin ? "Pick up where you left off." : "The account is only stored locally on this machine."}</CardDescription>
      </div>

      <form action={action} className="space-y-4" noValidate>
        {!isLogin && (
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" autoComplete="name" defaultValue={state?.name} required />
          </div>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" defaultValue={state?.email} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            minLength={isLogin ? undefined : 8}
          />
          {!isLogin && <FieldHint>At least 8 characters.</FieldHint>}
        </div>

        <FormError message={state?.error ? ERRORS[state.error] : undefined} />

        <Button type="submit" className="w-full" disabled={pending}>
          {isLogin ? "Log in" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <Link href={isLogin ? "/register" : "/login"} className="font-semibold text-primary hover:underline">
          {isLogin ? "Sign up" : "Log in"}
        </Link>
      </p>
      {isLogin && (
        <p className="rounded-md border border-dashed px-3 py-2 text-center font-mono text-xs text-muted-foreground">
          Demo user: demo@example.com / demo1234
        </p>
      )}
    </Card>
  );
}
