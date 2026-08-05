import { Router } from 'express';
import { query, withTransaction } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const childrenRouter = Router();
childrenRouter.use(requireAuth);

const AGE_GROUPS = ['3-5', '6-8', '9-12'];

childrenRouter.get('/', async (req, res) => {
  const result = await query(
    `SELECT c.*,
       (SELECT COUNT(*) FROM game_sessions s WHERE s.child_id = c.id) AS session_count
     FROM children c WHERE c.parent_id = $1 ORDER BY c.created_at`,
    [req.user!.id],
  );
  res.json(result.rows);
});

childrenRouter.post('/', async (req, res) => {
  const { name, age, avatar_id } = req.body ?? {};
  if (!name || !age || age < 3 || age > 12) {
    return res.status(400).json({ error: 'Nama dan umur (3-12) wajib diisi' });
  }
  const ageGroup =
    age <= 5 ? '3-5' : age <= 8 ? '6-8' : '9-12';
  if (!AGE_GROUPS.includes(ageGroup)) {
    return res.status(400).json({ error: 'Kelompok usia tidak valid' });
  }
  const result = await query(
    `INSERT INTO children (parent_id, name, age, age_group, avatar_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [req.user!.id, name, age, ageGroup, avatar_id || 'avatar_1'],
  );
  res.status(201).json(result.rows[0]);
});

async function getChildOwned(req: Parameters<typeof requireAuth>[0], id: string) {
  const result = await query(
    'SELECT * FROM children WHERE id = $1 AND parent_id = $2',
    [id, req.user!.id],
  );
  return result.rows[0] ?? null;
}

childrenRouter.put('/:id', async (req, res) => {
  const child = await getChildOwned(req, req.params.id);
  if (!child) return res.status(404).json({ error: 'Profil tidak ditemukan' });

  const { name, age, avatar_id } = req.body ?? {};
  const ageGroup = age ? (age <= 5 ? '3-5' : age <= 8 ? '6-8' : '9-12') : child.age_group;
  const result = await query(
    `UPDATE children SET name = $1, age = $2, age_group = $3, avatar_id = $4
     WHERE id = $5 RETURNING *`,
    [
      name ?? child.name,
      age ?? child.age,
      ageGroup,
      avatar_id ?? child.avatar_id,
      child.id,
    ],
  );
  res.json(result.rows[0]);
});

childrenRouter.delete('/:id', async (req, res) => {
  const child = await getChildOwned(req, req.params.id);
  if (!child) return res.status(404).json({ error: 'Profil tidak ditemukan' });
  await query('DELETE FROM children WHERE id = $1', [child.id]);
  res.json({ ok: true });
});

// Bulk sync of local gameplay data from the client
childrenRouter.post('/:id/sync', async (req, res) => {
  const child = await getChildOwned(req, req.params.id);
  if (!child) return res.status(404).json({ error: 'Profil tidak ditemukan' });

  const { sessions = [], achievements = [], rewards = [], streak = null } =
    req.body ?? {};

  await withTransaction(async (q) => {
    for (const s of sessions) {
      if (!s.client_session_id) continue;
      await q(
        `INSERT INTO game_sessions
           (client_session_id, child_id, game_type, level, stars, score,
            accuracy, consistency, speed, completion, duration_ms, is_daily, played_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (client_session_id) DO NOTHING`,
        [
          s.client_session_id,
          child.id,
          s.game_type,
          s.level,
          s.stars ?? 0,
          s.score ?? 0,
          s.accuracy ?? 0,
          s.consistency ?? 0,
          s.speed ?? 0,
          s.completion ?? 0,
          s.duration_ms ?? 0,
          s.is_daily ?? false,
          s.played_at || new Date().toISOString(),
        ],
      );
    }
    for (const code of achievements) {
      await q(
        `INSERT INTO child_achievements (child_id, achievement)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [child.id, code],
      );
    }
    for (const code of rewards) {
      await q(
        `INSERT INTO child_rewards (child_id, reward)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [child.id, code],
      );
    }
    if (streak) {
      await q(
        `INSERT INTO streaks (child_id, current_streak, best_streak, last_play_date)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (child_id) DO UPDATE SET
           current_streak = EXCLUDED.current_streak,
           best_streak = GREATEST(streaks.best_streak, EXCLUDED.best_streak),
           last_play_date = EXCLUDED.last_play_date`,
        [child.id, streak.current ?? 0, streak.best ?? 0, streak.lastDate || null],
      );
    }
  });

  const stats = await computeStats(child.id);
  res.json({ ok: true, ...stats });
});

async function computeStats(childId: number) {
  const result = await query(
    `SELECT
       COUNT(*)::int AS total_sessions,
       COALESCE(SUM(stars), 0)::int AS total_stars,
       COALESCE(AVG(score), 0) AS avg_score,
       COALESCE(AVG(accuracy), 0) AS avg_accuracy,
       COALESCE(SUM(duration_ms), 0)::int AS total_play_ms,
       COUNT(DISTINCT (game_type, level))::int AS levels_cleared
     FROM game_sessions WHERE child_id = $1`,
    [childId],
  );
  return result.rows[0];
}
