import type { ChildState, RewardDef } from '../types';

export const REWARDS: RewardDef[] = [
  { code: 'avatar_rocket', type: 'avatar', name: 'Rocket Racer', description: 'Avatar baru: roket keren', icon: '🚀' },
  { code: 'avatar_dino', type: 'avatar', name: 'Dino Friend', description: 'Avatar baru: teman dinosaurus', icon: '🦖' },
  { code: 'avatar_robot', type: 'avatar', name: 'Robo Buddy', description: 'Avatar baru: robot sahabat', icon: '🤖' },
  { code: 'avatar_cat', type: 'avatar', name: 'Cute Cat', description: 'Avatar baru: kucing lucu', icon: '🐱' },
  { code: 'bg_space', type: 'background', name: 'Dunia Luar Angkasa', description: 'Background baru: galaksi', icon: '🌌' },
  { code: 'bg_underwater', type: 'background', name: 'Dunia Bawah Laut', description: 'Background baru: laut biru', icon: '🌊' },
  { code: 'bg_fantasy', type: 'background', name: 'Dunia Fantasi', description: 'Background baru: negeri dongeng', icon: '🏰' },
  { code: 'world_farm', type: 'world', name: 'Dunia Peternakan', description: 'Dunia baru: peternakan ceria', icon: '🐄' },
  { code: 'world_factory', type: 'world', name: 'Dunia Robot', description: 'Dunia baru: pabrik robot', icon: '🏭' },
];

const defByCode = new Map(REWARDS.map((r) => [r.code, r]));
export const AVATAR_POOL = REWARDS.filter((r) => r.type === 'avatar');
export const BACKGROUND_POOL = REWARDS.filter((r) => r.type === 'background');
export const WORLD_POOL = REWARDS.filter((r) => r.type === 'world');

export function getRewardDef(code: string): RewardDef | undefined {
  return defByCode.get(code);
}

export interface Milestone {
  stars: number;
  reward?: string;
  box?: boolean;
}

/** Reward milestones based on total stars collected. */
export const STAR_MILESTONES: Milestone[] = [
  { stars: 25, box: true },
  { stars: 50, reward: 'avatar_rocket' },
  { stars: 100, box: true },
  { stars: 120, reward: 'bg_space' },
  { stars: 200, reward: 'avatar_dino' },
  { stars: 250, box: true },
  { stars: 350, reward: 'bg_underwater' },
  { stars: 500, reward: 'world_farm' },
  { stars: 600, box: true },
  { stars: 800, reward: 'avatar_robot' },
  { stars: 1000, box: true },
  { stars: 1200, reward: 'bg_fantasy' },
  { stars: 2000, reward: 'avatar_cat' },
  { stars: 3000, reward: 'world_factory' },
];

export function milestonesReached(totalStars: number): Milestone[] {
  return STAR_MILESTONES.filter((m) => totalStars >= m.stars);
}

/** Open a mystery box: returns a random unredeemed avatar/background/world reward. */
export function openMysteryBox(state: ChildState): RewardDef {
  const owned = new Set(state.rewards);
  const pool = [...AVATAR_POOL, ...BACKGROUND_POOL, ...WORLD_POOL].filter(
    (r) => !owned.has(r.code),
  );
  if (pool.length === 0) {
    return { code: 'mystery_box_1', type: 'mystery_box', name: 'Mystery Box', description: 'Kotak misteri', icon: '🎁' };
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
