import type { GameLevelConfig, GameType } from '../types';
import { makeRng, tierForLevel, MAX_LEVEL, shuffle } from './tiers';

export interface MemoryMatchParams {
  pairs: number;
  cols: number;
  rows: number;
}

export interface HiddenObjectParams {
  objectCount: number;
  distractorCount: number;
  complexity: number;
}

export interface FindDifferenceParams {
  differences: number;
}

export interface SimonMemoryParams {
  sequenceLength: number;
  speedMs: number;
}

export interface TapTargetParams {
  objectCount: number;
  distractorCount: number;
  moveSpeed: number;
  lifetimeMs: number;
}

export interface CountingParams {
  objectCount: number;
}

export type GameParams =
  | MemoryMatchParams
  | HiddenObjectParams
  | FindDifferenceParams
  | SimonMemoryParams
  | TapTargetParams
  | CountingParams;

export const GAME_COUNT = 1000;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Difficulty factor 0..1 across the whole 1..1000 ladder. */
function difficulty(level: number) {
  return (level - 1) / (MAX_LEVEL - 1);
}

function gridForPairs(pairs: number): { cols: number; rows: number } {
  const area = pairs * 2;
  let best = { cols: 4, rows: 4 };
  for (let rows = 2; rows <= 6; rows++) {
    const cols = Math.ceil(area / rows);
    if (cols <= 8 && cols >= rows && cols * rows >= area && cols * rows < best.cols * best.rows) {
      best = { cols, rows };
    }
  }
  return best;
}

export function generateLevelConfig(
  game: GameType,
  level: number,
): GameLevelConfig {
  const tier = tierForLevel(level);
  const rng = makeRng(game, level);
  const d = difficulty(level);

  switch (game) {
    case 'memory_match': {
      const pairs = clamp(2 + Math.floor(level / 3), 2, 14);
      const { cols, rows } = gridForPairs(pairs);
      const timeLimit = Math.round(pairs * 9 * (1 - d * 0.35) + 8);
      return {
        level,
        tier,
        params: { pairs, cols, rows } as MemoryMatchParams,
        timeLimit,
        parTimeMs: timeLimit * 1000,
        starsGuide: { three: 90, two: 70, one: 50 },
      };
    }
    case 'hidden_object': {
      const objectCount = clamp(3 + Math.floor(level / 4), 3, 12);
      const distractorCount = clamp(6 + Math.floor(level / 2), 6, 60);
      const complexity = tier.from <= 20 ? 1 : tier.from <= 50 ? 2 : tier.from <= 100 ? 3 : 4;
      const timeLimit = Math.round(objectCount * 25 * (1 - d * 0.25) + 15);
      return {
        level,
        tier,
        params: { objectCount, distractorCount, complexity } as HiddenObjectParams,
        timeLimit,
        parTimeMs: timeLimit * 1000,
        starsGuide: { three: 90, two: 70, one: 50 },
      };
    }
    case 'find_difference': {
      const differences = clamp(2 + Math.floor(level / 5), 2, 10);
      const timeLimit = Math.round(differences * 22 * (1 - d * 0.3) + 15);
      return {
        level,
        tier,
        params: { differences } as FindDifferenceParams,
        timeLimit,
        parTimeMs: timeLimit * 1000,
        starsGuide: { three: 90, two: 70, one: 50 },
      };
    }
    case 'simon_memory': {
      const sequenceLength = clamp(3 + Math.floor(level / 3), 3, 12);
      const speedMs = clamp(1200 - Math.floor(level * 5), 420, 1200);
      const timeLimit = Math.round((sequenceLength * speedMs * 3) / 1000) + 15;
      return {
        level,
        tier,
        params: { sequenceLength, speedMs } as SimonMemoryParams,
        timeLimit,
        parTimeMs: timeLimit * 1000,
        starsGuide: { three: 90, two: 70, one: 50 },
      };
    }
    case 'tap_target': {
      const objectCount = clamp(2 + Math.floor(level / 3), 2, 8);
      const distractorCount = clamp(1 + Math.floor(level / 4), 1, 8);
      const moveSpeed = clamp(40 + level * 6, 40, 380);
      const lifetimeMs = clamp(2600 - level * 8, 900, 2600);
      const timeLimit = Math.round(objectCount * 12 * (1 - d * 0.25) + 10);
      return {
        level,
        tier,
        params: { objectCount, distractorCount, moveSpeed, lifetimeMs } as TapTargetParams,
        timeLimit,
        parTimeMs: timeLimit * 1000,
        starsGuide: { three: 90, two: 70, one: 50 },
      };
    }
    case 'counting': {
      const objectCount = clamp(3 + Math.floor(level / 3), 3, 20);
      const timeLimit = Math.round(objectCount * 5 * (1 - d * 0.2) + 8);
      return {
        level,
        tier,
        params: { objectCount } as CountingParams,
        timeLimit,
        parTimeMs: timeLimit * 1000,
        starsGuide: { three: 90, two: 70, one: 50 },
      };
    }
  }
}

export function randomLevel(game: GameType, maxLevel = GAME_COUNT): number {
  const rng = makeRng(game, 999_999);
  return 1 + Math.floor(rng() * maxLevel);
}

export function pickSymbols(
  pool: string[],
  count: number,
  rng: () => number,
  banned: string[] = [],
): string[] {
  const avail = pool.filter((s) => !banned.includes(s));
  const out: string[] = [];
  const bag = shuffle(avail, rng);
  while (out.length < count && bag.length > 0) {
    const s = bag.pop()!;
    out.push(s);
    if (out.length % 2 === 0 && out.length < count * 2 - 0) {
      out.push(s);
    }
  }
  return out;
}
