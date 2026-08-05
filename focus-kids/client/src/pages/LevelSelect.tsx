import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { bestByLevel } from '../lib/stats';
import { TIERS, tierForLevel, MAX_LEVEL } from '../lib/tiers';
import { GAME_NAMES, GAME_EMOJI } from '../lib/catalog';
import type { GameType } from '../types';

export function LevelSelect() {
  const { game } = useParams<{ game: string }>();
  const { currentChild } = useApp();
  const gameType = game as GameType;

  if (!currentChild || !gameType) return null;
  const best = bestByLevel(currentChild, gameType);
  const tiers = TIERS;

  return (
    <div>
      <Link to="/games" className="btn ghost small mb-8">
        ← Kembali
      </Link>
      <h1 className="h1">
        {GAME_EMOJI[gameType]} {GAME_NAMES[gameType]}
      </h1>
      <p className="hero-sub" style={{ textAlign: 'left', margin: '0 0 18px' }}>
        Pilih level untuk dimainkan. Kumpulkan 3 bintang di setiap level!
      </p>

      {tiers.map((tier) => {
        const levels: number[] = [];
        for (let i = tier.from; i <= tier.to && i <= MAX_LEVEL; i++) {
          levels.push(i);
        }
        return (
          <div className="tier-row" key={tier.name}>
            <div className="tier-header">
              <span>{tier.icon}</span>
              {tier.name}
              <span style={{ opacity: 0.7, fontSize: 13 }}>
                Level {tier.from}-{tier.to}
              </span>
            </div>
            <div className="level-grid">
              {levels.map((level) => {
                const b = best.get(level);
                const prev = best.get(level - 1);
                const unlocked = level === 1 || !!prev?.completed;
                const cls = [
                  'level-btn',
                  b?.stars === 3 ? 'best3' : b?.completed ? 'done' : '',
                  !unlocked ? 'locked' : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                const style = b ? { background: tier.color } : {};
                return (
                  <Link
                    className={cls}
                    key={level}
                    to={unlocked ? `/play/${gameType}/${level}` : '#'}
                    style={{ ...style, pointerEvents: unlocked ? 'auto' : 'none' }}
                  >
                    {level}
                    {b && (
                      <span className="stars-sm">
                        {b.stars === 3 ? '⭐⭐⭐' : b.stars === 2 ? '⭐⭐' : '⭐'}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
