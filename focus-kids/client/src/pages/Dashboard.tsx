import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { computeStats } from '../lib/stats';
import { GAME_NAMES, GAME_EMOJI, defaultAvatar } from '../lib/catalog';
import { tierForLevel } from '../lib/tiers';
import { todayKey, dailyChallengeFor } from '../lib/date';
import { getAchievementDef } from '../lib/achievements';
import { formatPlayTime } from '../lib/stats';

export function Dashboard() {
  const { currentChild, openMysteryBox, parentAuth } = useApp();
  if (!currentChild) return null;

  const stats = computeStats(currentChild);
  const today = todayKey();
  const challenge = dailyChallengeFor(today);
  const done = currentChild.dailyChallenges[today]?.done;
  const focusLevel = stats.avgScore;

  const games = Object.keys(GAME_NAMES) as (keyof typeof GAME_NAMES)[];
  const perGameMax = games.map((g) => {
    const max = currentChild.sessions
      .filter((s) => s.gameType === g)
      .reduce((m, s) => Math.max(m, s.level), 0);
    return { game: g, max };
  });

  const recentAch = currentChild.achievements.slice(-3).reverse();

  return (
    <div>
      <div className="between wrap">
        <div className="row">
          <span style={{ fontSize: 56, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.25))' }}>
            {defaultAvatar(currentChild.profile.avatarId).emoji}
          </span>
          <div>
            <div style={{ color: '#fff', fontSize: 26, fontWeight: 900, textShadow: '0 2px 6px rgba(0,0,0,.3)' }}>
              Halo, {currentChild.profile.name}!
            </div>
            <div style={{ color: 'rgba(255,255,255,.85)', fontWeight: 700 }}>
              {currentChild.profile.age} tahun · {currentChild.profile.ageGroup} tahun
            </div>
          </div>
        </div>
        <span className="streak-chip">🔥 {currentChild.streak.current} hari</span>
      </div>

      {/* Daily challenge */}
      <div className={`daily-card ${done ? 'done' : ''}`}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>
            {done ? '✅ Daily Challenge Selesai!' : '🎯 Daily Challenge Hari Ini'}
          </div>
          <div style={{ opacity: 0.9, fontWeight: 600 }}>
            {GAME_NAMES[challenge.gameType]} · Level {challenge.level}
            {done ? '' : ' · Hadiah Kotak Misteri 🎁'}
          </div>
        </div>
        {!done && (
          <Link
            className="btn"
            style={{ background: '#fff', color: '#ef4444', boxShadow: '0 5px 0 #b91c1c' }}
            to={`/play/${challenge.gameType}/${challenge.level}?daily=1`}
          >
            Mainkan
          </Link>
        )}
      </div>

      {/* Mystery box */}
      <div className="card mb-16">
        <div className="between wrap">
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>🎁 Kotak Misteri</div>
            <div className="muted" style={{ fontSize: 14 }}>
              Kamu punya {currentChild.mysteryBoxes} kotak misteri
            </div>
          </div>
          <button
            className="btn orange"
            disabled={currentChild.mysteryBoxes <= 0}
            onClick={() => openMysteryBox()}
          >
            🎲 Buka Kotak
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid mb-16">
        <div className="stat-tile">
          <div className="icon">⭐</div>
          <div className="value">{stats.totalStars}</div>
          <div className="label">Total Bintang</div>
        </div>
        <div className="stat-tile">
          <div className="icon">🏅</div>
          <div className="value">{stats.totalBadges}</div>
          <div className="label">Badge</div>
        </div>
        <div className="stat-tile">
          <div className="icon">🎯</div>
          <div className="value">{stats.avgAccuracy}%</div>
          <div className="label">Akurasi</div>
        </div>
        <div className="stat-tile">
          <div className="icon">🧠</div>
          <div className="value">{focusLevel}%</div>
          <div className="label">Fokus</div>
        </div>
        <div className="stat-tile">
          <div className="icon">⏱️</div>
          <div className="value" style={{ fontSize: 20 }}>
            {formatPlayTime(stats.playTimeMs)}
          </div>
          <div className="label">Waktu Bermain</div>
        </div>
        <div className="stat-tile">
          <div className="icon">🎮</div>
          <div className="value" style={{ fontSize: 16 }}>
            {stats.lastGame ? GAME_NAMES[stats.lastGame] : '-'}
          </div>
          <div className="label">Game Terakhir</div>
        </div>
      </div>

      {/* Game progress */}
      <div className="section-title">🎮 Kemajuan Game</div>
      <div className="game-grid mb-16">
        {perGameMax.map(({ game, max }) => {
          const tier = max > 0 ? tierForLevel(max) : null;
          return (
            <Link className="game-card" to={`/games/${game}/levels`} key={game}>
              <div className="emoji">{GAME_EMOJI[game]}</div>
              <div className="name">{GAME_NAMES[game]}</div>
              <div className="progress">
                {max > 0
                  ? `Level ${max} · ${tier?.icon} ${tier?.name}`
                  : 'Belum dimainkan'}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent achievements */}
      {recentAch.length > 0 && (
        <>
          <div className="section-title">🏅 Lencana Terbaru</div>
          <div className="ach-grid mb-16">
            {recentAch.map((code) => {
              const def = getAchievementDef(code);
              if (!def) return null;
              return (
                <div className="ach-card" key={code}>
                  <div className="a-icon">{def.icon}</div>
                  <div className="a-name">{def.name}</div>
                  <div className="a-desc">{def.description}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {!parentAuth && (
        <div className="center mt-24">
          <Link className="btn ghost" to="/parent">
            👨‍👩‍👧 Lihat Halaman Orang Tua
          </Link>
        </div>
      )}
    </div>
  );
}
