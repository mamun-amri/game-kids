import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const parentRouter = Router();
parentRouter.use(requireAuth);

function bucket(gameType: string): string {
  const groups: Record<string, string> = {
    memory_match: 'Memory Match',
    hidden_object: 'Hidden Object',
    find_difference: 'Find Difference',
    simon_memory: 'Simon Memory',
    tap_target: 'Tap Target',
    counting: 'Counting',
    pattern_recognition: 'Pattern Recognition',
    follow_instruction: 'Follow Instruction',
    maze: 'Maze',
    sound_recognition: 'Sound Recognition',
  };
  return groups[gameType] ?? gameType;
}

function areaToImprove(acc: number, avgScore: number, avgTime: number): string[] {
  const areas: string[] = [];
  if (acc < 80) areas.push('Akurasi');
  if (avgScore < 70) areas.push('Konsistensi Fokus');
  if (avgTime > 60000) areas.push('Kecepatan Respons');
  if (areas.length === 0) areas.push('Pertahankan performa!');
  return areas;
}

parentRouter.get('/report', async (req, res) => {
  const children = await query(
    'SELECT * FROM children WHERE parent_id = $1 ORDER BY created_at',
    [req.user!.id],
  );

  const childrenArray: unknown[] = [];

  for (const child of children.rows) {
    const sessions = await query(
      `SELECT game_type, level, stars, score, accuracy, consistency, speed,
              completion, duration_ms, is_daily, played_at
       FROM game_sessions WHERE child_id = $1 ORDER BY played_at`,
      [child.id],
    );

    const totalMs = sessions.rows.reduce((a, s) => a + Number(s.duration_ms), 0);
    const avgAccuracy =
      sessions.rows.length === 0
        ? 0
        : sessions.rows.reduce((a, s) => a + Number(s.accuracy), 0) /
          sessions.rows.length;
    const avgScore =
      sessions.rows.length === 0
        ? 0
        : sessions.rows.reduce((a, s) => a + Number(s.score), 0) /
          sessions.rows.length;
    const avgTime =
      sessions.rows.length === 0
        ? 0
        : sessions.rows.reduce((a, s) => a + Number(s.duration_ms), 0) /
          sessions.rows.length;

    const byGame = new Map<string, { count: number; ms: number; score: number }>();
    for (const s of sessions.rows) {
      const g = byGame.get(s.game_type) ?? { count: 0, ms: 0, score: 0 };
      g.count += 1;
      g.ms += Number(s.duration_ms);
      g.score += Number(s.score);
      byGame.set(s.game_type, g);
    }
    let favoriteGame = 'Belum ada data';
    let favCount = 0;
    for (const [game, stats] of byGame) {
      if (stats.count > favCount) {
        favCount = stats.count;
        favoriteGame = bucket(game);
      }
    }

    // daily aggregation for the last 30 days
    const days = new Map<string, { ms: number; score: number; count: number }>();
    for (const s of sessions.rows) {
      const day = new Date(s.played_at).toISOString().slice(0, 10);
      const d = days.get(day) ?? { ms: 0, score: 0, count: 0 };
      d.ms += Number(s.duration_ms);
      d.score += Number(s.score);
      d.count += 1;
      days.set(day, d);
    }
    const timeline = Array.from(days.entries())
      .map(([date, d]) => ({
        date,
        playMs: d.ms,
        avgScore: d.count ? Math.round(d.score / d.count) : 0,
        sessions: d.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const achievements = await query(
      `SELECT a.code, a.name, a.description, a.icon, ca.unlocked_at
       FROM child_achievements ca JOIN achievements a ON a.code = ca.achievement
       WHERE ca.child_id = $1`,
      [child.id],
    );

    childrenArray.push({
      id: child.id,
      name: child.name,
      age: child.age,
      age_group: child.age_group,
      avatar_id: child.avatar_id,
      summary: {
        total_sessions: sessions.rows.length,
        total_stars: sessions.rows.reduce((a, s) => a + s.stars, 0),
        total_play_seconds: Math.round(totalMs / 1000),
        avg_accuracy: Math.round(avgAccuracy),
        avg_score: Math.round(avgScore),
        avg_session_ms: Math.round(avgTime),
        favorite_game: favoriteGame,
        focus_level:
          avgScore >= 85 ? 'Sangat Fokus' : avgScore >= 70 ? 'Fokus' : 'Perlu Latihan',
        areas_to_improve: areaToImprove(avgAccuracy, avgScore, avgTime),
      },
      timeline,
      achievements: achievements.rows,
      recent_sessions: sessions.rows.slice(-10).reverse(),
    });
  }

  res.json({
    generated_at: new Date().toISOString(),
    children: childrenArray,
  });
});
