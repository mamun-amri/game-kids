import type { ChildState, GameType } from '../types';

export interface ChildStats {
  totalStars: number;
  totalSessions: number;
  playTimeMs: number;
  avgAccuracy: number;
  avgScore: number;
  totalBadges: number;
  distinctLevels: number;
  lastGame: string;
  dailyDone: number;
}

export function computeStats(state: ChildState): ChildStats {
  const s = state.sessions;
  const totalStars = s.reduce((a, x) => a + x.stars, 0);
  const playTimeMs = s.reduce((a, x) => a + x.durationMs, 0);
  const avgAccuracy =
    s.length === 0 ? 0 : Math.round(s.reduce((a, x) => a + x.accuracy, 0) / s.length);
  const avgScore =
    s.length === 0 ? 0 : Math.round(s.reduce((a, x) => a + x.score, 0) / s.length);
  const lastSession = s[s.length - 1];
  return {
    totalStars,
    totalSessions: s.length,
    playTimeMs,
    avgAccuracy,
    avgScore,
    totalBadges: state.achievements.length,
    distinctLevels: new Set(s.map((x) => `${x.gameType}:${x.level}`)).size,
    lastGame: lastSession ? lastSession.gameType : '',
    dailyDone: s.filter((x) => x.isDaily).length,
  };
}

export interface LevelBest {
  stars: number;
  score: number;
  completed: boolean;
}

export function bestByLevel(state: ChildState, game: GameType): Map<number, LevelBest> {
  const map = new Map<number, LevelBest>();
  for (const s of state.sessions) {
    if (s.gameType !== game) continue;
    const cur = map.get(s.level);
    if (!cur || s.score > cur.score) {
      map.set(s.level, { stars: s.stars, score: s.score, completed: true });
    }
  }
  return map;
}

export function highestUnlockedLevel(state: ChildState, game: GameType): number {
  let max = 0;
  for (const s of state.sessions) {
    if (s.gameType === game && s.level > max) max = s.level;
  }
  return max;
}

export function formatPlayTime(ms: number): string {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  if (min >= 60) {
    const h = Math.floor(min / 60);
    return `${h}j ${min % 60}m`;
  }
  if (min > 0) return `${min}m ${sec}s`;
  return `${sec}s`;
}

export function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
