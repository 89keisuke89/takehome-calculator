"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import {
  DEFAULT_SNAKE_CONFIG,
  canReviveSnake,
  reviveSnake,
  type Direction,
  type SnakePhase,
  type SnakeStatus,
  createInitialSnakeState,
  restartSnake,
  setNextDirection,
  stepSnake,
  togglePause,
} from "@/lib/snake";
import { requestRewardedAd } from "@/lib/ad-placement";

const KEY_TO_DIRECTION: Record<string, Direction> = {
  arrowup: "up",
  arrowdown: "down",
  arrowleft: "left",
  arrowright: "right",
  w: "up",
  a: "left",
  s: "down",
  d: "right",
};

const CLEAN_HIGH_SCORE_KEY = "snake-high-score-clean-v2";
const REVIVE_HIGH_SCORE_KEY = "snake-high-score-revive-v2";
const ENERGY_STATE_KEY = "snake-energy-state-v1";
const ENERGY_MAX = 5;
const ENERGY_REFILL_MS = 12 * 60 * 1000;

type InstallPromptChoice = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallPromptChoice>;
};

type EnergyState = {
  value: number;
  updatedAt: number;
};

function statusLabel(status: SnakeStatus): string {
  if (status === "ready") {
    return "待機中";
  }
  if (status === "running") {
    return "プレイ中";
  }
  if (status === "paused") {
    return "一時停止中";
  }
  return "ゲームオーバー";
}

function phaseLabel(phase: SnakePhase): string {
  if (phase === "skill") {
    return "実力フェーズ";
  }
  if (phase === "hybrid") {
    return "実力 + 運フェーズ";
  }
  return "運重視フェーズ";
}

function statusMessage(status: SnakeStatus): string {
  if (status === "ready") {
    return "Start か方向キーで開始します。";
  }
  if (status === "paused") {
    return "Pause中です。Resumeで再開できます。";
  }
  if (status === "game_over") {
    return "ゲームオーバー。広告で1回だけ復活できます。";
  }
  return "壁または自分の体に当たると終了です。";
}

function detectIos(navigatorObj: Navigator): boolean {
  return /iphone|ipad|ipod/i.test(navigatorObj.userAgent);
}

function clampEnergyValue(value: number): number {
  return Math.max(0, Math.min(ENERGY_MAX, Math.floor(value)));
}

function recoverEnergy(state: EnergyState, now: number): EnergyState {
  const safeState = {
    value: clampEnergyValue(state.value),
    updatedAt: Number.isFinite(state.updatedAt) ? state.updatedAt : now,
  };
  if (safeState.value >= ENERGY_MAX) {
    return safeState;
  }

  const elapsed = Math.max(0, now - safeState.updatedAt);
  const recovered = Math.floor(elapsed / ENERGY_REFILL_MS);
  if (recovered <= 0) {
    return safeState;
  }

  const nextValue = clampEnergyValue(safeState.value + recovered);
  const nextUpdatedAt =
    nextValue >= ENERGY_MAX ? now : safeState.updatedAt + recovered * ENERGY_REFILL_MS;
  return { value: nextValue, updatedAt: nextUpdatedAt };
}

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function SnakeGame() {
  const [state, setState] = useState(() => createInitialSnakeState(DEFAULT_SNAKE_CONFIG));
  const [cleanHighScore, setCleanHighScore] = useState(0);
  const [reviveHighScore, setReviveHighScore] = useState(0);
  const [energyState, setEnergyState] = useState<EnergyState>({
    value: ENERGY_MAX,
    updatedAt: Date.now(),
  });
  const [energyNotice, setEnergyNotice] = useState<string | null>(null);
  const [clock, setClock] = useState(Date.now());
  const [activeAdAction, setActiveAdAction] = useState<"energy" | "revive" | null>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const energyRef = useRef<EnergyState>({ value: ENERGY_MAX, updatedAt: Date.now() });

  const snakeCellSet = useMemo(
    () => new Set(state.snake.map((point) => `${point.x},${point.y}`)),
    [state.snake]
  );

  const head = state.snake[0];
  const canRevive = canReviveSnake(state);
  const currentBestScore = state.revivesUsed > 0 ? reviveHighScore : cleanHighScore;
  const nextRefillMs = useMemo(() => {
    if (energyState.value >= ENERGY_MAX) {
      return 0;
    }
    const elapsed = Math.max(0, clock - energyState.updatedAt);
    const remainder = elapsed % ENERGY_REFILL_MS;
    return ENERGY_REFILL_MS - remainder;
  }, [clock, energyState.updatedAt, energyState.value]);

  const persistEnergyState = useCallback((nextState: EnergyState) => {
    energyRef.current = nextState;
    setEnergyState(nextState);
    window.localStorage.setItem(ENERGY_STATE_KEY, JSON.stringify(nextState));
  }, []);

  const refreshEnergyState = useCallback(
    (now: number) => {
      const refreshed = recoverEnergy(energyRef.current, now);
      if (
        refreshed.value !== energyRef.current.value ||
        refreshed.updatedAt !== energyRef.current.updatedAt
      ) {
        persistEnergyState(refreshed);
      }
      return refreshed;
    },
    [persistEnergyState]
  );

  const consumeEnergyForNewRun = useCallback((): boolean => {
    const now = Date.now();
    const current = refreshEnergyState(now);
    if (current.value <= 0) {
      return false;
    }
    persistEnergyState({
      value: current.value - 1,
      updatedAt: now,
    });
    return true;
  }, [persistEnergyState, refreshEnergyState]);

  const applyDirection = useCallback(
    (direction: Direction) => {
      setState((previous) => {
        if (previous.status === "ready") {
          if (!consumeEnergyForNewRun()) {
            setEnergyNotice("体力が足りません。時間経過か広告で回復してください。");
            return previous;
          }
          setEnergyNotice(null);
        }
        return setNextDirection(previous, direction);
      });
    },
    [consumeEnergyForNewRun]
  );

  const onTogglePlay = useCallback(() => {
    setState((previous) => {
      if (previous.status === "ready") {
        if (!consumeEnergyForNewRun()) {
          setEnergyNotice("体力が足りません。時間経過か広告で回復してください。");
          return previous;
        }
        setEnergyNotice(null);
      }
      return togglePause(previous);
    });
  }, [consumeEnergyForNewRun]);

  const onRestart = useCallback(() => {
    setState((previous) => restartSnake(previous));
    setEnergyNotice(null);
  }, []);

  const onWatchAdForEnergy = useCallback(() => {
    const execute = async () => {
      const now = Date.now();
      const current = refreshEnergyState(now);
      if (current.value >= ENERGY_MAX || activeAdAction) {
        return;
      }

      setActiveAdAction("energy");
      const result = await requestRewardedAd({
        placementName: "snake_energy_refill",
      });
      setActiveAdAction(null);

      const grantReward = () => {
        const refreshed = refreshEnergyState(Date.now());
        if (refreshed.value >= ENERGY_MAX) {
          return;
        }
        persistEnergyState({
          value: refreshed.value + 1,
          updatedAt: Date.now(),
        });
      };

      if (result.status === "viewed") {
        grantReward();
        setEnergyNotice("広告視聴完了。体力を1回復しました。");
        return;
      }

      if (
        process.env.NODE_ENV !== "production" &&
        (result.status === "unsupported" || result.status === "unavailable")
      ) {
        grantReward();
        setEnergyNotice("開発モード: 広告未配信のため報酬を付与しました。");
        return;
      }

      if (result.status === "dismissed") {
        setEnergyNotice("広告を最後まで視聴しなかったため、体力回復はありません。");
        return;
      }

      if (result.status === "error") {
        setEnergyNotice("広告処理でエラーが発生しました。時間を置いて再試行してください。");
        return;
      }

      setEnergyNotice("現在広告を配信できません。時間を置いて再試行してください。");
    };

    void execute();
  }, [activeAdAction, persistEnergyState, refreshEnergyState]);

  const onReviveByAd = useCallback(() => {
    const execute = async () => {
      if (!canRevive || activeAdAction) {
        return;
      }

      setActiveAdAction("revive");
      const result = await requestRewardedAd({
        placementName: "snake_revive_once",
      });
      setActiveAdAction(null);

      const shouldGrantDevFallback =
        process.env.NODE_ENV !== "production" &&
        (result.status === "unsupported" || result.status === "unavailable");

      if (result.status === "viewed" || shouldGrantDevFallback) {
        setState((previous) => reviveSnake(previous));
        setEnergyNotice(
          result.status === "viewed"
            ? "広告視聴完了。1回だけ復活しました。"
            : "開発モード: 広告未配信のため復活を許可しました。"
        );
        return;
      }

      if (result.status === "dismissed") {
        setEnergyNotice("広告を最後まで視聴しなかったため、復活はできません。");
        return;
      }

      if (result.status === "error") {
        setEnergyNotice("広告処理でエラーが発生しました。時間を置いて再試行してください。");
        return;
      }

      setEnergyNotice("現在広告を配信できません。時間を置いて再試行してください。");
    };

    void execute();
  }, [activeAdAction, canRevive]);

  useEffect(() => {
    if (state.status !== "running") {
      return;
    }

    const timer = window.setInterval(() => {
      setState((previous) => stepSnake(previous));
    }, state.tickMs);

    return () => window.clearInterval(timer);
  }, [state.status, state.tickMs]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const normalized = event.key.toLowerCase();
      const direction = KEY_TO_DIRECTION[normalized];

      if (direction) {
        event.preventDefault();
        applyDirection(direction);
        return;
      }

      if (event.key === " " || normalized === "p") {
        event.preventDefault();
        onTogglePlay();
        return;
      }

      if (normalized === "r" || event.key === "Enter") {
        event.preventDefault();
        onRestart();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [applyDirection, onRestart, onTogglePlay]);

  useEffect(() => {
    setIsIos(detectIos(window.navigator));

    const media = window.matchMedia("(display-mode: standalone)");
    const nav = window.navigator as Navigator & { standalone?: boolean };
    const syncStandalone = () => {
      setIsStandalone(Boolean(nav.standalone) || media.matches);
    };
    syncStandalone();

    const loadedClean = Number(window.localStorage.getItem(CLEAN_HIGH_SCORE_KEY));
    if (Number.isFinite(loadedClean) && loadedClean > 0) {
      setCleanHighScore(Math.floor(loadedClean));
    }
    const loadedRevive = Number(window.localStorage.getItem(REVIVE_HIGH_SCORE_KEY));
    if (Number.isFinite(loadedRevive) && loadedRevive > 0) {
      setReviveHighScore(Math.floor(loadedRevive));
    }

    const rawEnergy = window.localStorage.getItem(ENERGY_STATE_KEY);
    if (rawEnergy) {
      try {
        const parsed = JSON.parse(rawEnergy) as Partial<EnergyState>;
        if (typeof parsed.value === "number" && typeof parsed.updatedAt === "number") {
          const hydrated = recoverEnergy(
            {
              value: clampEnergyValue(parsed.value),
              updatedAt: parsed.updatedAt,
            },
            Date.now()
          );
          persistEnergyState(hydrated);
        }
      } catch {
        // Ignore parse errors and keep defaults.
      }
    }

    const onBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setInstallPrompt(installEvent);
    };
    const onAppInstalled = () => {
      setInstallPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    if ("addEventListener" in media) {
      media.addEventListener("change", syncStandalone);
    }

    const timer = window.setInterval(() => {
      const now = Date.now();
      setClock(now);
      refreshEnergyState(now);
    }, 1000);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
      if ("removeEventListener" in media) {
        media.removeEventListener("change", syncStandalone);
      }
      window.clearInterval(timer);
    };
  }, [persistEnergyState, refreshEnergyState]);

  useEffect(() => {
    if (state.status !== "game_over") {
      return;
    }

    if (state.revivesUsed > 0) {
      if (state.score > reviveHighScore) {
        setReviveHighScore(state.score);
        window.localStorage.setItem(REVIVE_HIGH_SCORE_KEY, String(state.score));
      }
      return;
    }

    if (state.score > cleanHighScore) {
      setCleanHighScore(state.score);
      window.localStorage.setItem(CLEAN_HIGH_SCORE_KEY, String(state.score));
    }
  }, [cleanHighScore, reviveHighScore, state.revivesUsed, state.score, state.status]);

  const onBoardTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onBoardTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) {
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const threshold = 24;
    if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
      return;
    }

    const nextDirection: Direction =
      Math.abs(deltaX) > Math.abs(deltaY) ? (deltaX > 0 ? "right" : "left") : deltaY > 0 ? "down" : "up";
    applyDirection(nextDirection);
  };

  const onInstall = async () => {
    if (!installPrompt) {
      return;
    }

    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    } catch {
      // Non-blocking; user may dismiss the install prompt.
    }
  };

  const pauseLabel =
    state.status === "paused" ? "Resume" : state.status === "running" ? "Pause" : "Start";
  const canTogglePlay = state.status !== "game_over";

  return (
    <section className="card mt-20 snake-card">
      <h2>Snake（実力→運フェーズ）</h2>
      <p className="small mt-8">
        前半は純粋なSnake、後半は特殊フードで運イベントが入ります。スマホは盤面スワイプにも対応しています。
      </p>

      <div className="snake-meta mt-12">
        <div className="list-item">スコア: {state.score}</div>
        <div className="list-item">速度: {state.tickMs}ms / tick</div>
        <div className="list-item">状態: {statusLabel(state.status)}</div>
        <div className="list-item">フェーズ: {phaseLabel(state.phase)}</div>
        <div className="list-item">最高（ノー復活）: {cleanHighScore}</div>
        <div className="list-item">最高（復活あり）: {reviveHighScore}</div>
      </div>

      <div className="snake-energy mt-12">
        <div className="list-item">
          体力: {energyState.value}/{ENERGY_MAX}
        </div>
        <div className="list-item">
          {energyState.value >= ENERGY_MAX ? "体力満タン" : `次回回復: ${formatCountdown(nextRefillMs)}`}
        </div>
        <button
          type="button"
          className="button secondary"
          onClick={onWatchAdForEnergy}
          disabled={energyState.value >= ENERGY_MAX || activeAdAction !== null}
        >
          {activeAdAction === "energy" ? "広告読み込み中..." : "広告で体力+1"}
        </button>
      </div>

      {energyNotice ? <p className="small mt-8">{energyNotice}</p> : null}

      <div className="snake-board-shell mt-20" onTouchStart={onBoardTouchStart} onTouchEnd={onBoardTouchEnd}>
        <div
          className="snake-board"
          style={{
            gridTemplateColumns: `repeat(${state.config.width}, minmax(0, 1fr))`,
          }}
          aria-label="Snake board"
        >
          {Array.from({ length: state.config.height }).map((_, y) =>
            Array.from({ length: state.config.width }).map((__, x) => {
              const key = `${x},${y}`;
              const isSnake = snakeCellSet.has(key);
              const isHead = head.x === x && head.y === y;
              const isFood = state.food.x === x && state.food.y === y;
              const isSpecialFood = Boolean(
                state.specialFood && state.specialFood.x === x && state.specialFood.y === y
              );

              return (
                <div
                  key={key}
                  className={[
                    "snake-cell",
                    isSnake ? "snake-cell-snake" : "",
                    isHead ? "snake-cell-head" : "",
                    isFood ? "snake-cell-food" : "",
                    isSpecialFood ? "snake-cell-special" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              );
            })
          )}
        </div>
      </div>

      {state.lastEvent ? (
        <p className="small mt-8">
          運イベント: {state.lastEvent === "fortune" ? "大当たり（得点/減速）" : "ハザード（高速化）"}
        </p>
      ) : null}

      {state.status === "game_over" ? (
        <div className="snake-gameover mt-12">
          <h3>ゲームオーバー</h3>
          <p className="small mt-8">
            今回: {state.score} / この区分の最高: {currentBestScore} / 区分:{" "}
            {state.revivesUsed > 0 ? "復活あり" : "ノー復活"}
          </p>
          <button type="button" className="button mt-12" onClick={onRestart}>
            もう一回
          </button>
          {canRevive ? (
            <button
              type="button"
              className="button secondary mt-12"
              onClick={onReviveByAd}
              disabled={activeAdAction !== null}
            >
              {activeAdAction === "revive" ? "広告読み込み中..." : "広告で復活（1回）"}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="snake-primary-controls mt-12">
        <button type="button" className="button" onClick={onTogglePlay} disabled={!canTogglePlay}>
          {pauseLabel}
        </button>
        <button type="button" className="button secondary" onClick={onRestart}>
          Restart
        </button>
      </div>

      <div className="snake-mobile-controls mt-12" aria-label="On-screen direction controls">
        <div className="snake-dpad">
          <button
            type="button"
            className="button secondary snake-dir-button snake-dir-up"
            onClick={() => applyDirection("up")}
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            className="button secondary snake-dir-button snake-dir-left"
            onClick={() => applyDirection("left")}
            aria-label="Move left"
          >
            ←
          </button>
          <button
            type="button"
            className="button secondary snake-dir-button snake-dir-down"
            onClick={() => applyDirection("down")}
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            className="button secondary snake-dir-button snake-dir-right"
            onClick={() => applyDirection("right")}
            aria-label="Move right"
          >
            →
          </button>
        </div>
      </div>

      {!isStandalone && (installPrompt || isIos) ? (
        <div className="snake-install mt-12">
          {installPrompt ? (
            <button type="button" className="button" onClick={onInstall}>
              Install app
            </button>
          ) : null}
          {isIos ? (
            <p className="small mt-8">
              iPhone/iPadは共有メニューから「ホーム画面に追加」でインストールできます。
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="small mt-12">{statusMessage(state.status)}</p>
    </section>
  );
}
