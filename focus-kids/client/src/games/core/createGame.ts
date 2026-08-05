import Phaser from 'phaser';
import type { GameType } from '../../types';
import type { GameBridge } from './bridge';
import { GAME_SCENES } from '../registry';
import { H, W } from './sceneUtils';

let gameCounter = 0;

export function createPhaserGame(
  container: HTMLElement,
  gameType: GameType,
  bridge: GameBridge,
): Phaser.Game {
  gameCounter += 1;
  const SceneClass = GAME_SCENES[gameType];

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    width: W,
    height: H,
    backgroundColor: '#fff6e9',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: { activePointers: 3 },
  });

  // Register the scene by class and auto-start it with the bridge as init data.
  game.scene.add(`game_${gameCounter}`, SceneClass, true, bridge);
  return game;
}

export function destroyGame(game: Phaser.Game | null) {
  if (!game) return;
  try {
    game.destroy(true);
  } catch {
    /* ignore */
  }
}
