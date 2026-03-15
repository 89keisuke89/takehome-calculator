export type AdPlacementInfo = {
  breakType?: string;
  breakName?: string;
  breakFormat?: "interstitial" | "reward" | string;
  breakStatus?:
    | "notReady"
    | "timeout"
    | "invalid"
    | "error"
    | "noAdPreloaded"
    | "frequencyCapped"
    | "ignored"
    | "other"
    | "dismissed"
    | "viewed"
    | string;
};

type AdBreakConfig = {
  type: "reward";
  name?: string;
  beforeAd?: () => void;
  afterAd?: () => void;
  beforeReward?: (showAdFn: () => void) => void;
  adDismissed?: () => void;
  adViewed?: () => void;
  adBreakDone?: (placementInfo: AdPlacementInfo) => void;
};

type AdConfigInput = {
  preloadAdBreaks?: "on" | "auto";
  sound?: "on" | "off";
  onReady?: () => void;
};

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
    adBreak?: (config: AdBreakConfig) => void;
    adConfig?: (config: AdConfigInput) => void;
  }
}

export type RewardedAdResult =
  | { status: "viewed"; placementInfo?: AdPlacementInfo }
  | { status: "dismissed"; placementInfo?: AdPlacementInfo }
  | { status: "unavailable"; placementInfo?: AdPlacementInfo }
  | { status: "unsupported" }
  | { status: "error"; error?: unknown; placementInfo?: AdPlacementInfo };

type RequestRewardedAdOptions = {
  placementName: string;
  sound?: "on" | "off";
  timeoutMs?: number;
};

function mapBreakStatusToResult(placementInfo?: AdPlacementInfo): RewardedAdResult {
  const status = placementInfo?.breakStatus;
  if (status === "viewed") {
    return { status: "viewed", placementInfo };
  }
  if (status === "dismissed") {
    return { status: "dismissed", placementInfo };
  }
  if (status === "error") {
    return { status: "error", placementInfo };
  }
  return { status: "unavailable", placementInfo };
}

export function requestRewardedAd({
  placementName,
  sound = "on",
  timeoutMs = 15000,
}: RequestRewardedAdOptions): Promise<RewardedAdResult> {
  if (typeof window === "undefined") {
    return Promise.resolve({ status: "unsupported" });
  }

  const adBreak = window.adBreak;
  if (typeof adBreak !== "function") {
    return Promise.resolve({ status: "unsupported" });
  }

  return new Promise<RewardedAdResult>((resolve) => {
    let done = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const finish = (result: RewardedAdResult) => {
      if (done) {
        return;
      }
      done = true;
      if (timerId !== null) {
        clearTimeout(timerId);
      }
      resolve(result);
    };

    timerId = setTimeout(() => {
      finish({ status: "unavailable" });
    }, timeoutMs);

    try {
      window.adConfig?.({ sound });
      adBreak({
        type: "reward",
        name: placementName,
        beforeReward: (showAdFn) => {
          showAdFn();
        },
        adViewed: () => {
          finish({ status: "viewed" });
        },
        adDismissed: () => {
          finish({ status: "dismissed" });
        },
        adBreakDone: (placementInfo) => {
          finish(mapBreakStatusToResult(placementInfo));
        },
      });
    } catch (error) {
      finish({ status: "error", error });
    }
  });
}
