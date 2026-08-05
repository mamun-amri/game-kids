import type { AchievementDef, ChildState, RewardDef } from '../types';

export const ACHIEVEMENTS: AchievementDef[] = [
  { code: 'first_win', name: 'First Win', description: 'Selesaikan level pertamamu', icon: '🌟' },
  { code: 'level_10', name: '10 Level Completed', description: 'Selesaikan 10 level', icon: '🪜' },
  { code: 'level_100', name: '100 Level Completed', description: 'Selesaikan 100 level', icon: '🎯' },
  { code: 'stars_100', name: '100 Stars', description: 'Kumpulkan 100 bintang', icon: '⭐' },
  { code: 'stars_500', name: '500 Stars', description: 'Kumpulkan 500 bintang', icon: '💫' },
  { code: 'perfect_accuracy', name: 'Perfect Accuracy', description: 'Akurasi 100% dalam satu permainan', icon: '💯' },
  { code: 'no_mistake', name: 'No Mistake', description: 'Selesaikan tanpa kesalahan', icon: '🧠' },
  { code: 'fast_thinker', name: 'Fast Thinker', description: 'Selesaikan level dengan kecepatan luar biasa', icon: '⚡' },
  { code: 'memory_master', name: 'Memory Master', description: 'Menangkan 10 permainan Memory Match', icon: '🃏' },
  { code: 'hidden_object_hunter', name: 'Hidden Object Hunter', description: 'Temukan 50 objek tersembunyi', icon: '🔍' },
  { code: 'focus_champion', name: 'Focus Champion', description: 'Mencapai Focus Score 90+ sebanyak 25 kali', icon: '🏆' },
  { code: 'streak_7', name: '7-Day Streak', description: 'Bermain 7 hari berturut-turut', icon: '🔥' },
  { code: 'daily_10', name: 'Daily Champion', description: 'Selesaikan 10 Daily Challenge', icon: '📅' },
];

const defByCode = new Map(ACHIEVEMENTS.map((a) => [a.code, a]));

export function getAchievementDef(code: string): AchievementDef | undefined {
  return defByCode.get(code);
}

function distinctLevels(state: ChildState): Set<string> {
  return new Set(state.sessions.map((s) => `${s.gameType}:${s.level}`));
}

function totalStars(state: ChildState): number {
  return state.sessions.reduce((a, s) => a + s.stars, 0);
}

export interface AchievementCheck {
  matched: string[];
  newlyUnlocked: string[];
  unlocked: string[];
}

export function checkAchievements(state: ChildState): AchievementCheck {
  const matched: string[] = [];
  const stars = totalStars(state);
  const levels = distinctLevels(state).size;
  const dailyCount = state.sessions.filter((s) => s.isDaily).length;
  const highScores = state.sessions.filter((s) => s.score >= 90).length;
  const hiddenCorrect = state.sessions
    .filter((s) => s.gameType === 'hidden_object')
    .reduce((a, s) => a + s.correct, 0);

  const rules: Record<string, boolean> = {
    first_win: state.sessions.length >= 1,
    level_10: levels >= 10,
    level_100: levels >= 100,
    stars_100: stars >= 100,
    stars_500: stars >= 500,
    perfect_accuracy: state.sessions.some((s) => s.accuracy === 100 && s.correct > 0),
    no_mistake: state.sessions.some((s) => s.wrong === 0 && s.correct > 0),
    fast_thinker: state.sessions.some((s) => s.speed >= 95),
    memory_master: state.sessions.filter((s) => s.gameType === 'memory_match').length >= 10,
    hidden_object_hunter: hiddenCorrect >= 50,
    focus_champion: highScores >= 25,
    streak_7: state.streak.best >= 7,
    daily_10: dailyCount >= 10,
  };

  for (const code of Object.keys(rules)) {
    if (rules[code]) matched.push(code);
  }

  const newlyUnlocked = matched.filter((c) => !state.achievements.includes(c));
  return {
    matched,
    newlyUnlocked,
    unlocked: state.achievements,
  };
}
