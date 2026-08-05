import type { GameType } from '../types';
import { MemoryMatchScene } from './memoryMatch/MemoryMatchScene';
import { HiddenObjectScene } from './hiddenObject/HiddenObjectScene';
import { FindDifferenceScene } from './findDifference/FindDifferenceScene';
import { SimonMemoryScene } from './simonMemory/SimonMemoryScene';
import { TapTargetScene } from './tapTarget/TapTargetScene';
import { CountingScene } from './counting/CountingScene';

export const GAME_SCENES: Record<GameType, new () => Phaser.Scene> = {
  memory_match: MemoryMatchScene,
  hidden_object: HiddenObjectScene,
  find_difference: FindDifferenceScene,
  simon_memory: SimonMemoryScene,
  tap_target: TapTargetScene,
  counting: CountingScene,
};
