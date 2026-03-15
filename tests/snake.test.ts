import { describe, expect, it } from "vitest";
import {
  canReviveSnake,
  createInitialSnakeState,
  getSnakePhase,
  restartSnake,
  reviveSnake,
  setNextDirection,
  stepSnake,
  togglePause,
  type SnakeState,
} from "../lib/snake";

function sequenceRng(values: number[]): () => number {
  let index = 0;
  return () => {
    const next = values[Math.min(index, values.length - 1)] ?? 0;
    index += 1;
    return next;
  };
}

describe("snake core logic", () => {
  it("初期状態は長さ3・スコア0で、エサは蛇と重ならない", () => {
    const state = createInitialSnakeState({}, () => 0);
    expect(state.snake).toHaveLength(3);
    expect(state.score).toBe(0);
    expect(state.phase).toBe("skill");
    expect(state.specialFood).toBeNull();
    expect(state.revivesUsed).toBe(0);
    expect(
      state.snake.some((segment) => segment.x === state.food.x && segment.y === state.food.y)
    ).toBe(false);
  });

  it("1tickで前進し、通常移動では長さを維持する", () => {
    const started = setNextDirection(createInitialSnakeState({}, () => 0), "right");
    const next = stepSnake(started, () => 0);

    expect(next.status).toBe("running");
    expect(next.snake).toHaveLength(3);
    expect(next.snake[0]).toEqual({ x: 11, y: 10 });
  });

  it("エサ取得で成長し、スコア増加と速度加速が起きる", () => {
    const state: SnakeState = {
      ...createInitialSnakeState({}, () => 0),
      status: "running",
      food: { x: 11, y: 10 },
    };
    const next = stepSnake(state, () => 0);

    expect(next.snake).toHaveLength(4);
    expect(next.score).toBe(1);
    expect(next.tickMs).toBe(172);
    expect(next.phase).toBe("skill");
    expect(next.specialFood).toBeNull();
    expect(
      next.snake.some((segment) => segment.x === next.food.x && segment.y === next.food.y)
    ).toBe(false);
  });

  it("スコア20でhybridフェーズへ遷移し、特殊フード抽選が有効化される", () => {
    const state: SnakeState = {
      ...createInitialSnakeState({}, () => 0),
      status: "running",
      score: 19,
      phase: getSnakePhase(19),
      food: { x: 11, y: 10 },
    };
    const next = stepSnake(state, sequenceRng([0, 0, 0]));

    expect(next.score).toBe(20);
    expect(next.phase).toBe("hybrid");
    expect(next.specialFood).not.toBeNull();
  });

  it("luckフェーズの特殊フードはランダムイベントを発生させる", () => {
    const state: SnakeState = {
      ...createInitialSnakeState({}, () => 0),
      status: "running",
      score: 50,
      tickMs: 120,
      phase: "luck",
      food: { x: 0, y: 0 },
      specialFood: { x: 11, y: 10 },
    };
    const next = stepSnake(state, sequenceRng([0.99, 0, 0]));

    expect(next.lastEvent).toBe("hazard");
    expect(next.score).toBe(50);
    expect(next.tickMs).toBe(104);
  });

  it("壁衝突でゲームオーバーになり、1回だけ復活できる", () => {
    const state: SnakeState = {
      ...createInitialSnakeState({}, () => 0),
      status: "running",
      score: 10,
      tickMs: 160,
      direction: "right",
      snake: [
        { x: 19, y: 10 },
        { x: 18, y: 10 },
        { x: 17, y: 10 },
      ],
      food: { x: 0, y: 0 },
    };

    const dead = stepSnake(state);
    expect(dead.status).toBe("game_over");
    expect(canReviveSnake(dead)).toBe(true);

    const revived = reviveSnake(dead);
    expect(revived.status).toBe("paused");
    expect(revived.revivesUsed).toBe(1);
    expect(revived.score).toBe(5);
    expect(revived.tickMs).toBe(150);
    expect(canReviveSnake(revived)).toBe(false);
  });

  it("逆方向入力は無効化される", () => {
    const initial = createInitialSnakeState({}, () => 0);
    const reversed = setNextDirection(initial, "left");
    expect(reversed.queuedDirection).toBeNull();
    expect(reversed.status).toBe("ready");

    const turned = setNextDirection(initial, "up");
    expect(turned.queuedDirection).toBe("up");
    expect(turned.status).toBe("running");
  });

  it("paused中はstepしても位置が変わらない", () => {
    const running = setNextDirection(createInitialSnakeState({}, () => 0), "right");
    const moved = stepSnake(running, () => 0);
    const paused = togglePause(moved);

    expect(paused.status).toBe("paused");
    expect(stepSnake(paused)).toEqual(paused);
  });

  it("restartで初期状態に戻る", () => {
    const progressed = stepSnake(
      {
        ...createInitialSnakeState({}, () => 0),
        status: "running",
        score: 22,
        phase: "hybrid",
        food: { x: 11, y: 10 },
      },
      () => 0
    );

    const restarted = restartSnake(progressed, () => 0);
    expect(restarted.status).toBe("ready");
    expect(restarted.score).toBe(0);
    expect(restarted.phase).toBe("skill");
    expect(restarted.revivesUsed).toBe(0);
    expect(restarted.tickMs).toBe(180);
    expect(restarted.snake).toHaveLength(3);
  });
});
