import { Router } from 'express';
import { query } from '../db.js';

export const metaRouter = Router();

metaRouter.get('/achievements', async (_req, res) => {
  const result = await query(
    'SELECT * FROM achievements ORDER BY code',
  );
  res.json(result.rows);
});

metaRouter.get('/rewards', async (_req, res) => {
  const result = await query('SELECT * FROM rewards ORDER BY type, code');
  res.json(result.rows);
});

metaRouter.get('/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ ok: true, db: 'connected' });
  } catch (e) {
    res.status(500).json({ ok: false, db: 'error', message: (e as Error).message });
  }
});
