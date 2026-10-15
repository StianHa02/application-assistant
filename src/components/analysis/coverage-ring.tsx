import { cn } from "@/lib/utils";

// Small circular score indicator. Colour follows the status colours: green / orange / red.
export function CoverageRing({ score, size = 56, className }: { score: number; size?: number; className?: string }) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = score >= 70 ? "var(--color-success)" : score >= 40 ? "var(--color-warning)" : "var(--color-destructive)";

  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-bold">{score}%</span>
    </div>
  );
}
