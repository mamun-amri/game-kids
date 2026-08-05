import Phaser from 'phaser';
import { BaseGameScene } from '../core/BaseGameScene';
import { getParams } from '../core/bridge';
import { COLORS, FONT, H, W, makeText } from '../core/sceneUtils';
import { makeRng, shuffle } from '../../lib/tiers';
import type { HiddenObjectParams } from '../../lib/levelGen';

const POOL = [
  '🍎', '🍌', '🍇', '🍓', '🥕', '🌽', '🍩', '🍪',
  '🎈', '🎁', '✈️', '🚗', '🐶', '🐱', '🦊', '🐼',
  '🐟', '🦋', '🌻', '⭐', '🎸', '🌈', '⚽', '🍉',
  '🍄', '🐝', '🦆', '🧸', '🔑', '📚',
];

interface Target {
  symbol: string;
  x: number;
  y: number;
  size: number;
  found: boolean;
  sprite: Phaser.GameObjects.Text;
}

export class HiddenObjectScene extends BaseGameScene {
  readonly gameKey = 'hidden_object' as const;

  private params!: HiddenObjectParams;
  private targets: Target[] = [];
  private distractors: { x: number; y: number; size: number }[] = [];
  private foundCount = 0;
  private trayItems: Phaser.GameObjects.Text[] = [];

  startLevel() {
    this.params = getParams<HiddenObjectParams>(this.bridge);
    const rng = makeRng(this.gameKey, this.bridge.config.level);

    const targetSymbols = shuffle(POOL, rng).slice(0, this.params.objectCount);
    const remaining = POOL.filter((s) => !targetSymbols.includes(s));
    const distractorSymbols = shuffle(remaining, rng).slice(0, this.params.distractorCount);

    const size = this.params.complexity >= 4 ? 26 : this.params.complexity >= 3 ? 32 : 38;

    const positions = this.placeSpots(targetSymbols.length + distractorSymbols.length, size, rng);

    targetSymbols.forEach((symbol, i) => {
      const { x, y } = positions[i];
      const sprite = this.add
        .text(x, y, symbol, { fontFamily: FONT, fontSize: `${size}px` })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      sprite.on('pointerdown', () => this.onTap(symbol, sprite, x, y));
      this.targets.push({ symbol, x, y, size, found: false, sprite });
    });

    for (let i = 0; i < distractorSymbols.length; i++) {
      const { x, y } = positions[targetSymbols.length + i];
      const d = this.add
        .text(x, y, distractorSymbols[i], {
          fontFamily: FONT,
          fontSize: `${size}px`,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      d.on('pointerdown', () => this.onWrong());
      this.distractors.push({ x, y, size });
    }

    this.buildTray(targetSymbols);
  }

  private buildTray(symbols: string[]) {
    makeText(this, W / 2, 108, 'Temukan benda berikut:', {
      fontSize: '18px',
      color: '#8a7fb8',
    }).setOrigin(0.5);
    const startX = W / 2 - (symbols.length * 46) / 2;
    symbols.forEach((s, i) => {
      const t = this.add
        .text(startX + i * 46 + 23, 150, s, {
          fontFamily: FONT,
          fontSize: '38px',
        })
        .setOrigin(0.5)
        .setAlpha(1);
      this.trayItems.push(t);
    });
  }

  private placeSpots(
    count: number,
    size: number,
    rng: () => number,
  ): { x: number; y: number }[] {
    const minX = 30;
    const maxX = W - 30;
    const minY = 190;
    const maxY = H - 40;
    const minDist = size + 8;
    const spots: { x: number; y: number }[] = [];
    let guard = 0;
    while (spots.length < count && guard < 4000) {
      guard += 1;
      const x = minX + rng() * (maxX - minX);
      const y = minY + rng() * (maxY - minY);
      if (spots.every((p) => Math.hypot(p.x - x, p.y - y) > minDist)) {
        spots.push({ x, y });
      }
    }
    // fill remaining with any spots
    while (spots.length < count) {
      spots.push({
        x: minX + rng() * (maxX - minX),
        y: minY + rng() * (maxY - minY),
      });
    }
    return spots;
  }

  private onTap(symbol: string, sprite: Phaser.GameObjects.Text, x: number, y: number) {
    if (this.completed || this.quit) return;
    const target = this.targets.find(
      (t) => t.symbol === symbol && !t.found,
    );
    if (!target) return;

    target.found = true;
    this.foundCount += 1;
    this.correct += 1;
    this.subtaskOk.push(true);

    const idx = this.trayItems.findIndex((t) => t.text === symbol);
    if (idx >= 0) this.trayItems[idx].setAlpha(0.3);

    this.tweens.add({
      targets: sprite,
      scale: 1.5,
      alpha: 0,
      duration: 350,
      onComplete: () => {
        sprite.destroy();
        this.add
          .text(x, y, '✨', { fontFamily: FONT, fontSize: '44px' })
          .setOrigin(0.5)
          .setDepth(20);
      },
    });

    if (this.foundCount === this.params.objectCount) {
      this.finish(100);
    }
  }

  private onWrong() {
    if (this.completed || this.quit) return;
    this.wrong += 1;
    this.subtaskOk.push(false);
    this.cameras.main.shake(80, 0.004);
  }

  protected onTimeUp() {
    this.finish((this.foundCount / this.params.objectCount) * 100);
  }
}
