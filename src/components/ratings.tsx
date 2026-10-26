export function RatingChip({ kind, value }: { kind: "matcha" | "coffee"; value: number | null }) {
  const styles = kind === "matcha" ? "bg-matcha-soft text-matcha" : "bg-coffee-soft text-coffee";
  return (
    <span className={`inline-flex items-baseline gap-1.5 rounded-full px-3 py-1 font-sans font-semibold ${styles}`}>
      <span className="text-sm tracking-wide">{kind === "matcha" ? "Matcha" : "Coffee"}</span>
      <span className="text-lg leading-none tabular-nums">{value === null ? "–" : value.toFixed(1)}</span>
    </span>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span role="img" aria-label={`${rating} out of 5`} className="tracking-tight">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} aria-hidden className={n <= rating ? "text-matcha" : "text-line"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-line/70 px-2.5 py-0.5 text-sm font-medium text-ink">{children}</span>;
}
