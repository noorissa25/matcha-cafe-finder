export function RatingChip({ kind, value }: { kind: "matcha" | "coffee"; value: number | null }) {
  const styles = kind === "matcha" ? "bg-matcha-soft text-matcha" : "bg-coffee-soft text-coffee";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}>
      {kind === "matcha" ? "Matcha" : "Coffee"}
      <span className="tabular-nums">{value === null ? "–" : value.toFixed(1)}</span>
    </span>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5`} className="tracking-tight">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} aria-hidden className={n <= rating ? "text-ink" : "text-line"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">{children}</span>;
}
