"use client";

// "Where to next." — a full-width band that steps through the cafés one at a time.
// The middle card is the current café; the ones beside it are dimmed glass cards.
// Cards show the café's own details and your ratings, never invented reviews.

import Link from "next/link";
import { useRef, useState } from "react";
import type { CafeSummary } from "@/lib/cafes";
import { ExternalArrow } from "@/components/decor";
import { cafeHref, googleMapsHref } from "@/lib/routes";

export function CafeSpotlight({ cafes }: { cafes: CafeSummary[] }) {
  const [index, setIndex] = useState(() => Math.min(1, cafes.length - 1));
  const touchX = useRef<number | null>(null);
  if (cafes.length === 0) return null;

  const current = Math.min(index, cafes.length - 1);
  const go = (step: number) =>
    setIndex(
      (i) =>
        (Math.min(i, cafes.length - 1) + step + cafes.length) % cafes.length,
    );

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Cafés to visit"
      className="relative overflow-hidden bg-[#5d6a52] pb-14 pt-10 text-white sm:pb-20"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      }}
    >
      {/* Soft diagonal light across the band, like sun through a window. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, transparent 0 18%, rgb(255 255 255 / 0.16) 24% 38%, transparent 46% 58%, rgb(255 255 255 / 0.1) 64% 74%, transparent 82%), radial-gradient(ellipse at 50% 30%, rgb(214 222 196 / 0.35), transparent 60%)",
        }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 sm:px-6">
        <h2 className="text-center font-display text-[clamp(4rem,16vw,11rem)] font-bold leading-[0.85] tracking-tight">
          Where to next.
        </h2>
        <MatchaGlass className="-mt-[clamp(1.5rem,5vw,3.5rem)] h-48 w-auto drop-shadow-[18px_30px_24px_rgb(20_30_15/0.35)] sm:h-64" />
        <p className="headline mt-2 text-center text-3xl sm:text-4xl">
          Pick one
          <br />
          and go
        </p>
        <div className="mt-4 flex gap-2">
          <ArrowButton label="Previous café" onClick={() => go(-1)} flip />
          <ArrowButton label="Next café" onClick={() => go(1)} />
        </div>
        <p aria-live="polite" className="sr-only">
          {`${current + 1} of ${cafes.length}: ${cafes[current].name}`}
        </p>
      </div>

      <div className="relative mt-8 [--g:1.25rem] [--w:min(82vw,24rem)]">
        <ul
          className="relative left-1/2 flex w-max gap-[var(--g)] transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{
            transform: `translateX(calc(-1 * (${current} * (var(--w) + var(--g)) + var(--w) / 2)))`,
          }}
        >
          {cafes.map((cafe, i) => (
            <SpotlightCard
              key={cafe.id}
              cafe={cafe}
              active={i === current}
              onSelect={() => setIndex(i)}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function SpotlightCard({
  cafe,
  active,
  onSelect,
}: {
  cafe: CafeSummary;
  active: boolean;
  onSelect: () => void;
}) {
  const rated = [
    cafe.matchaAvg !== null && `Matcha ${cafe.matchaAvg.toFixed(1)}`,
    cafe.coffeeAvg !== null && `Coffee ${cafe.coffeeAvg.toFixed(1)}`,
  ].filter(Boolean);

  return (
    <li
      aria-hidden={!active}
      onClick={active ? undefined : onSelect}
      className={`flex min-h-[17rem] w-[var(--w)] shrink-0 flex-col rounded-md border p-6 transition duration-500 sm:p-8 ${
        active
          ? "border-white bg-white text-[#1e4620]"
          : "cursor-pointer border-white/45 bg-[#1c2418]/55 text-white backdrop-blur-sm hover:bg-[#1c2418]/65"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p
          className={`text-sm font-semibold uppercase tracking-wider ${active ? "text-[#4f7f3a]" : "text-[#b9d6a2]"}`}
        >
          {[cafe.servesMatcha && "Matcha", cafe.servesCoffee && "Coffee"]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {active && (
          <a
            href={googleMapsHref(cafe)}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-sm font-semibold text-[#2a5a26] underline underline-offset-2 hover:no-underline"
          >
            Google reviews <ExternalArrow />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>
      <h3 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        {cafe.name}
      </h3>
      <p className="mb-5 mt-2 line-clamp-3 text-lg leading-snug opacity-90">
        {cafe.description}
      </p>
      <div
        className={`mt-auto flex items-center justify-between gap-3 border-t pt-4 ${active ? "border-[#1e4620]/15" : "border-white/25"}`}
      >
        <span className="font-display text-xl font-bold">
          {cafe.neighborhood}
        </span>
        {active ? (
          <Link
            href={cafeHref(cafe.id)}
            className="flex items-center gap-1.5 rounded-full bg-[#2a5a26] px-3 py-1 text-sm font-semibold text-white hover:opacity-90"
          >
            {rated.length ? rated.join(" · ") : "Not rated yet"}
            <span aria-hidden>→</span>
          </Link>
        ) : (
          <span className="text-sm opacity-80">
            {rated.length ? rated.join(" · ") : "Not rated yet"}
          </span>
        )}
      </div>
    </li>
  );
}

function ArrowButton({
  label,
  onClick,
  flip = false,
}: {
  label: string;
  onClick: () => void;
  flip?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-14 items-center justify-center rounded-full bg-white text-[#1e4620] shadow-md transition hover:scale-105 active:scale-95"
    >
      <svg
        viewBox="0 0 16 16"
        className={`size-4 ${flip ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
      </svg>
    </button>
  );
}

/** A drawn iced matcha latte in a tumbler: milk below, matcha swirling in, ice on top. */
function MatchaGlass({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 220" className={className}>
      <defs>
        <linearGradient id="glass-milk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f6ec" />
          <stop offset="1" stopColor="#dfe6d2" />
        </linearGradient>
        <linearGradient id="glass-matcha" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4d7a23" />
          <stop offset="0.55" stopColor="#7fae3c" />
          <stop offset="1" stopColor="#2f5717" />
        </linearGradient>
        <clipPath id="glass-inside">
          <path d="M28 30 L172 30 L162 196 Q160 210 146 210 L54 210 Q40 210 38 196 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#glass-inside)">
        <rect x="0" y="30" width="200" height="190" fill="url(#glass-milk)" />
        <path
          d="M20 60 C 70 40, 90 120, 140 90 S 190 150, 180 210 L 20 210 Z"
          fill="url(#glass-matcha)"
          opacity="0.92"
        />
        <path
          d="M20 120 C 60 100, 100 170, 150 140 S 200 190, 190 220 L 20 220 Z"
          fill="#2f5717"
          opacity="0.55"
        />
        <path
          d="M40 150 C 80 130, 110 190, 170 170"
          stroke="#f4f6ec"
          strokeWidth="9"
          fill="none"
          opacity="0.7"
          strokeLinecap="round"
        />
        {[
          [44, 34, 46, -12],
          [96, 26, 50, 8],
          [126, 62, 42, -6],
          [60, 76, 40, 14],
        ].map(([x, y, s, r], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width={s}
            height={s}
            rx="9"
            transform={`rotate(${r} ${x + s / 2} ${y + s / 2})`}
            fill="#ffffff"
            fillOpacity="0.32"
            stroke="#ffffff"
            strokeOpacity="0.7"
            strokeWidth="2"
          />
        ))}
      </g>
      <path
        d="M28 30 L172 30 L162 196 Q160 210 146 210 L54 210 Q40 210 38 196 Z"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.85"
        strokeWidth="4"
      />
      <ellipse
        cx="100"
        cy="30"
        rx="72"
        ry="9"
        fill="#ffffff"
        fillOpacity="0.25"
        stroke="#ffffff"
        strokeOpacity="0.9"
        strokeWidth="3"
      />
      <path
        d="M46 50 L56 190"
        stroke="#ffffff"
        strokeOpacity="0.55"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
