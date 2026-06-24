type SourceBadgeProps = {
  label: string;
  tone?: "live" | "time-lapse" | "still" | "curated";
};

const toneClasses: Record<NonNullable<SourceBadgeProps["tone"]>, string> = {
  live: "border-emerald-400/40 bg-emerald-300/10 text-emerald-100",
  "time-lapse": "border-sky-400/40 bg-sky-300/10 text-sky-100",
  still: "border-amber-400/40 bg-amber-300/10 text-amber-100",
  curated: "border-white/20 bg-white/10 text-white/80",
};

export function SourceBadge({ label, tone = "curated" }: SourceBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
