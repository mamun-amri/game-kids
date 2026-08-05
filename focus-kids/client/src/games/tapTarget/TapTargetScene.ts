import Phaser from 'phaser';
import { BaseGameScene } from '../core/BaseGameScene';
import { getParams } from '../core/bridge';
import { COLORS, FONT, H, W, makeText } from '../core/sceneUtils';
import { makeRng, shuffle } from '../../lib/tiers';
import type { TapTargetParams } from '../../lib/levelGen';

const POOL = [
  '🍎', '🍌', '🍇', '🍓', '🐶', '🐱', '🦊', '🐼',
  '⚽', '🎈', '🚗', '✈️', '⭐', '🌻', '🍩', '🦋',
];

interface Mover {
  text: Phaser.GameObjects.Text;
  vx: number;
  vy: number;
  size: number;
}

export class TapTargetScene extends BaseGameScene {
  readonly gameKey = 'tap_target' as const;

  private params!: TapTargetParams;
  private movers: Mover[] = [];
  private targetSymbol = '';
  private roundDone = 0;
  private roundWrongFirst = 0;

  startLevel() {
    this.params = getParams<TapTargetParams>(this.bridge);
    const rng = makeRng(this.gameKey, this.bridge.config.level);

    makeText(this, W / 2, 92, '', {
      fontSize: '24px',
      color: '#7c3aed',
    }).setOrigin(0.5).setName('instruction');

    const total = 1 + this.params.distractorCount;
    for (let i = 0; i < total; i++) {
      const size = 42;
      const x = 50 + rng() * (W - 100);
      const y = 170 + rng() * (H - 250);
      const text = this.add
        .text(x, y, '', { fontFamily: FONT, fontSize: `${size}px` })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      const angle = rng() * Math.PI * 2;
      const speed = this.params.moveSpeed;
      text.on('pointerdown', () => this.onTap(text));

      this.movers.push({
        text,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
      });
    }

    this.startRound();
  }

  private startRound() {
    const rng = makeRng(this.gameKey, this.bridge.config.level + this.roundDone * 17);
    this.targetSymbol = shuffle(POOL, rng)[0];

    const targets = Math.min(1 + this.roundDone % 2, 2);
    const shuffled = shuffle(this.movers, rng);
    for (let i = 0; i < this.movers.length; i++) {
      const mover = this.movers[i];
      if (i < targets) {
        mover.text.setText(this.targetSymbol).setAlpha(1);
      } else {
        let other = this.targetSymbol;
        while (other === this.targetSymbol) {
          other = POOL[Math.floor(rng() * POOL.length)];
        }
        mover.text.setText(other).setAlpha(1);
      }
    }

    const instr = this.children.getByName('instruction') as Phaser.GameObjects.Text;
    if (instr) instr.setText(`Ketuk: ${this.targetSymbol}`);
  }

  private onTap(text: Phaser.GameObjects.Text) {
    if (this.completed || this.quit) return;
    const mover = this.movers.find((m) => m.text === text);
    if (!mover) return;

    if (text.text === this.targetSymbol) {
      this.roundDone += 1;
      this.correct += 1;
      this.subtaskOk.push(this.roundWrongFirst === 0);
      this.roundWrongFirst = 0;
      this.tweens.add({
        targets: text,
        scale: 1.4,
        alpha: 0,
        duration: 250,
        onComplete: () => text.setScale(1).setAlpha(1),
      });
      if (this.roundDone >= this.params.objectCount) {
        this.finish(100);
        return;
      }
      this.time.delayedCall(400, () => this.startRound());
    } else {
      this.wrong += 1;
      this.roundWrongFirst += 1;
      this.cameras.main.shake(60, 0.004);
    }
  }

  update() {
    for (const m of this.movers) {
      m.text.x += (m.vx * this.game.loop.delta) / 1000;
      m.text.y += (m.vy * this.game.loop.delta) / 1000;
      if (m.text.x < m.size / 2) {
        m.text.x = m.size / 2;
        m.vx = Math.abs(m.vx);
      } else if (m.text.x > W - m.size / 2) {
        m.text.x = W - m.size / 2;
        m.vx = -Math.abs(m.vx);
      }
      if (m.text.y < 150) {
        m.text.y = 150;
        m.vy = Math.abs(m.vy);
      } else if (m.text.y > H - m.size / 2) {
        m.text.y = H - m.size / 2;
        m.vy = -Math.abs(m.vy);
      }
    }
  }

  protected onTimeUp() {
    this.finish((this.roundDone / this.params.objectCount) * 100);
  }
}
