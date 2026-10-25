"use client";

import { resetDemo } from "@/lib/demo/store";

export function DemoBanner() {
  return (
    <div className="bg-matcha px-4 py-2 text-center text-sm font-medium text-cream">
      Live demo with real Boston-area cafés and no ratings yet. Anything you add is saved only in this browser.{" "}
      <button
        type="button"
        onClick={() => {
          if (window.confirm("Reset the demo to the sample cafés? Your changes in this browser will be cleared.")) resetDemo();
        }}
        className="font-medium underline underline-offset-2 hover:opacity-80"
      >
        Reset demo
      </button>
    </div>
  );
}
