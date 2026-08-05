import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 4000),
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://focuskids@127.0.0.1:5433/admin123',
  jwtSecret: process.env.JWT_SECRET || 'focus-kids-dev-secret-change-me',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};
