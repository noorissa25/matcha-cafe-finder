// Decorative pieces: the flowing ribbon, handwritten notes and round stat badges.
// Everything purely decorative is hidden from screen readers.

import type { ReactNode } from "react";

/** A wide white ribbon swooping across a section. Place inside a `relative` parent. */
export function Ribbon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 400"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute ${className}`}
      fill="none"
    >
      <path
        d="M-40 330 C 220 330, 300 60, 560 120 S 900 380, 1240 90"
        stroke="var(--ribbon)"
        strokeWidth="38"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A handwritten aside with a small drawn arrow pointing down toward the content. */
export function Scribble({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex flex-col items-start font-script text-2xl leading-6 text-ink ${className}`}
    >
      <span className="-rotate-6">{children}</span>
      <svg
        viewBox="0 0 60 50"
        className="ml-6 mt-1 h-10 w-12 text-ink"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M6 4 C 4 22, 14 38, 46 42" />
        <path d="M38 34 L 47 42 L 37 47" />
      </svg>
    </span>
  );
}

/** Round white badge with a big number and a small label, like a nutrition callout. */
export function StatBadge({
  value,
  unit,
  label,
}: {
  value: string | number;
  unit?: string;
  label: string;
}) {
  return (
    <div className="flex size-24 shrink-0 flex-col items-center justify-center rounded-full bg-card text-center shadow-sm sm:size-32">
      <span className="font-display text-4xl font-semibold leading-none tabular-nums sm:text-5xl">
        {value}
        {unit && <span className="text-xl sm:text-2xl">{unit}</span>}
      </span>
      <span className="mt-1 text-sm font-medium leading-tight sm:text-base">
        {label}
      </span>
    </div>
  );
}

/** Arrow-in-a-circle used before pill buttons. */
export function ArrowDot({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`flex size-9 shrink-0 items-center justify-center rounded-full ${className}`}
    >
      <svg
        viewBox="0 0 16 16"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M4.5 11.5 L11.5 4.5 M5.5 4.5 H11.5 V10.5" />
      </svg>
    </span>
  );
}

/** Small "opens elsewhere" arrow; drawn so iOS does not turn it into an emoji. */
export function ExternalArrow({
  className = "size-3.5",
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={`inline-block shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4.5 11.5 L11.5 4.5 M5.5 4.5 H11.5 V10.5" />
    </svg>
  );
}
