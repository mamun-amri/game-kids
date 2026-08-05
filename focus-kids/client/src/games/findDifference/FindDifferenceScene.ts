import Phaser from 'phaser';
import { BaseGameScene } from '../core/BaseGameScene';
import { getParams } from '../core/bridge';
import { COLORS, FONT, H, W, makeText } from '../core/sceneUtils';
import { makeRng, shuffle } from '../../lib/tiers';
import type { FindDifferenceParams } from '../../lib/levelGen';

const POOL = [
  '🐶', '🐱', '🦊', '🐼', '🐟', '🦋', '🌻', '⭐',
  '🎈', '🎁', '✈️', '🚗', '🍎', '🍌', '🍇', '🍓',
  '☀️', '☁️', '🌙', '🌈', '🎸', '⚽', '🧸', '🔑',
  '🍩', '🍪', '🥕', '🌽', '🐝', '🦆', '🍄', '⛵',
];

interface DiffItem {
  symbol: string;
  x: number;
  y: number;
  diff: boolean;
  rightSymbol: string;
  found: boolean;
}

export class FindDifferenceScene extends BaseGameScene {
  readonly gameKey = 'find_difference' as const;

  private params!: FindDifferenceParams;
  private items: DiffItem[] = [];
  private foundCount = 0;
  private wrongTaps = 0;

  startLevel() {
    this.params = getParams<FindDifferenceParams>(this.bridge);
    const rng = makeRng(this.gameKey, this.bridge.config.level);

    const itemCount = Math.min(9 + this.params.differences * 2, 30);
    const symbols = shuffle(POOL, rng).slice(0, itemCount);
    const diffIndices = new Set<number>();
    while (diffIndices.size < this.params.differences) {
      diffIndices.add(Math.floor(rng() * itemCount));
    }

    const leftHalf = W / 2 - 30;
    const used: { x: number; y: number }[] = [];
    let guard = 0;

    symbols.forEach((symbol, i) => {
      let x = 0;
      let y = 0;
      let ok = false;
      while (!ok && guard < 4000) {
        guard += 1;
        x = 40 + rng() * (leftHalf - 70);
        y = 170 + rng() * (H - 230);
        ok = used.every((p) => Math.hypot(p.x - x, p.y - y) > 46);
      }
      used.push({ x, y });

      const isDiff = diffIndices.has(i);
      const rightSymbol = isDiff ? (symbol === '⭐' ? '🌟' : POOL[(POOL.indexOf(symbol) + 7) % POOL.length]) : symbol;

      // left item
      this.add
        .text(x, y, symbol, { fontFamily: FONT, fontSize: '34px' })
        .setOrigin(0.5);
      // right item
      this.add
        .text(x + W / 2, y, rightSymbol, { fontFamily: FONT, fontSize: '34px' })
        .setOrigin(0.5);

      this.items.push({ symbol, x, y, diff: isDiff, rightSymbol, found: false });
    });

    // wrong-tap zone for the whole right panel (zones added later sit on top)
    const rightPanel = this.add
      .rectangle(W / 2 + W / 4, H / 2 + 20, W / 2, H - 140, 0x000000, 0)
      .setOrigin(0.5)
      .setInteractive();
    rightPanel.on('pointerdown', () => this.onWrong());

    // hit zones for differences on the right panel
    for (const item of this.items) {
      if (!item.diff) continue;
      const zone = this.add
        .circle(item.x + W / 2, item.y, 34, 0x000000, 0)
        .setInteractive();
      zone.on('pointerdown', () => this.onFound(item));
    }

    makeText(this, W / 2, 100, `Temukan ${this.params.differences} perbedaan!`, {
      fontSize: '22px',
      color: '#8a7fb8',
    }).setOrigin(0.5);
  }

  private onFound(item: DiffItem) {
    if (item.found || this.completed || this.quit) return;
    item.found = true;
    this.foundCount += 1;
    this.correct += 1;
    this.subtaskOk.push(this.wrongTaps === 0);
    this.wrongTaps = 0;

    const rx = item.x + W / 2;
    this.add
      .text(rx, item.y, '✓', {
        fontFamily: FONT,
        fontSize: '46px',
        color: '#16a34a',
      })
      .setOrigin(0.5)
      .setDepth(20);

    if (this.foundCount === this.params.differences) {
      this.finish(100);
    }
  }

  protected onWrong() {
    if (this.completed || this.quit) return;
    this.wrong += 1;
    this.wrongTaps += 1;
    this.cameras.main.shake(60, 0.004);
  }

  protected onTimeUp() {
    this.finish((this.foundCount / this.params.differences) * 100);
  }
}
