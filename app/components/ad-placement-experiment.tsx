"use client";

import { useEffect, useState } from "react";
import { AdSenseSlot } from "@/app/components/adsense-slot";

type Variant = "header_focus" | "result_focus";

const STORAGE_KEY = "ad-placement-variant-v1";
const HEADER_FOCUS_RATIO = 0.6;

function decideVariant(): Variant {
  if (typeof window === "undefined") return "header_focus";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "header_focus" || stored === "result_focus") {
    return stored;
  }

  const assigned: Variant = Math.random() < HEADER_FOCUS_RATIO ? "header_focus" : "result_focus";
  window.localStorage.setItem(STORAGE_KEY, assigned);
  return assigned;
}

export function AdPlacementExperiment({
  position,
}: {
  position: "header" | "result";
}) {
  const [variant, setVariant] = useState<Variant>("header_focus");

  useEffect(() => {
    setVariant(decideVariant());
  }, []);

  const showHeader = variant === "header_focus";
  const showResult = variant === "result_focus";

  if (position === "header" && showHeader) {
    return <AdSenseSlot slot="1234567890" className="mt-20" />;
  }

  if (position === "result" && showResult) {
    return <AdSenseSlot slot="2345678901" className="mt-20" />;
  }

  return null;
}
