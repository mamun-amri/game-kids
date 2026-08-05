export type GameType =
  | 'memory_match'
  | 'hidden_object'
  | 'find_difference'
  | 'simon_memory'
  | 'tap_target'
  | 'counting';

export type TierName =
  | 'Beginner'
  | 'Easy'
  | 'Medium'
  | 'Hard'
  | 'Expert'
  | 'Genius';

export interface TierInfo {
  name: TierName;
  from: number;
  to: number;
  icon: string;
  color: string;
}

export interface ChildProfile {
  id: string;
  serverId?: number;
  name: string;
  age: number;
  ageGroup: string;
  avatarId: string;
  backgroundId: string;
  createdAt: string;
}

export interface SessionRecord {
  clientSessionId: string;
  gameType: GameType;
  level: number;
  stars: number;
  score: number;
  accuracy: number;
  consistency: number;
  speed: number;
  completion: number;
  durationMs: number;
  isDaily: boolean;
  playedAt: string;
  correct: number;
  wrong: number;
}

export interface StreakState {
  current: number;
  best: number;
  lastDate: string;
}

export interface DailyChallengeState {
  date: string;
  gameType: GameType;
  level: number;
  done: boolean;
}

export interface ChildState {
  profile: ChildProfile;
  sessions: SessionRecord[];
  achievements: string[];
  rewards: string[];
  mysteryBoxes: number;
  awardedMilestones: string[];
  streak: StreakState;
  dailyChallenges: Record<string, DailyChallengeState>;
}

export interface AchievementDef {
  code: string;
  name: string;
  description: string;
  icon: string;
}

export interface RewardDef {
  code: string;
  type: 'avatar' | 'background' | 'world' | 'mystery_box';
  name: string;
  description: string;
  icon: string;
}

export interface FocusMetrics {
  accuracy: number;
  consistency: number;
  speed: number;
  completion: number;
  score: number;
  stars: number;
}

export interface GameResult {
  gameType: GameType;
  level: number;
  correct: number;
  wrong: number;
  timeMs: number;
  parTimeMs: number;
  completionPct: number;
  subtaskOk: boolean[];
  isDaily: boolean;
  quitEarly?: boolean;
}

export interface GameLevelConfig {
  level: number;
  tier: TierInfo;
  /** seconds allowed to complete (par). 0 = no strict timer */
  timeLimit: number;
  parTimeMs: number;
  starsGuide: { three: number; two: number; one: number };
  [key: string]: unknown;
}

export interface ServerChild {
  id: number;
  parent_id: number;
  name: string;
  age: number;
  age_group: string;
  avatar_id: string;
  created_at: string;
  session_count?: number;
}
