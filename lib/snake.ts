export type Point = {
  x: number;
  y: number;
};

export type Direction = "up" | "down" | "left" | "right";
export type SnakeStatus = "ready" | "running" | "paused" | "game_over";
export type SnakePhase = "skill" | "hybrid" | "luck";
export type LuckEvent = "fortune" | "hazard";

export type SnakeConfig = {
  width: number;
  height: number;
  initialTickMs: number;
  minTickMs: number;
  tickStepMs: number;
};

type SnakeSnapshot = {
  snake: Point[];
  direction: Direction;
  food: Point;
  specialFood: Point | null;
  score: number;
  tickMs: number;
  phase: SnakePhase;
};

export type SnakeState = {
  config: SnakeConfig;
  snake: Point[];
  direction: Direction;
  queuedDirection: Direction | null;
  food: Point;
  specialFood: Point | null;
  score: number;
  status: SnakeStatus;
  tickMs: number;
  phase: SnakePhase;
  lastEvent: LuckEvent | null;
  revivesUsed: number;
  lastSafeState: SnakeSnapshot | null;
};

export type SnakeRandom = () => number;

export const DEFAULT_SNAKE_CONFIG: SnakeConfig = {
  width: 20,
  height: 20,
  initialTickMs: 180,
  minTickMs: 90,
  tickStepMs: 8,
};

const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const DIRECTION_STEP: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function clonePoint(point: Point): Point {
  return { x: point.x, y: point.y };
}

function cloneSnake(points: Point[]): Point[] {
  return points.map(clonePoint);
}

function arePointsEqual(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

function hasPoint(points: Point[], target: Point): boolean {
  return points.some((point) => arePointsEqual(point, target));
}

function normalizeConfig(config: Partial<SnakeConfig> = {}): SnakeConfig {
  return {
    width: Math.max(4, Math.floor(config.width ?? DEFAULT_SNAKE_CONFIG.width)),
    height: Math.max(4, Math.floor(config.height ?? DEFAULT_SNAKE_CONFIG.height)),
    initialTickMs: Math.max(30, Math.floor(config.initialTickMs ?? DEFAULT_SNAKE_CONFIG.initialTickMs)),
    minTickMs: Math.max(20, Math.floor(config.minTickMs ?? DEFAULT_SNAKE_CONFIG.minTickMs)),
    tickStepMs: Math.max(1, Math.floor(config.tickStepMs ?? DEFAULT_SNAKE_CONFIG.tickStepMs)),
  };
}

function buildInitialSnake(config: SnakeConfig): Point[] {
  const headX = Math.max(2, Math.min(config.width - 1, Math.floor(config.width / 2)));
  const headY = Math.max(0, Math.min(config.height - 1, Math.floor(config.height / 2)));
  const maxLength = Math.min(3, headX + 1);

  return Array.from({ length: maxLength }, (_, index) => ({
    x: headX - index,
    y: headY,
  }));
}

function randomIndex(size: number, rng: SnakeRandom): number {
  if (size <= 1) {
    return 0;
  }
  const raw = Math.floor(rng() * size);
  return Math.max(0, Math.min(size - 1, raw));
}

function placeFood(
  config: SnakeConfig,
  snake: Point[],
  rng: SnakeRandom,
  blocked: Point[] = []
): Point | null {
  const freeCells: Point[] = [];

  for (let y = 0; y < config.height; y += 1) {
    for (let x = 0; x < config.width; x += 1) {
      const candidate = { x, y };
      if (!hasPoint(snake, candidate) && !hasPoint(blocked, candidate)) {
        freeCells.push(candidate);
      }
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  return freeCells[randomIndex(freeCells.length, rng)];
}

function movePoint(point: Point, direction: Direction): Point {
  const delta = DIRECTION_STEP[direction];
  return {
    x: point.x + delta.x,
    y: point.y + delta.y,
  };
}

function isOutOfBounds(point: Point, config: SnakeConfig): boolean {
  return point.x < 0 || point.x >= config.width || point.y < 0 || point.y >= config.height;
}

function specialFoodChance(phase: SnakePhase): number {
  if (phase === "skill") {
    return 0;
  }
  if (phase === "hybrid") {
    return 0.18;
  }
  return 0.4;
}

function maybeSpawnSpecialFood(
  phase: SnakePhase,
  config: SnakeConfig,
  snake: Point[],
  food: Point,
  rng: SnakeRandom
): Point | null {
  if (rng() >= specialFoodChance(phase)) {
    return null;
  }
  return placeFood(config, snake, rng, [food]);
}

function rollLuckEvent(phase: SnakePhase, rng: SnakeRandom): LuckEvent {
  const fortuneRate = phase === "luck" ? 0.45 : 0.6;
  return rng() < fortuneRate ? "fortune" : "hazard";
}

function applyLuckEvent(
  event: LuckEvent,
  phase: SnakePhase,
  score: number,
  tickMs: number,
  snake: Point[],
  config: SnakeConfig
): {
  score: number;
  tickMs: number;
  snake: Point[];
} {
  if (event === "fortune") {
    const scoreBonus = phase === "luck" ? 4 : 2;
    const slowdown = phase === "luck" ? 18 : 12;
    return {
      score: score + scoreBonus,
      tickMs: Math.min(config.initialTickMs, tickMs + slowdown),
      snake,
    };
  }

  const speedup = phase === "luck" ? 16 : 10;
  const reducedSnake = [...snake];
  if (reducedSnake.length > 4) {
    reducedSnake.pop();
  }
  return {
    score,
    tickMs: Math.max(config.minTickMs, tickMs - speedup),
    snake: reducedSnake,
  };
}

function createSnapshot(state: SnakeState): SnakeSnapshot {
  return {
    snake: cloneSnake(state.snake),
    direction: state.direction,
    food: clonePoint(state.food),
    specialFood: state.specialFood ? clonePoint(state.specialFood) : null,
    score: state.score,
    tickMs: state.tickMs,
    phase: state.phase,
  };
}

export function getSnakePhase(score: number): SnakePhase {
  if (score >= 50) {
    return "luck";
  }
  if (score >= 20) {
    return "hybrid";
  }
  return "skill";
}

export function createInitialSnakeState(
  config: Partial<SnakeConfig> = DEFAULT_SNAKE_CONFIG,
  rng: SnakeRandom = Math.random
): SnakeState {
  const normalizedConfig = normalizeConfig(config);
  const snake = buildInitialSnake(normalizedConfig);
  const food = placeFood(normalizedConfig, snake, rng) ?? snake[0];

  return {
    config: normalizedConfig,
    snake,
    direction: "right",
    queuedDirection: null,
    food,
    specialFood: null,
    score: 0,
    status: "ready",
    tickMs: normalizedConfig.initialTickMs,
    phase: getSnakePhase(0),
    lastEvent: null,
    revivesUsed: 0,
    lastSafeState: null,
  };
}

export function setNextDirection(state: SnakeState, direction: Direction): SnakeState {
  if (state.status === "game_over") {
    return state;
  }

  if (state.queuedDirection) {
    return state;
  }

  if (OPPOSITE_DIRECTION[state.direction] === direction) {
    return state;
  }

  if (direction === state.direction) {
    if (state.status === "ready") {
      return { ...state, status: "running", lastEvent: null };
    }
    return state;
  }

  return {
    ...state,
    queuedDirection: direction,
    status: state.status === "ready" ? "running" : state.status,
    lastEvent: null,
  };
}

export function stepSnake(state: SnakeState, rng: SnakeRandom = Math.random): SnakeState {
  if (state.status !== "running") {
    return state;
  }

  const safeSnapshot = createSnapshot(state);
  const activeDirection = state.queuedDirection ?? state.direction;
  const nextHead = movePoint(state.snake[0], activeDirection);

  if (isOutOfBounds(nextHead, state.config)) {
    return {
      ...state,
      direction: activeDirection,
      queuedDirection: null,
      status: "game_over",
      lastEvent: null,
      lastSafeState: safeSnapshot,
    };
  }

  const willEatRegularFood = arePointsEqual(nextHead, state.food);
  const willEatSpecialFood = Boolean(state.specialFood && arePointsEqual(nextHead, state.specialFood));
  const collisionTargets = willEatRegularFood ? state.snake : state.snake.slice(0, -1);

  if (hasPoint(collisionTargets, nextHead)) {
    return {
      ...state,
      direction: activeDirection,
      queuedDirection: null,
      status: "game_over",
      lastEvent: null,
      lastSafeState: safeSnapshot,
    };
  }

  let nextSnake = [nextHead, ...state.snake];
  if (!willEatRegularFood) {
    nextSnake.pop();
  }

  let nextScore = state.score;
  let nextTickMs = state.tickMs;
  let nextFood = state.food;
  let nextSpecialFood = state.specialFood;
  let nextLastEvent: LuckEvent | null = null;

  if (willEatRegularFood) {
    nextScore += 1;
    nextTickMs = Math.max(state.config.minTickMs, state.tickMs - state.config.tickStepMs);

    const spawnedFood = placeFood(state.config, nextSnake, rng);
    if (!spawnedFood) {
      return {
        ...state,
        snake: nextSnake,
        direction: activeDirection,
        queuedDirection: null,
        score: nextScore,
        tickMs: nextTickMs,
        phase: getSnakePhase(nextScore),
        status: "game_over",
        food: nextHead,
        specialFood: null,
        lastEvent: null,
        lastSafeState: safeSnapshot,
      };
    }
    nextFood = spawnedFood;
  }

  let nextPhase = getSnakePhase(nextScore);

  if (willEatSpecialFood && state.specialFood) {
    const luckEvent = rollLuckEvent(nextPhase, rng);
    const eventApplied = applyLuckEvent(luckEvent, nextPhase, nextScore, nextTickMs, nextSnake, state.config);
    nextSnake = eventApplied.snake;
    nextScore = eventApplied.score;
    nextTickMs = eventApplied.tickMs;
    nextLastEvent = luckEvent;
    nextSpecialFood = null;
    nextPhase = getSnakePhase(nextScore);
  }

  if (!nextSpecialFood && (willEatRegularFood || willEatSpecialFood)) {
    nextSpecialFood = maybeSpawnSpecialFood(nextPhase, state.config, nextSnake, nextFood, rng);
  }

  return {
    ...state,
    snake: nextSnake,
    direction: activeDirection,
    queuedDirection: null,
    food: nextFood,
    specialFood: nextSpecialFood,
    score: nextScore,
    tickMs: nextTickMs,
    phase: nextPhase,
    lastEvent: nextLastEvent,
    lastSafeState: safeSnapshot,
  };
}

export function canReviveSnake(state: SnakeState): boolean {
  return state.status === "game_over" && state.revivesUsed < 1 && Boolean(state.lastSafeState);
}

export function reviveSnake(state: SnakeState): SnakeState {
  if (!canReviveSnake(state) || !state.lastSafeState) {
    return state;
  }

  const snapshot = state.lastSafeState;
  const revivedSnake = cloneSnake(snapshot.snake);
  while (revivedSnake.length > 3 && revivedSnake.length > Math.floor(snapshot.snake.length * 0.7)) {
    revivedSnake.pop();
  }

  const penalizedScore = Math.max(0, snapshot.score - 5);
  const penalizedTick = Math.max(state.config.minTickMs, snapshot.tickMs - 10);
  const revivedSpecialFood =
    snapshot.specialFood && !hasPoint(revivedSnake, snapshot.specialFood)
      ? clonePoint(snapshot.specialFood)
      : null;

  return {
    ...state,
    snake: revivedSnake,
    direction: snapshot.direction,
    queuedDirection: null,
    food: clonePoint(snapshot.food),
    specialFood: revivedSpecialFood,
    score: penalizedScore,
    tickMs: penalizedTick,
    phase: getSnakePhase(penalizedScore),
    status: "paused",
    lastEvent: null,
    revivesUsed: state.revivesUsed + 1,
    lastSafeState: null,
  };
}

export function togglePause(state: SnakeState): SnakeState {
  if (state.status === "running") {
    return { ...state, status: "paused", lastEvent: null };
  }

  if (state.status === "paused" || state.status === "ready") {
    return { ...state, status: "running", lastEvent: null };
  }

  return state;
}

export function restartSnake(state: SnakeState, rng: SnakeRandom = Math.random): SnakeState {
  return createInitialSnakeState(state.config, rng);
}
