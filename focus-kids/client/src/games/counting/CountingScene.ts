import Phaser from 'phaser';
import { BaseGameScene } from '../core/BaseGameScene';
import { getParams } from '../core/bridge';
import { COLORS, FONT, H, W, makeButton, makeText } from '../core/sceneUtils';
import { makeRng, shuffle } from '../../lib/tiers';
import type { CountingParams } from '../../lib/levelGen';

const EMOJIS = ['🍎', '🐥', '🎈', '⭐', '🐶', '🌻', '🍓', '🦋', '⚽', '🚗'];

export class CountingScene extends BaseGameScene {
  readonly gameKey = 'counting' as const;

  private params!: CountingParams;
  private answered = false;
  private firstTry = true;

  startLevel() {
    this.params = getParams<CountingParams>(this.bridge);
    const rng = makeRng(this.gameKey, this.bridge.config.level);
    const emoji = EMOJIS[Math.floor(rng() * EMOJIS.length)];

    makeText(this, W / 2, 96, 'Berapa jumlahnya? Hitung dengan teliti!', {
      fontSize: '20px',
      color: '#8a7fb8',
    }).setOrigin(0.5);

    // scatter objects
    const positions: { x: number; y: number }[] = [];
    let guard = 0;
    while (positions.length < this.params.objectCount && guard < 3000) {
      guard += 1;
      const x = 50 + rng() * (W - 100);
      const y = 170 + rng() * (H - 300);
      if (positions.every((p) => Math.hypot(p.x - x, p.y - y) > 44)) {
        positions.push({ x, y });
      }
    }
    while (positions.length < this.params.objectCount) {
      positions.push({
        x: 50 + rng() * (W - 100),
        y: 170 + rng() * (H - 300),
      });
    }
    for (const p of positions) {
      this.add
        .text(p.x, p.y, emoji, { fontFamily: FONT, fontSize: '40px' })
        .setOrigin(0.5);
    }

    // answer options
    const correct = this.params.objectCount;
    const options = shuffle([correct, correct - 1, correct + 1], rng)
      .map((n) => Math.max(1, n))
      .filter((v, i, a) => a.indexOf(v) === i);
    while (options.length < 3) {
      options.push(Math.max(1, correct + options.length));
    }
    const shuffled = shuffle(options, rng);

    const startX = W / 2 - (shuffled.length - 1) * 70;
    shuffled.forEach((n, i) => {
      makeButton(
        this,
        startX + i * 140,
        H - 110,
        110,
        70,
        String(n),
        () => this.answer(n, correct),
        { fill: i === 0 ? COLORS.purple : i === 1 ? COLORS.blue : COLORS.pink },
      );
    });
  }

  private answer(n: number, correct: number) {
    if (this.answered || this.completed || this.quit) return;
    if (n === correct) {
      this.answered = true;
      this.correct += 1;
      this.subtaskOk.push(this.firstTry);
      this.add
        .text(W / 2, 190, '✓ Benar!', {
          fontFamily: FONT,
          fontSize: '46px',
          color: '#16a34a',
        })
        .setOrigin(0.5);
      this.finish(100);
    } else {
      this.wrong += 1;
      this.firstTry = false;
      this.cameras.main.shake(60, 0.004);
    }
  }
}
