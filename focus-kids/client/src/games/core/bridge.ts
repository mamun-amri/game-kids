import type { GameLevelConfig, GameResult } from '../../types';

export interface GameBridge {
  config: GameLevelConfig;
  isDaily: boolean;
  onFinish: (result: GameResult) => void;
  onQuit: () => void;
}

/** Params stored on the config under `params`. */
export function getParams<T>(bridge: GameBridge): T {
  return bridge.config.params as T;
}
