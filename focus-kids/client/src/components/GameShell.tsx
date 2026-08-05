import { useEffect, useRef } from 'react';
import type { GameResult, GameType } from '../types';
import type { GameLevelConfig } from '../types';
import { createPhaserGame, destroyGame } from '../games/core/createGame';

interface Props {
  gameType: GameType;
  config: GameLevelConfig;
  isDaily?: boolean;
  onFinish: (result: GameResult) => void;
  onQuit: () => void;
}

export function GameShell({ gameType, config, isDaily = false, onFinish, onQuit }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const cbRef = useRef({ onFinish, onQuit });

  cbRef.current = { onFinish, onQuit };

  useEffect(() => {
    if (!hostRef.current) return;
    const game = createPhaserGame(hostRef.current, gameType, {
      config,
      isDaily,
      onFinish: (result: GameResult) => cbRef.current.onFinish(result),
      onQuit: () => cbRef.current.onQuit(),
    });
    gameRef.current = game;
    return () => {
      destroyGame(gameRef.current);
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameType, config.level]);

  return <div className="game-shell" ref={hostRef} />;
}
