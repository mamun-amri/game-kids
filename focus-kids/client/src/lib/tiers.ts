import type { TierInfo, GameType } from '../types';

export const TIERS: TierInfo[] = [
  { name: 'Beginner', from: 1, to: 20, icon: '🌱', color: '#22C55E' },
  { name: 'Easy', from: 21, to: 50, icon: '🍀', color: '#10B981' },
  { name: 'Medium', from: 51, to: 100, icon: '⭐', color: '#F59E0B' },
  { name: 'Hard', from: 101, to: 200, icon: '🔥', color: '#F97316' },
  { name: 'Expert', from: 201, to: 500, icon: '🚀', color: '#8B5CF6' },
  { name: 'Genius', from: 501, to: 1000, icon: '🧠', color: '#EC4899' },
];

export const MAX_LEVEL = 1000;

export function tierForLevel(level: number): TierInfo {
  for (const t of TIERS) {
    if (level >= t.from && level <= t.to) return t;
  }
  return TIERS[TIERS.length - 1];
}

/** A deterministic pseudo random generator seeded by (game, level). */
export function makeRng(game: GameType, level: number): () => number {
  const seedStr = `${game}:${level}`;
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return function () {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}
