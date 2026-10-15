"use client";

import { FileUp, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import { createAnalysis, type CreateAnalysisState } from "@/app/actions/analyses";
import { Button } from "@/components/ui/button";
import { FieldHint, FormError, Input, Label, Select, Textarea } from "@/components/ui/form";
import { AI_ERRORS, UPLOAD_ERRORS } from "@/lib/messages";

export function NewAnalysisForm({ demoMode, model }: { demoMode: boolean; model: string }) {
  const [state, action, pending] = useActionState<CreateAnalysisState, FormData>(createAnalysis, undefined);
  const [fileName, setFileName] = useState<string | null>(null);

  const error = state?.error
    ? state.error.kind === "form"
      ? UPLOAD_ERRORS[state.error.key]
      : AI_ERRORS[state.error.key]
    : undefined;

  return (
    <form action={action} className="space-y-8">
      {demoMode ? (
        <p className="text-sm text-muted-foreground">
          <span className="marker font-semibold text-foreground">Demo mode</span> No API key is set, so the test CVs in{" "}
          <code className="font-mono text-xs">fixtures/cases/</code> get prewritten answers and other CVs get simple
          keyword matching.
        </p>
      ) : (
        <p className="border-l-4 border-primary pl-4 text-sm text-muted-foreground" data-testid="privacy-notice">
          The analysis is made by Claude ({model}). The text of your CV and the posting is sent to Anthropic for
          analysis, and stored encrypted here. You can delete it at any time.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="flex flex-col rounded-lg bg-card p-6 shadow-paper">
          <Label htmlFor="cv" className="font-display text-lg font-bold">
            CV <span className="font-sans text-sm font-normal text-muted-foreground">PDF or TXT, max 5 MB</span>
          </Label>
          <div className="relative mt-1 flex flex-1 flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed px-6 py-10 text-center transition-colors duration-150 hover:border-primary hover:bg-accent has-[input:focus-visible]:border-primary has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-primary/25">
            <FileUp className="size-8 text-primary" aria-hidden />
            {fileName ? (
              <p className="font-mono text-sm break-all">{fileName}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-primary">Choose a file</span> or drop it here
              </p>
            )}
            <input
              id="cv"
              name="cv"
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              required
              onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>
          <FieldHint className="mt-3">Only the text is stored, encrypted. Scanned PDFs (images) can&apos;t be read.</FieldHint>
        </div>

        <div className="rounded-lg bg-card p-6 shadow-paper">
          <Label htmlFor="posting" className="font-display text-lg font-bold">
            Job posting
          </Label>
          <Textarea
            id="posting"
            name="posting"
            required
            rows={14}
            placeholder="Paste the whole posting here, including requirements and tasks."
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="keywords">Keywords to highlight (optional)</Label>
          <Input id="keywords" name="keywords" placeholder="e.g. Python, customer service" />
        </div>
        <div>
          <Label htmlFor="tone">Cover-letter tone</Label>
          <Select id="tone" name="tone" defaultValue="formal">
            <option value="formal">Formal</option>
            <option value="conversational">Personal and professional</option>
          </Select>
        </div>
      </div>

      <FormError message={error} />

      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {pending ? "Analysing … this can take half a minute" : "Analyse"}
      </Button>
    </form>
  );
}
