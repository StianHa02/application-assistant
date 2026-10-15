"use client";

import { Check, Copy, Loader2, RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";

import { generateCoverLetter, rewriteParagraph } from "@/app/actions/analyses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormError } from "@/components/ui/form";
import type { CoverLetter } from "@/lib/ai/schemas";
import type { AiErrorCode } from "@/lib/ai/errors";
import { AI_ERRORS } from "@/lib/messages";
import { cn } from "@/lib/utils";

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
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<AiErrorCode | null>(null);
  const [openWhy, setOpenWhy] = useState<Set<number>>(new Set());
  const [accepted, setAccepted] = useState<Set<number>>(new Set());
  const { copied, copy } = useCopy();
  // One paragraph is rewritten at a time; its error is shown on that paragraph.
  const [rewriting, startRewrite] = useTransition();
  const [rewritingIndex, setRewritingIndex] = useState<number | null>(null);
  const [paragraphError, setParagraphError] = useState<{ index: number; code: AiErrorCode } | null>(null);
  const busy = pending || rewriting;

  const generate = () =>
    startTransition(async () => {
      setError(null);
      setParagraphError(null);
      const result = await generateCoverLetter(analysisId);
      if (result?.error) setError(result.error);
      else setAccepted(new Set());
    });

  const rewrite = (index: number) => {
    setRewritingIndex(index);
    setParagraphError(null);
    startRewrite(async () => {
      const result = await rewriteParagraph(analysisId, index);
      if (result?.error) setParagraphError({ index, code: result.error });
      setRewritingIndex(null);
    });
  };

  const toggle = (set: Set<number>, index: number) => {
    const next = new Set(set);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    return next;
  };

  if (!letter) {
    return (
      <Card className="flex flex-col items-start gap-4">
        <p className="text-muted-foreground">
          Cover-letter suggestions, paragraph by paragraph. Read the reasoning, keep what fits and rewrite it in your
          own words.
        </p>
        <FormError message={error ? AI_ERRORS[error] : undefined} />
        <Button onClick={generate} disabled={pending} size="lg">
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {pending ? "Writing suggestions …" : "Suggest a cover letter"}
        </Button>
      </Card>
    );
  }

  const draft = letter.paragraphs
    .filter((_, index) => accepted.has(index))
    .map((p) => p.text)
    .join("\n\n");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-muted-foreground">
          Read the reasoning, keep what fits and rewrite it in your own words.
        </p>
        <Button variant="outline" size="sm" onClick={generate} disabled={busy}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="size-4" aria-hidden />
          )}
          New suggestions
        </Button>
      </div>
      <FormError message={error ? AI_ERRORS[error] : undefined} />

      {/* Both columns start with a card, so their tops line up. */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <ol className="space-y-4">
          {letter.paragraphs.map((paragraph, index) => (
            <li key={index} data-testid="letter-paragraph">
              <Card>
                <p
                  className={cn(
                    "leading-relaxed transition-opacity duration-150",
                    rewritingIndex === index && "opacity-40",
                  )}
                >
                  {paragraph.text}
                </p>
                {paragraphError?.index === index && (
                  <div className="mt-3">
                    <FormError message={AI_ERRORS[paragraphError.code]} />
                  </div>
                )}
                {openWhy.has(index) && (
                  <div className="mt-4 space-y-2 rounded-md bg-muted p-3 text-sm">
                    <p>{paragraph.rationale}</p>
                    {paragraph.linkedRequirements.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-muted-foreground">Targets:</span>
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
                    {accepted.has(index) ? "Used" : "Use"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setOpenWhy(toggle(openWhy, index))}>
                    {openWhy.has(index) ? "Hide reasoning" : "Why?"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => rewrite(index)} disabled={busy}>
                    {rewritingIndex === index ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <RefreshCw className="size-4" aria-hidden />
                    )}
                    {rewritingIndex === index ? "Rewriting …" : "Rewrite"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => copy(`p${index}`, paragraph.text)}>
                    <Copy className="size-4" aria-hidden />
                    {copied === `p${index}` ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ol>

        {/* Not sticky: it scrolls with the page like everything else. */}
        <aside className="lg:self-start">
          <Card className="space-y-4 border-l-4 border-l-secondary-dark">
            <h2 className="text-lg font-extrabold">Your draft</h2>
            {draft ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{draft}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Click &quot;Use&quot; on the paragraphs you want.</p>
            )}
            <Button size="sm" disabled={!draft} onClick={() => copy("draft", draft)}>
              <Copy className="size-4" aria-hidden />
              {copied === "draft" ? "Copied!" : "Copy draft"}
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}
