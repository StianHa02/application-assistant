import { FileSearch, FileText, ScanText, Sparkles } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getI18n } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";

const STEP_ICONS = [FileText, ScanText, FileSearch, Sparkles];

export default async function HomePage() {
  const [{ t }, user] = await Promise.all([getI18n(), getCurrentUser()]);

  return (
    <div className="space-y-20">
      <section className="grid gap-10 py-10 md:grid-cols-[3fr_2fr] md:items-center">
        <div className="space-y-6">
          <p className="inline-block rounded-full border border-secondary-dark bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            {t.appName}
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{t.home.title}</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">{t.home.tagline}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={user ? "/analyses/new" : "/register"} className={buttonVariants({ size: "lg" })}>
              {user ? t.nav.newAnalysis : t.home.getStarted}
            </Link>
            <Link href={user ? "/dashboard" : "/login"} className={buttonVariants({ variant: "secondary", size: "lg" })}>
              {user ? t.home.goToDashboard : t.nav.login}
            </Link>
          </div>
        </div>
        <Card className="space-y-3 border-primary-dark/40">
          <h2 className="text-xl font-bold">{t.home.transparencyTitle}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{t.home.transparencyText}</p>
        </Card>
      </section>

      <section id="how" className="space-y-6">
        <h2 className="text-3xl font-bold">{t.home.stepsTitle}</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.steps.map((step, index) => {
            const Icon = STEP_ICONS[index];
            return (
              <li key={step.title}>
                <Card className="h-full space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full border border-primary-dark bg-primary text-primary-foreground">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground">{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </Card>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="rounded-lg border bg-card p-8 md:p-10">
        <h2 className="mb-3 text-2xl font-bold">{t.home.atsTitle}</h2>
        <p className="max-w-3xl leading-relaxed text-muted-foreground">{t.home.atsText}</p>
      </section>
    </div>
  );
}
