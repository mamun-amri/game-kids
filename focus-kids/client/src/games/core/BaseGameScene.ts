import Phaser from 'phaser';
import type { GameType } from '../../types';
import type { GameBridge } from './bridge';
import { COLORS, FONT, H, W, formatTime, makeButton, makeText } from './sceneUtils';

export abstract class BaseGameScene extends Phaser.Scene {
  bridge!: GameBridge;
  abstract readonly gameKey: GameType;

  protected abstract startLevel(): void;

  protected correct = 0;
  protected wrong = 0;
  protected subtaskOk: boolean[] = [];
  protected startTime = 0;
  protected completed = false;
  protected quit = false;
  protected remaining = 0;
  protected timerText?: Phaser.GameObjects.Text;
  protected timerEvent?: Phaser.Time.TimerEvent;

  init(bridge: GameBridge) {
    this.bridge = bridge;
  }

  create() {
    this.startTime = Date.now();
    this.remaining = this.bridge.config.timeLimit;
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.buildHud();
    this.startLevel();
  }

  private buildHud() {
    const { config } = this.bridge;
    makeButton(this, 48, 42, 74, 46, '✕', () => this.quitGame(), {
      fill: COLORS.red,
      fontSize: 20,
    });

    makeText(this, 90, 22, `Level ${config.level}`, {
      fontSize: '18px',
      color: '#8a7fb8',
    }).setOrigin(0, 0);

    makeText(this, 90, 44, `${config.tier.icon} ${config.tier.name}`, {
      fontSize: '14px',
      color: config.tier.color,
    }).setOrigin(0, 0);

    this.timerText = makeText(this, 590, 36, formatTime(this.remaining), {
      fontSize: '24px',
      color: '#7c3aed',
    }).setOrigin(0.5, 0.5);

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.remaining = Math.max(0, this.remaining - 1);
        this.timerText?.setText(formatTime(this.remaining));
        this.timerText?.setColor(this.remaining <= 10 ? '#ef4444' : '#7c3aed');
        this.onHudTick(this.remaining);
        if (this.remaining === 0) this.onTimeUp();
      },
    });
  }

  /** Subclass hook: called every second with remaining seconds. */
  protected onHudTick(_remaining: number) {}

  /** Subclass hook: called when the timer hits zero. */
  protected onTimeUp() {}

  protected finish(completionPct: number) {
    if (this.completed || this.quit) return;
    this.completed = true;
    this.timerEvent?.remove(false);
    this.bridge.onFinish({
      gameType: this.gameKey,
      level: this.bridge.config.level,
      correct: this.correct,
      wrong: this.wrong,
      timeMs: Date.now() - this.startTime,
      parTimeMs: this.bridge.config.parTimeMs,
      completionPct,
      subtaskOk: this.subtaskOk,
      isDaily: this.bridge.isDaily,
    });
  }

  protected quitGame() {
    if (this.completed || this.quit) return;
    this.quit = true;
    this.timerEvent?.remove(false);
    this.bridge.onQuit();
  }

  protected drawBackground() {
    this.add.rectangle(0, 0, W, H, COLORS.bg).setOrigin(0).setDepth(-10);
  }
}
