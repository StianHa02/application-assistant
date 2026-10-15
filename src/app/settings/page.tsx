import type { Metadata } from "next";

import { LanguageSwitch } from "@/components/language-switch";
import { SettingsActions } from "@/components/settings-actions";
import { Card, CardTitle } from "@/components/ui/card";
import { format } from "@/i18n";
import { getI18n } from "@/i18n/server";
import { countAnalyses } from "@/lib/analyses";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Innstillinger" };

export default async function SettingsPage() {
  const user = await requireUser();
  const [{ t }, count] = await Promise.all([getI18n(), countAnalyses(user.id)]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">{t.settings.title}</h1>

      <Card className="space-y-2">
        <CardTitle>{t.settings.account}</CardTitle>
        <p>{user.name}</p>
        <p className="text-muted-foreground">{user.email}</p>
      </Card>

      <Card className="flex items-center justify-between gap-4">
        <CardTitle>{t.settings.language}</CardTitle>
        <LanguageSwitch />
      </Card>

      <Card className="space-y-4">
        <CardTitle>{t.settings.dataTitle}</CardTitle>
        <p className="text-muted-foreground" data-testid="analysis-count">
          {format(t.settings.dataText, { count })}
        </p>
        <SettingsActions />
      </Card>
    </div>
  );
}
