import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateLevelConfig } from '../lib/levelGen';
import type { GameResult, GameType } from '../types';
import type { SessionOutcome } from '../context/AppContext';
import { GameShell } from '../components/GameShell';
import { Modal } from '../components/Modal';
import { StarRating } from '../components/StarRating';
import { getAchievementDef } from '../lib/achievements';
import { getRewardDef } from '../lib/rewards';
import { GAME_NAMES, GAME_EMOJI } from '../lib/catalog';

export function Play() {
  const { game, level } = useParams<{ game: string; level: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const gameType = game as GameType;
  const levelNum = parseInt(level ?? '1', 10);
  const isDaily = params.get('daily') === '1';
  const { recordSession } = useApp();

  const [outcome, setOutcome] = useState<SessionOutcome | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    setOutcome(null);
    setRound(0);
  }, [gameType, levelNum]);

  if (!gameType || isNaN(levelNum)) {
    return <NavigateBack />;
  }

  const config = generateLevelConfig(gameType, levelNum);

  const handleFinish = (result: GameResult) => {
    const o = recordSession(result);
    setOutcome(o);
  };

  const handleQuit = () => {
    navigate(isDaily ? '/dashboard' : `/games/${gameType}/levels`);
  };

  const nextLevel = levelNum + 1;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '14px 16px 30px',
      }}
    >
      <div
        className="between"
        style={{ width: '100%', maxWidth: 640, marginBottom: 10, color: '#fff' }}
      >
        <div style={{ fontWeight: 900, fontSize: 18, textShadow: '0 2px 6px rgba(0,0,0,.3)' }}>
          {GAME_EMOJI[gameType]} {GAME_NAMES[gameType]}
          {isDaily ? ' · 📅 Daily' : ` · Level ${levelNum}`}
        </div>
      </div>

      <GameShell
        key={`${gameType}-${levelNum}-${round}`}
        gameType={gameType}
        config={config}
        isDaily={isDaily}
        onFinish={handleFinish}
        onQuit={handleQuit}
      />

      {outcome && (
        <ResultModal
          outcome={outcome}
          isDaily={isDaily}
          onReplay={() => setRound((r) => r + 1)}
          onNext={nextLevel <= 1000 ? () => navigate(`/play/${gameType}/${nextLevel}`) : undefined}
          onExit={() => navigate(isDaily ? '/dashboard' : `/games/${gameType}/levels`)}
        />
      )}
    </div>
  );
}

function NavigateBack() {
  const navigate = useNavigate();
  useEffect(() => navigate('/games'), [navigate]);
  return null;
}

function ResultModal({
  outcome,
  isDaily,
  onReplay,
  onNext,
  onExit,
}: {
  outcome: SessionOutcome;
  isDaily: boolean;
  onReplay: () => void;
  onNext?: () => void;
  onExit: () => void;
}) {
  const m = outcome.metrics;
  const emoji = m.stars === 3 ? '🏆' : m.stars === 2 ? '😄' : m.stars === 1 ? '🙂' : '💪';
  const title =
    m.stars === 3
      ? 'Luar Biasa!'
      : m.stars === 2
        ? 'Bagus Sekali!'
        : m.stars === 1
          ? 'Mantap!'
          : 'Coba Lagi!';

  const newAchievements = outcome.newlyUnlockedAchievements
    .map((c) => getAchievementDef(c))
    .filter(Boolean);
  const newRewards = outcome.newRewards
    .map((c) => getRewardDef(c))
    .filter(Boolean);

  return (
    <Modal>
      <div className="big-emoji">{emoji}</div>
      <h2 style={{ margin: '10px 0 4px' }}>{title}</h2>
      <div className="muted mb-8">
        {isDaily ? 'Daily Challenge selesai! +1 Kotak Misteri 🎁' : `Focus Score: ${m.score}`}
      </div>
      <StarRating value={m.stars} />
      <div className="metric-grid">
        <div className="metric">
          <div className="m-label">Akurasi</div>
          <div className="m-value">{m.accuracy}%</div>
        </div>
        <div className="metric">
          <div className="m-label">Konsistensi</div>
          <div className="m-value">{m.consistency}%</div>
        </div>
        <div className="metric">
          <div className="m-label">Kecepatan</div>
          <div className="m-value">{m.speed}%</div>
        </div>
        <div className="metric">
          <div className="m-label">Penyelesaian</div>
          <div className="m-value">{m.completion}%</div>
        </div>
      </div>

      {outcome.mysteryBoxesEarned > 0 && (
        <div className="chip" style={{ marginBottom: 10 }}>
          🎁 +{outcome.mysteryBoxesEarned} Kotak Misteri
        </div>
      )}
      {newAchievements.length > 0 && (
        <div className="mt-8">
          {newAchievements.map((a) => (
            <div className="chip" key={a!.code} style={{ marginBottom: 6, background: '#FFF7DB', color: '#B45309' }}>
              {a!.icon} Lencana baru: {a!.name}
            </div>
          ))}
        </div>
      )}
      {newRewards.length > 0 && (
        <div className="mt-8">
          {newRewards.map((r) => (
            <div className="chip" key={r!.code} style={{ marginBottom: 6, background: '#E7F9EF', color: '#166534' }}>
              {r!.icon} Hadiah baru: {r!.name}
            </div>
          ))}
        </div>
      )}

      <div className="row mt-16 wrap" style={{ justifyContent: 'center' }}>
        <button className="btn sky" onClick={onReplay}>
          🔄 Ulangi
        </button>
        {onNext && (
          <button className="btn green" onClick={onNext}>
            ▶️ Lanjut
          </button>
        )}
        <button className="btn ghost" style={{ color: '#3b2f63', background: '#efe9ff' }} onClick={onExit}>
          🏠 Selesai
        </button>
      </div>
    </Modal>
  );
}
