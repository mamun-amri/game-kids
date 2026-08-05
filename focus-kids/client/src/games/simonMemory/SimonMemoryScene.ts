import Phaser from 'phaser';
import { BaseGameScene } from '../core/BaseGameScene';
import { getParams } from '../core/bridge';
import { COLORS, FONT, H, W, makeText } from '../core/sceneUtils';
import { makeRng } from '../../lib/tiers';
import type { SimonMemoryParams } from '../../lib/levelGen';

const PADS = [
  { key: 'red', color: 0xef4444, light: 0xfca5a5 },
  { key: 'blue', color: 0x3b82f6, light: 0x93c5fd },
  { key: 'green', color: 0x22c55e, light: 0x86efac },
  { key: 'yellow', color: 0xfacc15, light: 0xfde68a },
];

export class SimonMemoryScene extends BaseGameScene {
  readonly gameKey = 'simon_memory' as const;

  private params!: SimonMemoryParams;
  private pads: Phaser.GameObjects.Rectangle[] = [];
  private sequence: string[] = [];
  private round = 0;
  private userIndex = 0;
  private accepting = false;
  private roundComplete = 0;

  startLevel() {
    this.params = getParams<SimonMemoryParams>(this.bridge);
    const rng = makeRng(this.gameKey, this.bridge.config.level);
    const padCount = this.params.sequenceLength <= 4 ? 2 : this.params.sequenceLength <= 8 ? 3 : 4;
    const activePads = PADS.slice(0, padCount);

    makeText(this, W / 2, 96, 'Ingat urutannya!', {
      fontSize: '22px',
      color: '#8a7fb8',
    }).setOrigin(0.5);

    this.sequence = Array.from({ length: this.params.sequenceLength }, () =>
      activePads[Math.floor(rng() * activePads.length)].key,
    );

    const gap = 18;
    const size = 200;
    const startX = W / 2 - (padCount % 2 === 0 ? (size * 2 + gap) / 2 : size / 2);
    const startY = 200;

    activePads.forEach((pad, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const rect = this.add
        .rectangle(
          startX + col * (size + gap) + size / 2,
          startY + row * (size + gap) + size / 2,
          size,
          size,
          pad.color,
        )
        .setStrokeStyle(5, 0xffffff)
        .setInteractive({ useHandCursor: true });

      rect.setData('pad', pad);
      rect.on('pointerdown', () => this.onPadTap(pad.key));
      this.pads.push(rect);
    });

    this.time.delayedCall(600, () => this.playSequence());
  }

  private flashPad(pad: string, onDone?: () => void) {
    const padDef = PADS.find((p) => p.key === pad)!;
    const rect = this.pads.find((r) => (r.getData('pad') as typeof padDef).key === pad);
    if (!rect) {
      onDone?.();
      return;
    }
    rect.setFillStyle(padDef.light);
    this.time.delayedCall(this.params.speedMs / 2, () => {
      rect.setFillStyle(padDef.color);
      onDone?.();
    });
  }

  private playSequence() {
    this.accepting = false;
    this.userIndex = 0;
    let idx = 0;
    const step = () => {
      if (this.completed || this.quit) return;
      if (idx >= this.round + 1) {
        this.accepting = true;
        return;
      }
      this.flashPad(this.sequence[idx], () => {
        this.time.delayedCall(this.params.speedMs / 3, step);
      });
      idx += 1;
    };
    step();
  }

  private onPadTap(key: string) {
    if (!this.accepting || this.completed || this.quit) return;

    const padDef = PADS.find((p) => p.key === key)!;
    const rect = this.pads.find((r) => (r.getData('pad') as typeof padDef).key === key);
    if (rect) this.flashPad(key);

    if (key === this.sequence[this.userIndex]) {
      this.userIndex += 1;
      if (this.userIndex >= this.round + 1) {
        this.roundComplete += 1;
        this.correct += 1;
        this.subtaskOk.push(true);
        if (this.roundComplete >= this.sequence.length) {
          this.finish(100);
          return;
        }
        this.round += 1;
        this.time.delayedCall(600, () => this.playSequence());
      }
    } else {
      this.wrong += 1;
      this.subtaskOk.push(false);
      this.cameras.main.shake(60, 0.004);
      this.accepting = false;
      this.time.delayedCall(700, () => this.playSequence());
    }
  }

  protected onTimeUp() {
    this.finish((this.roundComplete / this.sequence.length) * 100);
  }
}
