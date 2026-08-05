export interface AvatarDef {
  id: string;
  emoji: string;
  name: string;
  color: string;
}

export const DEFAULT_AVATARS: AvatarDef[] = [
  { id: 'avatar_1', emoji: '🐰', name: 'Kelinci', color: '#F472B6' },
  { id: 'avatar_2', emoji: '🦊', name: 'Rubah', color: '#FB923C' },
  { id: 'avatar_3', emoji: '🐼', name: 'Panda', color: '#9CA3AF' },
  { id: 'avatar_4', emoji: '🐸', name: 'Katak', color: '#4ADE80' },
  { id: 'avatar_5', emoji: '🐥', name: 'Ayam', color: '#FACC15' },
  { id: 'avatar_6', emoji: '🦄', name: 'Unicorn', color: '#C084FC' },
];

export function defaultAvatar(id: string): AvatarDef {
  return DEFAULT_AVATARS.find((a) => a.id === id) ?? DEFAULT_AVATARS[0];
}

export interface BackgroundDef {
  id: string;
  emoji: string;
  name: string;
  gradient: string;
}

export const BACKGROUNDS: BackgroundDef[] = [
  { id: 'bg_default', emoji: '🌈', name: 'Pelangi Ceria', gradient: 'linear-gradient(160deg,#7C3AED,#EC4899)' },
  { id: 'bg_sky', emoji: '☀️', name: 'Langit Pagi', gradient: 'linear-gradient(160deg,#38BDF8,#818CF8)' },
  { id: 'bg_forest', emoji: '🌲', name: 'Hutan Hijau', gradient: 'linear-gradient(160deg,#22C55E,#15803D)' },
  { id: 'bg_sunset', emoji: '🌇', name: 'Senja', gradient: 'linear-gradient(160deg,#F97316,#EF4444)' },
  { id: 'bg_space', emoji: '🌌', name: 'Luar Angkasa', gradient: 'linear-gradient(160deg,#312E81,#7C3AED)' },
  { id: 'bg_underwater', emoji: '🌊', name: 'Bawah Laut', gradient: 'linear-gradient(160deg,#06B6D4,#1D4ED8)' },
  { id: 'bg_fantasy', emoji: '🏰', name: 'Negeri Dongeng', gradient: 'linear-gradient(160deg,#8B5CF6,#DB2777)' },
];

export function backgroundById(id: string): BackgroundDef {
  return BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0];
}

export const GAME_EMOJI: Record<string, string> = {
  memory_match: '🃏',
  hidden_object: '🔍',
  find_difference: '🔎',
  simon_memory: '🎨',
  tap_target: '🎯',
  counting: '🔢',
};

export const GAME_NAMES: Record<string, string> = {
  memory_match: 'Memory Match',
  hidden_object: 'Hidden Object',
  find_difference: 'Find Difference',
  simon_memory: 'Simon Memory',
  tap_target: 'Tap Target',
  counting: 'Counting',
};

export const GAME_DESCRIPTIONS: Record<string, string> = {
  memory_match: 'Cari pasangan kartu yang sama',
  hidden_object: 'Temukan benda tersembunyi',
  find_difference: 'Temukan perbedaan gambar',
  simon_memory: 'Ingat dan ulangi urutan warna',
  tap_target: 'Ketuk objek yang benar',
  counting: 'Hitung jumlah objek dengan teliti',
};
