-- ============================================================
-- Focus Kids - Database Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS parents (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS children (
  id         SERIAL PRIMARY KEY,
  parent_id  INTEGER REFERENCES parents(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  age        INTEGER NOT NULL,
  age_group  TEXT NOT NULL,
  avatar_id  TEXT NOT NULL DEFAULT 'avatar_1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per play session
CREATE TABLE IF NOT EXISTS game_sessions (
  id              SERIAL PRIMARY KEY,
  client_session_id TEXT UNIQUE NOT NULL,
  child_id        INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  game_type       TEXT NOT NULL,
  level           INTEGER NOT NULL,
  stars           INTEGER NOT NULL DEFAULT 0,
  score           NUMERIC(6,2) NOT NULL DEFAULT 0,
  accuracy        NUMERIC(6,2) NOT NULL DEFAULT 0,
  consistency     NUMERIC(6,2) NOT NULL DEFAULT 0,
  speed           NUMERIC(6,2) NOT NULL DEFAULT 0,
  completion      NUMERIC(6,2) NOT NULL DEFAULT 0,
  duration_ms     INTEGER NOT NULL DEFAULT 0,
  is_daily        BOOLEAN NOT NULL DEFAULT FALSE,
  played_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_child   ON game_sessions(child_id, played_at);
CREATE INDEX IF NOT EXISTS idx_sessions_game    ON game_sessions(child_id, game_type);

CREATE TABLE IF NOT EXISTS achievements (
  code        TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT '🏅'
);

CREATE TABLE IF NOT EXISTS child_achievements (
  child_id      INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  achievement   TEXT NOT NULL REFERENCES achievements(code),
  unlocked_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (child_id, achievement)
);

CREATE TABLE IF NOT EXISTS rewards (
  code        TEXT PRIMARY KEY,
  type        TEXT NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT '🎁'
);

CREATE TABLE IF NOT EXISTS child_rewards (
  child_id     INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  reward       TEXT NOT NULL REFERENCES rewards(code),
  unlocked_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (child_id, reward)
);

CREATE TABLE IF NOT EXISTS streaks (
  child_id       INTEGER PRIMARY KEY REFERENCES children(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak    INTEGER NOT NULL DEFAULT 0,
  last_play_date DATE
);

CREATE TABLE IF NOT EXISTS daily_challenges (
  id          SERIAL PRIMARY KEY,
  day         DATE NOT NULL,
  game_type   TEXT NOT NULL,
  level       INTEGER NOT NULL,
  reward_icon TEXT NOT NULL DEFAULT '🎁',
  UNIQUE (day, game_type)
);
