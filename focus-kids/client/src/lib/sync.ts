import { api } from './api';
import { getParentAuth, getChildState, saveChildState, getProfile, saveProfiles, listProfiles } from './storage';
import type { ChildState } from '../types';

const KEY_SYNCED = (id: string) => `fk.synced.${id}.v1`;

function syncedIds(id: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY_SYNCED(id)) || '[]') as string[];
  } catch {
    return [];
  }
}

function markSynced(id: string, ids: string[]) {
  const merged = Array.from(new Set([...syncedIds(id), ...ids]));
  localStorage.setItem(KEY_SYNCED(id), JSON.stringify(merged));
}

/** Push unsynced sessions of a child to the server (if a parent is linked). */
export async function syncChild(state: ChildState): Promise<boolean> {
  const auth = getParentAuth();
  const serverId = state.profile.serverId;
  if (!auth?.token) return false;

  try {
    // Ensure the child profile exists on the server.
    let sid = serverId;
    if (!sid) {
      const created = await api.createChild({
        name: state.profile.name,
        age: state.profile.age,
        avatar_id: state.profile.avatarId,
      });
      sid = created.id;
      const profile = { ...state.profile, serverId: sid };
      state = { ...state, profile };
      saveChildState(state);
      const profiles = listProfiles().map((p) =>
        p.id === profile.id ? profile : p,
      );
      saveProfiles(profiles);
    }

    const unsynced = state.sessions.filter(
      (s) => !syncedIds(state.profile.id).includes(s.clientSessionId),
    );
    if (unsynced.length === 0) return true;

    await api.sync(sid, {
      sessions: unsynced.map((s) => ({
        client_session_id: s.clientSessionId,
        game_type: s.gameType,
        level: s.level,
        stars: s.stars,
        score: s.score,
        accuracy: s.accuracy,
        consistency: s.consistency,
        speed: s.speed,
        completion: s.completion,
        duration_ms: s.durationMs,
        is_daily: s.isDaily,
        played_at: s.playedAt,
      })),
      achievements: state.achievements,
      rewards: state.rewards,
      streak: state.streak,
    });
    markSynced(state.profile.id, unsynced.map((s) => s.clientSessionId));
    return true;
  } catch (e) {
    console.warn('Sync gagal (offline?), coba lagi nanti:', (e as Error).message);
    return false;
  }
}

export async function syncAllProfiles(): Promise<void> {
  const auth = getParentAuth();
  if (!auth?.token) return;
  for (const profile of listProfiles()) {
    try {
      await syncChild(getChildState(profile.id));
    } catch {
      /* keep going */
    }
  }
}
