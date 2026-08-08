import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { childrenRouter } from './routes/children.js';
import { parentRouter } from './routes/parent.js';
import { metaRouter } from './routes/meta.js';

const app = express();
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.use('/api/auth', authRouter);
app.use('/api/children', childrenRouter);
app.use('/api/parent', parentRouter);
app.use('/api/meta', metaRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(
  (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  },
);

app.listen(config.port, () => {
  console.log(`Focus Kids API listening on http://localhost:${config.port}`);
});
