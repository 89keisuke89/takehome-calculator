"use client";

import { useEffect, useState } from "react";
import { AdSenseSlot } from "@/app/components/adsense-slot";

type Variant = "header_focus" | "result_focus";

const STORAGE_KEY = "ad-placement-variant-v1";
const STATS_KEY = "ad-placement-stats-v1";
const HEADER_FOCUS_RATIO = 0.55;
const MIN_SAMPLE = 40;
const EXPLORE_RATE = 0.15;

type Stats = Record<Variant, { views: number; engaged: number }>;

function loadStats(): Stats {
  if (typeof window === "undefined") {
    return {
      header_focus: { views: 0, engaged: 0 },
      result_focus: { views: 0, engaged: 0 },
    };
  }
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Stats) : null;
    if (!parsed) throw new Error("empty");
    return parsed;
  } catch {
    return {
      header_focus: { views: 0, engaged: 0 },
      result_focus: { views: 0, engaged: 0 },
    };
  }
}

function saveStats(stats: Stats) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function engagementRate(stats: Stats, variant: Variant): number {
  const sample = stats[variant];
  if (sample.views === 0) return 0;
  return sample.engaged / sample.views;
}

function decideVariant(): Variant {
  if (typeof window === "undefined") return "header_focus";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  const stats = loadStats();
  const totalViews = stats.header_focus.views + stats.result_focus.views;

  if (stored === "header_focus" || stored === "result_focus") {
    if (totalViews < MIN_SAMPLE) {
      return stored;
    }
    if (Math.random() < EXPLORE_RATE) {
      return Math.random() < 0.5 ? "header_focus" : "result_focus";
    }
    return engagementRate(stats, "header_focus") >= engagementRate(stats, "result_focus")
      ? "header_focus"
      : "result_focus";
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
    const selected = decideVariant();
    setVariant(selected);

    if (position === "header") {
      const stats = loadStats();
      stats[selected].views += 1;
      saveStats(stats);

      const timer = window.setTimeout(() => {
        const next = loadStats();
        next[selected].engaged += 1;
        saveStats(next);
      }, 20000);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [position]);

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
