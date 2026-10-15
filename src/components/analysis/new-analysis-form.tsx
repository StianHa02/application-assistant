"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";

import { createAnalysis, type CreateAnalysisState } from "@/app/actions/analyses";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldHint, FormError, Input, Label, Select, Textarea } from "@/components/ui/form";
import { useI18n } from "@/i18n/client";

export function NewAnalysisForm({ demoMode }: { demoMode: boolean }) {
  const { t, locale } = useI18n();
  const [state, action, pending] = useActionState<CreateAnalysisState, FormData>(createAnalysis, undefined);

  const error = state?.error
    ? state.error.kind === "form"
      ? t.newAnalysis.errors[state.error.key]
      : t.aiErrors[state.error.key]
    : undefined;

  return (
    <form action={action} className="space-y-6">
      {demoMode && (
        <div className="rounded-lg border border-secondary-dark bg-secondary/40 px-4 py-3 text-sm">
          <p>{t.newAnalysis.demoNotice}</p>
          <p className="mt-1 text-muted-foreground">{t.newAnalysis.tryFixture}</p>
        </div>
      )}

      <Card className="space-y-5">
        <div>
          <Label htmlFor="cv">{t.newAnalysis.cvLabel}</Label>
          <Input
            id="cv"
            name="cv"
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            required
            className="h-auto py-2 file:mr-3 file:rounded-full file:border file:border-primary-dark file:bg-primary file:px-3 file:py-1 file:text-xs file:font-semibold file:text-primary-foreground"
          />
          <FieldHint>{t.newAnalysis.cvHint}</FieldHint>
        </div>

        <div>
          <Label htmlFor="posting">{t.newAnalysis.postingLabel}</Label>
          <Textarea id="posting" name="posting" required rows={12} placeholder={t.newAnalysis.postingPlaceholder} />
        </div>

        <div>
          <Label htmlFor="keywords">{t.newAnalysis.keywordsLabel}</Label>
          <Input id="keywords" name="keywords" />
          <FieldHint>{t.newAnalysis.keywordsHint}</FieldHint>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="language">{t.newAnalysis.languageLabel}</Label>
            <Select id="language" name="language" defaultValue={locale}>
              <option value="nb">{t.newAnalysis.languages.nb}</option>
              <option value="en">{t.newAnalysis.languages.en}</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="tone">{t.newAnalysis.toneLabel}</Label>
            <Select id="tone" name="tone" defaultValue="formal">
              <option value="formal">{t.newAnalysis.tones.formal}</option>
              <option value="conversational">{t.newAnalysis.tones.conversational}</option>
            </Select>
          </div>
        </div>

        <FormError message={error} />

        <Button type="submit" size="lg" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {pending ? t.newAnalysis.submitting : t.newAnalysis.submit}
        </Button>
      </Card>
    </form>
  );
}
