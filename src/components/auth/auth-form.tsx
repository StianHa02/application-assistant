"use client";

import Link from "next/link";
import { useActionState } from "react";

import { type AuthState, login, register } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { FieldHint, FormError, Input, Label } from "@/components/ui/form";
import { format } from "@/i18n";
import { useI18n } from "@/i18n/client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? login : register, undefined);
  const isLogin = mode === "login";

  return (
    <Card className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-1">
        <CardTitle className="text-2xl">{isLogin ? t.auth.loginTitle : t.auth.registerTitle}</CardTitle>
        <CardDescription>{isLogin ? t.auth.loginSubtitle : t.auth.registerSubtitle}</CardDescription>
      </div>

      <form action={action} className="space-y-4" noValidate>
        {!isLogin && (
          <div>
            <Label htmlFor="name">{t.auth.name}</Label>
            <Input id="name" name="name" autoComplete="name" defaultValue={state?.name} required />
          </div>
        )}
        <div>
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input id="email" name="email" type="email" autoComplete="email" defaultValue={state?.email} required />
        </div>
        <div>
          <Label htmlFor="password">{t.auth.password}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            minLength={isLogin ? undefined : 8}
          />
          {!isLogin && <FieldHint>{t.auth.passwordHint}</FieldHint>}
        </div>

        <FormError message={state?.error ? t.auth.errors[state.error] : undefined} />

        <Button type="submit" className="w-full" disabled={pending}>
          {isLogin ? t.auth.submitLogin : t.auth.submitRegister}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? t.auth.noAccount : t.auth.haveAccount}{" "}
        <Link href={isLogin ? "/register" : "/login"} className="font-semibold text-primary hover:underline">
          {isLogin ? t.nav.register : t.nav.login}
        </Link>
      </p>
      {isLogin && (
        <p className="rounded-md bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
          {format(t.auth.demoHint, { email: "demo@example.com", password: "demo1234" })}
        </p>
      )}
    </Card>
  );
}
