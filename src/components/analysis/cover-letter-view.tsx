"use client";

import { Check, Copy, Loader2, RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";

import { generateCoverLetter } from "@/app/actions/analyses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/ui/form";
import { useI18n } from "@/i18n/client";
import type { CoverLetter } from "@/lib/ai/schemas";
import type { AiErrorCode } from "@/lib/ai/errors";

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  return {
    copied,
    copy: async (id: string, text: string) => {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    },
  };
}

export function CoverLetterView({ analysisId, letter }: { analysisId: string; letter: CoverLetter | null }) {
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<AiErrorCode | null>(null);
  const [openWhy, setOpenWhy] = useState<Set<number>>(new Set());
  const [accepted, setAccepted] = useState<Set<number>>(new Set());
  const { copied, copy } = useCopy();

  const generate = () =>
    startTransition(async () => {
      setError(null);
      const result = await generateCoverLetter(analysisId);
      if (result?.error) setError(result.error);
      else setAccepted(new Set());
    });

  const toggle = (set: Set<number>, index: number) => {
    const next = new Set(set);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    return next;
  };

  if (!letter) {
    return (
      <Card className="flex flex-col items-start gap-4">
        <p className="text-muted-foreground">{t.letter.intro}</p>
        <FormError message={error ? t.aiErrors[error] : undefined} />
        <Button onClick={generate} disabled={pending} size="lg">
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {pending ? t.letter.generating : t.letter.generate}
        </Button>
      </Card>
    );
  }

  const draft = letter.paragraphs
    .filter((_, index) => accepted.has(index))
    .map((p) => p.text)
    .join("\n\n");

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-sm text-muted-foreground">{t.letter.intro}</p>
          <Button variant="outline" size="sm" onClick={generate} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <RefreshCw className="size-4" aria-hidden />}
            {t.letter.regenerate}
          </Button>
        </div>
        <FormError message={error ? t.aiErrors[error] : undefined} />

        <ol className="space-y-4">
          {letter.paragraphs.map((paragraph, index) => (
            <li key={index} data-testid="letter-paragraph">
              <Card className={accepted.has(index) ? "border-primary" : undefined}>
                <p className="leading-relaxed">{paragraph.text}</p>
                {openWhy.has(index) && (
                  <div className="mt-4 space-y-2 rounded-md bg-muted p-3 text-sm">
                    <p>{paragraph.rationale}</p>
                    {paragraph.linkedRequirements.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-muted-foreground">{t.letter.targets}:</span>
                        {paragraph.linkedRequirements.map((r) => (
                          <Badge key={r} variant="outline">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={accepted.has(index) ? "default" : "secondary"}
                    onClick={() => setAccepted(toggle(accepted, index))}
                    aria-pressed={accepted.has(index)}
                  >
                    {accepted.has(index) && <Check className="size-4" aria-hidden />}
                    {accepted.has(index) ? t.letter.accepted : t.letter.accept}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setOpenWhy(toggle(openWhy, index))}>
                    {openWhy.has(index) ? t.letter.hideWhy : t.letter.why}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => copy(`p${index}`, paragraph.text)}>
                    <Copy className="size-4" aria-hidden />
                    {copied === `p${index}` ? t.letter.copied : t.letter.copy}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <Card className="space-y-4 bg-secondary/20">
          <h2 className="text-lg font-bold">{t.letter.draftTitle}</h2>
          {draft ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{draft}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{t.letter.draftEmpty}</p>
          )}
          <Button size="sm" disabled={!draft} onClick={() => copy("draft", draft)}>
            <Copy className="size-4" aria-hidden />
            {copied === "draft" ? t.letter.copied : t.letter.copyDraft}
          </Button>
        </Card>
      </aside>
    </div>
  );
}
