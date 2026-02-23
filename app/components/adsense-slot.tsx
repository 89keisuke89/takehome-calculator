"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

type AdSenseSlotProps = {
  slot: string;
  className?: string;
};

export function AdSenseSlot({ slot, className }: AdSenseSlotProps) {
  const client = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;
  const hasClient = Boolean(client);

  useEffect(() => {
    if (!hasClient) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // Ignore push errors during hydration/re-render.
    }
  }, [hasClient, slot]);

  if (!hasClient) {
    return <div className={`ad-slot ${className ?? ""}`}>広告枠（AdSense未設定）</div>;
  }

  return (
    <div className={`ad-slot-live ${className ?? ""}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
