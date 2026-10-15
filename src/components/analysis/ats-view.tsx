import type { GapAnalysis } from "@/lib/ai/schemas";

export function AtsView({ ats }: { ats: GapAnalysis["atsRelevance"] }) {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section className="space-y-2">
        <h2 className="text-xl font-extrabold">How an ATS reads your CV</h2>
        <p className="leading-relaxed text-muted-foreground">{ats.summary}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">Phrasing suggestions</h2>
        {ats.phrasingSuggestions.length === 0 ? (
          <p className="text-muted-foreground">No phrasing suggestions.</p>
        ) : (
          <ul className="space-y-3">
            {ats.phrasingSuggestions.map((s, index) => (
              <li key={index} className="space-y-3 rounded-lg bg-card p-5 shadow-paper">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">Now</p>
                    <p className="font-mono text-[13px] leading-relaxed text-muted-foreground">{s.original}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-bold tracking-wider text-primary-dark uppercase">Suggested</p>
                    <p className="font-mono text-[13px] leading-relaxed font-medium">{s.suggested}</p>
                  </div>
                </div>
                <p className="border-t pt-3 text-sm text-muted-foreground">{s.why}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
