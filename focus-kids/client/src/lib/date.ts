export function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Deterministic daily challenge: pick game + level from the date. */
export function dailyChallengeFor(dateKey: string) {
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) {
    h = (h * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  const games: Array<'memory_match' | 'hidden_object' | 'find_difference' | 'simon_memory' | 'tap_target' | 'counting'> = [
    'memory_match',
    'hidden_object',
    'find_difference',
    'simon_memory',
    'tap_target',
    'counting',
  ];
  const gameType = games[h % games.length];
  const level = (h % 30) + 1;
  return { gameType, level };
}
