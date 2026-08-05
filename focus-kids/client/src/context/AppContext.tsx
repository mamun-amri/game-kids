import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  ChildProfile,
  ChildState,
  FocusMetrics,
  GameResult,
  GameType,
} from '../types';
import {
  emptyChildState,
  genId,
  getChildState,
  getLastActiveChild,
  getParentAuth,
  listProfiles,
  saveChildState,
  saveParentAuth,
  clearParentAuth,
  saveProfiles,
  setLastActiveChild,
  type ParentAuth,
} from '../lib/storage';
import { computeFocusScore } from '../lib/focusScore';
import { generateLevelConfig } from '../lib/levelGen';
import { checkAchievements } from '../lib/achievements';
import { milestonesReached } from '../lib/rewards';
import { todayKey, yesterdayKey, dailyChallengeFor } from '../lib/date';
import { syncChild } from '../lib/sync';

export interface SessionOutcome {
  metrics: FocusMetrics;
  sessionId: string;
  newlyUnlockedAchievements: string[];
  newRewards: string[];
  mysteryBoxesEarned: number;
  dailyDone: boolean;
}

interface AppContextValue {
  profiles: ChildProfile[];
  currentChildId: string | null;
  currentChild: ChildState | null;
  parentAuth: ParentAuth | null;
  selectChild: (id: string) => void;
  createProfile: (p: {
    name: string;
    age: number;
    avatarId: string;
  }) => ChildProfile;
  deleteProfile: (id: string) => void;
  updateProfile: (p: Partial<ChildProfile>) => void;
  setAuth: (auth: ParentAuth | null) => void;
  recordSession: (
    result: GameResult,
  ) => SessionOutcome;
  openMysteryBox: () => { reward: { code: string; icon: string; name: string } | null };
  refresh: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<ChildProfile[]>(() => listProfiles());
  const [currentChildId, setCurrentChildId] = useState<string | null>(() => {
    const last = getLastActiveChild();
    const list = listProfiles();
    if (last && list.some((p) => p.id === last)) return last;
    return list[0]?.id ?? null;
  });
  const [parentAuth, setParentAuth] = useState<ParentAuth | null>(() =>
    getParentAuth(),
  );
  const [version, setVersion] = useState(0);

  const currentChild = useMemo<ChildState | null>(() => {
    if (!currentChildId) return null;
    try {
      return getChildState(currentChildId);
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChildId, version, profiles]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const selectChild = useCallback((id: string) => {
    setCurrentChildId(id);
    setLastActiveChild(id);
    refresh();
  }, [refresh]);

  const createProfile = useCallback(
    (p: { name: string; age: number; avatarId: string }): ChildProfile => {
      const ageGroup = p.age <= 5 ? '3-5' : p.age <= 8 ? '6-8' : '9-12';
      const profile: ChildProfile = {
        id: genId(),
        name: p.name.trim(),
        age: p.age,
        ageGroup,
        avatarId: p.avatarId,
        backgroundId: 'bg_default',
        createdAt: new Date().toISOString(),
      };
      const next = [...listProfiles(), profile];
      saveProfiles(next);
      saveChildState(emptyChildState(profile));
      setProfiles(next);
      setCurrentChildId(profile.id);
      setLastActiveChild(profile.id);
      return profile;
    },
    [],
  );

  const deleteProfile = useCallback(
    (id: string) => {
      const next = listProfiles().filter((p) => p.id !== id);
      saveProfiles(next);
      localStorage.removeItem(`fk.child.${id}.v1`);
      setProfiles(next);
      if (currentChildId === id) {
        const fallback = next[0]?.id ?? null;
        setCurrentChildId(fallback);
        if (fallback) setLastActiveChild(fallback);
      }
    },
    [currentChildId],
  );

  const updateProfile = useCallback(
    (p: Partial<ChildProfile>) => {
      if (!currentChildId) return;
      const profiles = listProfiles();
      const next = profiles.map((x) =>
        x.id === currentChildId ? { ...x, ...p } : x,
      );
      saveProfiles(next);
      const state = getChildState(currentChildId);
      state.profile = { ...state.profile, ...p };
      saveChildState(state);
      setProfiles(next);
      refresh();
    },
    [currentChildId, refresh],
  );

  const setAuth = useCallback((auth: ParentAuth | null) => {
    setParentAuth(auth);
    if (auth) saveParentAuth(auth);
    else clearParentAuth();
  }, []);

  const recordSession = useCallback(
    (result: GameResult): SessionOutcome => {
      if (!currentChildId) {
        throw new Error('Tidak ada profil aktif');
      }
      const config = generateLevelConfig(result.gameType, result.level);
      const metrics = computeFocusScore(result, config);
      const state = getChildState(currentChildId);
      const now = new Date().toISOString();
      const sessionId = genId();
      const today = todayKey();

      // Streak
      let { current: streakCurrent, best: streakBest } = state.streak;
      if (state.streak.lastDate === today) {
        // same day, no change
      } else if (state.streak.lastDate === yesterdayKey()) {
        streakCurrent += 1;
      } else {
        streakCurrent = 1;
      }
      streakBest = Math.max(streakBest, streakCurrent);

      // Daily challenge
      let dailyDone = false;
      const dailyChallenges = { ...state.dailyChallenges };
      if (result.isDaily) {
        dailyDone = true;
        dailyChallenges[today] = {
          date: today,
          gameType: result.gameType,
          level: result.level,
          done: true,
        };
      }

      const session = {
        clientSessionId: sessionId,
        gameType: result.gameType,
        level: result.level,
        stars: metrics.stars,
        score: metrics.score,
        accuracy: metrics.accuracy,
        consistency: metrics.consistency,
        speed: metrics.speed,
        completion: metrics.completion,
        durationMs: result.timeMs,
        isDaily: result.isDaily,
        playedAt: now,
        correct: result.correct,
        wrong: result.wrong,
      };
      state.sessions = [...state.sessions, session];
      state.streak = { current: streakCurrent, best: streakBest, lastDate: today };
      state.dailyChallenges = dailyChallenges;

      // Achievements
      const check = checkAchievements(state);
      const newlyUnlockedAchievements = check.newlyUnlocked;
      state.achievements = check.matched;

      // Star milestone rewards
      const totalStars = state.sessions.reduce((a, s) => a + s.stars, 0);
      const milestones = milestonesReached(totalStars);
      let mysteryBoxesEarned = 0;
      const newRewards: string[] = [];
      for (const m of milestones) {
        const key = m.reward ? `r:${m.reward}` : `box:${m.stars}`;
        if (state.awardedMilestones.includes(key)) continue;
        state.awardedMilestones = [...state.awardedMilestones, key];
        if (m.box) {
          state.mysteryBoxes += 1;
          mysteryBoxesEarned += 1;
        } else if (m.reward && !state.rewards.includes(m.reward)) {
          state.rewards = [...state.rewards, m.reward];
          newRewards.push(m.reward);
        }
      }

      // Daily challenge bonus: +1 mystery box once per day
      if (dailyDone && !state.awardedMilestones.includes(`daily:${today}`)) {
        state.awardedMilestones = [...state.awardedMilestones, `daily:${today}`];
        state.mysteryBoxes += 1;
        mysteryBoxesEarned += 1;
      }

      saveChildState(state);
      refresh();
      void syncChild(getChildState(currentChildId));

      return {
        metrics,
        sessionId,
        newlyUnlockedAchievements,
        newRewards,
        mysteryBoxesEarned,
        dailyDone,
      };
    },
    [currentChildId, refresh],
  );

  const openMysteryBox = useCallback(() => {
    if (!currentChildId) return { reward: null };
    const state = getChildState(currentChildId);
    if (state.mysteryBoxes <= 0) return { reward: null };
    const pool = [
      { code: 'avatar_rocket', icon: '🚀', name: 'Rocket Racer' },
      { code: 'avatar_dino', icon: '🦖', name: 'Dino Friend' },
      { code: 'avatar_robot', icon: '🤖', name: 'Robo Buddy' },
      { code: 'avatar_cat', icon: '🐱', name: 'Cute Cat' },
      { code: 'bg_space', icon: '🌌', name: 'Dunia Luar Angkasa' },
      { code: 'bg_underwater', icon: '🌊', name: 'Dunia Bawah Laut' },
      { code: 'bg_fantasy', icon: '🏰', name: 'Dunia Fantasi' },
      { code: 'world_farm', icon: '🐄', name: 'Dunia Peternakan' },
      { code: 'world_factory', icon: '🏭', name: 'Dunia Robot' },
    ].filter((r) => !state.rewards.includes(r.code));
    const reward =
      pool.length > 0
        ? pool[Math.floor(Math.random() * pool.length)]
        : { code: 'mystery_box_1', icon: '🎁', name: 'Mystery Box' };
    state.mysteryBoxes -= 1;
    if (reward.code !== 'mystery_box_1') {
      state.rewards = [...state.rewards, reward.code];
    }
    saveChildState(state);
    refresh();
    void syncChild(getChildState(currentChildId));
    return { reward };
  }, [currentChildId, refresh]);

  const value = useMemo<AppContextValue>(
    () => ({
      profiles,
      currentChildId,
      currentChild,
      parentAuth,
      selectChild,
      createProfile,
      deleteProfile,
      updateProfile,
      setAuth,
      recordSession,
      openMysteryBox,
      refresh,
    }),
    [
      profiles,
      currentChildId,
      currentChild,
      parentAuth,
      selectChild,
      createProfile,
      deleteProfile,
      updateProfile,
      setAuth,
      recordSession,
      openMysteryBox,
      refresh,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp harus dipakai di dalam AppProvider');
  return ctx;
}

export type { GameType };
