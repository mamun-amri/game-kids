import type { ChildProfile, ChildState, SessionRecord } from '../types';

const KEY_PROFILES = 'fk.profiles.v1';
const KEY_PARENT = 'fk.parent.v1';
const KEY_LAST = 'fk.lastActive.v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function genId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

// ---------- Profiles ----------
export function listProfiles(): ChildProfile[] {
  return read<ChildProfile[]>(KEY_PROFILES, []);
}

export function saveProfiles(profiles: ChildProfile[]) {
  write(KEY_PROFILES, profiles);
}

export function getProfile(id: string): ChildProfile | undefined {
  return listProfiles().find((p) => p.id === id);
}

// ---------- Child state ----------
function childKey(id: string) {
  return `fk.child.${id}.v1`;
}

export function emptyChildState(profile: ChildProfile): ChildState {
  return {
    profile,
    sessions: [],
    achievements: [],
    rewards: [],
    mysteryBoxes: 0,
    awardedMilestones: [],
    streak: { current: 0, best: 0, lastDate: '' },
    dailyChallenges: {},
  };
}

export function getChildState(id: string): ChildState {
  const state = read<ChildState | null>(childKey(id), null);
  if (state) return state;
  const profile = getProfile(id);
  if (profile) return emptyChildState(profile);
  throw new Error('Profil tidak ditemukan');
}

export function saveChildState(state: ChildState) {
  write(childKey(state.profile.id), state);
}

export function deleteChildState(id: string) {
  localStorage.removeItem(childKey(id));
}

// ---------- Parent auth ----------
export interface ParentAuth {
  token: string;
  user: { id: number; email: string; name: string };
  linked: number[];
}

export function getParentAuth(): ParentAuth | null {
  return read<ParentAuth | null>(KEY_PARENT, null);
}

export function saveParentAuth(auth: ParentAuth) {
  write(KEY_PARENT, auth);
}

export function clearParentAuth() {
  localStorage.removeItem(KEY_PARENT);
}

// ---------- Last active child ----------
export function getLastActiveChild(): string | null {
  return read<string | null>(KEY_LAST, null);
}

export function setLastActiveChild(id: string) {
  write(KEY_LAST, id);
}

// ---------- Sync queue ----------
const KEY_QUEUE = 'fk.syncq.v1';

export interface SyncBatch {
  childId: string;
  sessions: SessionRecord[];
  achievements: string[];
  rewards: string[];
  streak: { current: number; best: number; lastDate: string };
}

export function getSyncQueue(): SyncBatch[] {
  return read<SyncBatch[]>(KEY_QUEUE, []);
}

export function pushSyncBatch(batch: SyncBatch) {
  const q = getSyncQueue();
  q.push(batch);
  write(KEY_QUEUE, q);
}

export function clearSyncQueue() {
  localStorage.removeItem(KEY_QUEUE);
}
