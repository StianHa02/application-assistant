import type { Metadata } from "next";

import { SettingsActions } from "@/components/settings-actions";
import { Card, CardTitle } from "@/components/ui/card";
import { countAnalyses } from "@/lib/analyses";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  const count = await countAnalyses(user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-4xl font-extrabold">Settings</h1>

      <Card className="space-y-1">
        <CardTitle>Account</CardTitle>
        <p className="font-mono text-sm text-muted-foreground">{user.email}</p>
      </Card>

      <Card className="space-y-4">
        <CardTitle>Your data</CardTitle>
        <p className="text-muted-foreground" data-testid="analysis-count">
          You have {count} {count === 1 ? "analysis" : "analyses"} stored. All CV and posting text is encrypted in the
          database.
        </p>
        <SettingsActions />
      </Card>
    </div>
  );
}
