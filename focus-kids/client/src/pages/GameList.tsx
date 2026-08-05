import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  GAME_NAMES,
  GAME_DESCRIPTIONS,
  GAME_EMOJI,
} from '../lib/catalog';
import { tierForLevel } from '../lib/tiers';
import type { GameType } from '../types';

const ORDER: GameType[] = [
  'memory_match',
  'hidden_object',
  'find_difference',
  'simon_memory',
  'tap_target',
  'counting',
];

export function GameList() {
  const { currentChild } = useApp();
  if (!currentChild) return null;

  return (
    <div>
      <h1 className="h1">Pilih Game 🎮</h1>
      <p className="hero-sub" style={{ textAlign: 'left', margin: '0 0 18px' }}>
        Pilih permainan favoritmu dan kumpulkan bintang!
      </p>

      <div className="game-grid">
        {ORDER.map((game) => {
          const played = currentChild.sessions
            .filter((s) => s.gameType === game)
            .reduce((max, s) => Math.max(max, s.level), 0);
          const tier = played > 0 ? tierForLevel(played) : null;
          return (
            <Link
              className="game-card"
              to={`/games/${game}/levels`}
              key={game}
              style={{ padding: '22px 14px' }}
            >
              <div className="emoji">{GAME_EMOJI[game]}</div>
              <div className="name">{GAME_NAMES[game]}</div>
              <div className="sub">{GAME_DESCRIPTIONS[game]}</div>
              <div className="progress">
                {played > 0
                  ? `Level ${played} · ${tier?.icon} ${tier?.name}`
                  : 'Level 1 · 🌱 Beginner'}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
