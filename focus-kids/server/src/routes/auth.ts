import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { signToken } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (!email || !password || password.length < 6) {
    return res
      .status(400)
      .json({ error: 'Email dan password (min 6 karakter) wajib diisi' });
  }
  const existing = await query('SELECT id FROM parents WHERE email = $1', [email]);
  if (existing.rowCount) {
    return res.status(409).json({ error: 'Email sudah terdaftar' });
  }
  const hash = await bcrypt.hash(password, 10);
  const result = await query<{ id: number }>(
    'INSERT INTO parents (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
    [name || '', email.toLowerCase(), hash],
  );
  const user = { id: result.rows[0].id, email: email.toLowerCase(), name: name || '' };
  res.status(201).json({ token: signToken(user), user });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' });
  }
  const result = await query<{
    id: number;
    email: string;
    name: string;
    password_hash: string;
  }>('SELECT id, email, name, password_hash FROM parents WHERE email = $1', [
    email.toLowerCase(),
  ]);
  if (result.rowCount === 0) {
    return res.status(401).json({ error: 'Email atau password salah' });
  }
  const row = result.rows[0];
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) {
    return res.status(401).json({ error: 'Email atau password salah' });
  }
  const user = { id: row.id, email: row.email, name: row.name };
  res.json({ token: signToken(user), user });
});
