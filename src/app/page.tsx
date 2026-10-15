import { ChevronDown } from "lucide-react";
import Link from "next/link";

import { RequirementBody } from "@/components/analysis/requirement-detail";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

// A real row from fixture case A (fictional CV), shown opened, as a specimen of the result page.
const SPECIMEN = {
  requirement: "Has basic knowledge of networking",
  status: "covered" as const,
  reasoning:
    "You have hands-on experience with router setup and Wi-Fi troubleshooting, backed by the course Networks and IT Security.",
  nextStep: 'Write "network troubleshooting" rather than just "Wi-Fi", so the wording matches the responsibilities in the posting.',
  cvEvidence: "Helped customers set up routers and troubleshoot Wi-Fi",
  evidenceVerified: true,
};
const SPECIMEN_CV = `2024–present Customer Service Assistant, Elkjøp Molde
- Advised customers on choosing PCs, phones and network equipment
- Helped customers set up routers and troubleshoot Wi-Fi
- Handled warranty claims in the store's checkout system`;

const RULES = [
  {
    title: "It must quote your CV.",
    text: "Every requirement it marks as covered or partial comes with a word-for-word quote from your CV as evidence.",
  },
  {
    title: "The app checks every quote.",
    text: "If a quote can't be found in your CV, you see a warning next to it. The AI can't invent experience for you.",
  },
  {
    title: "The score is counted, not guessed.",
    text: "The app calculates the coverage score from the statuses, so the same analysis always gives the same number.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-28">
      <section className="grid items-center gap-14 pt-4 lg:grid-cols-[1.05fr_1fr]">
        <div className="space-y-7">
          <h1 className="text-5xl leading-[1.02] font-extrabold tracking-[-0.035em] md:text-6xl">
            See your CV the way <span className="marker marker-sweep">recruiting software</span> reads it
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            Upload your CV and paste a job posting. Every requirement gets marked as covered, partial or missing, with
            the line from your CV that proves it and what to do next.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={user ? "/analyses/new" : "/register"} className={buttonVariants({ size: "lg" })}>
              {user ? "New analysis" : "Get started"}
            </Link>
            <Link href={user ? "/dashboard" : "/login"} className={buttonVariants({ variant: "secondary", size: "lg" })}>
              {user ? "My analyses" : "Log in"}
            </Link>
          </div>
        </div>

        <figure className="space-y-3">
          <div className="overflow-hidden rounded-lg bg-card shadow-paper" data-status={SPECIMEN.status} aria-hidden>
            <div className="flex items-start gap-4 bg-muted/60 px-5 py-4">
              <span className="mt-1.5 h-3 w-5 shrink-0 -skew-x-12 rounded-[2px] bg-marker-covered" />
              <span className="flex-1 font-semibold">{SPECIMEN.requirement}</span>
              <ChevronDown className="mt-0.5 size-5 rotate-180 text-muted-foreground" />
            </div>
            <div className="px-5 pt-1 pb-6 sm:pl-14">
              <RequirementBody requirement={SPECIMEN} cvText={SPECIMEN_CV} />
            </div>
          </div>
          <figcaption className="font-mono text-xs text-muted-foreground">
            One requirement from an analysis of a fictional student CV.
          </figcaption>
        </figure>
      </section>

      <section className="grid gap-10 border-t pt-12 md:grid-cols-[1fr_2fr]">
        <h2 className="text-3xl leading-tight font-extrabold">Three rules the AI follows</h2>
        <ul className="divide-y border-y">
          {RULES.map(({ title, text }) => (
            <li key={title} className="grid gap-1 py-5 sm:grid-cols-[16rem_1fr] sm:gap-8">
              <p className="font-display text-lg font-bold">{title}</p>
              <p className="leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
