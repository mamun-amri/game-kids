import Phaser from 'phaser';
import { BaseGameScene } from '../core/BaseGameScene';
import { getParams } from '../core/bridge';
import { COLORS, FONT, H, W, makeText } from '../core/sceneUtils';
import { makeRng, shuffle } from '../../lib/tiers';
import type { MemoryMatchParams } from '../../lib/levelGen';

const SYMBOLS = [
  '🍎', '🍌', '🍇', '🍓', '🐶', '🐱', '🦊', '🐼',
  '🚗', '✈️', '🌵', '🌻', '⚽', '🎈', '🎁', '🍪',
  '🐟', '🦋', '🎸', '🌈',
];

interface Card {
  container: Phaser.GameObjects.Container;
  back: Phaser.GameObjects.Graphics;
  question: Phaser.GameObjects.Text;
  front: Phaser.GameObjects.Text;
  symbol: string;
  flipped: boolean;
  matched: boolean;
  /** true while a flip animation is in progress to block conflicting taps. */
  busy: boolean;
}

export class MemoryMatchScene extends BaseGameScene {
  readonly gameKey = 'memory_match' as const;

  private params!: MemoryMatchParams;
  private cards: Card[] = [];
  private flipped: Card[] = [];
  private locked = false;
  private wrongFlips = 0;
  private firstTryWrong = 0;
  private matchedCount = 0;

  startLevel() {
    this.params = getParams<MemoryMatchParams>(this.bridge);
    const rng = makeRng(this.gameKey, this.bridge.config.level);

    const symbols = shuffle(SYMBOLS, rng).slice(0, this.params.pairs);
    const deck: string[] = [];
    for (const s of symbols) {
      deck.push(s, s);
    }
    const shuffled = shuffle(deck, rng);

    this.buildGrid(shuffled);
    makeText(this, W / 2, 90, 'Cari pasangan kartu yang sama!', {
      fontSize: '20px',
      color: '#8a7fb8',
    }).setOrigin(0.5);
  }

  private buildGrid(deck: string[]) {
    const { cols, rows } = this.params;
    const marginX = 20;
    const gap = 12;
    const top = 130;
    const bottom = H - 30;
    const cardW = (W - marginX * 2 - gap * (cols - 1)) / cols;
    const cardH = Math.min((bottom - top - gap * (rows - 1)) / rows, cardW * 1.15);
    const totalH = cardH * rows + gap * (rows - 1);
    const startY = top + (bottom - top - totalH) / 2;

    deck.forEach((symbol, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = marginX + col * (cardW + gap) + cardW / 2;
      const y = startY + row * (cardH + gap) + cardH / 2;
      const card = this.makeCard(x, y, cardW, cardH, symbol);
      this.cards.push(card);
    });
  }

  private makeCard(
    x: number,
    y: number,
    w: number,
    h: number,
    symbol: string,
  ): Card {
    const back = this.add.graphics();
    back.fillStyle(COLORS.purple, 1);
    back.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    back.lineStyle(4, COLORS.purpleDark, 1);
    back.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

    const q = this.add
      .text(0, 0, '❓', { fontFamily: FONT, fontSize: `${Math.min(w, h) * 0.5}px` })
      .setOrigin(0.5);

    const front = this.add
      .text(0, 0, symbol, { fontFamily: FONT, fontSize: `${Math.min(w, h) * 0.55}px` })
      .setOrigin(0.5)
      .setVisible(false);

    const container = this.add.container(x, y, [back, q, front]);
    container.setSize(w, h);
    // Note: Phaser shifts the hit-area rect by displayOrigin (width/2) for
    // containers, so the rect must start at (0,0) to cover the visual card.
    container.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, w, h),
      Phaser.Geom.Rectangle.Contains,
    );
    container.on('pointerdown', () => this.onCardTap(container));

    return {
      container,
      back,
      question: q,
      front,
      symbol,
      flipped: false,
      matched: false,
      busy: false,
    };
  }

  private onCardTap(container: Phaser.GameObjects.Container) {
    if (this.locked || this.completed || this.quit) return;
    const card = this.cards.find((c) => c.container === container);
    if (!card || card.flipped || card.matched || card.busy) return;

    this.flipCard(card, true);
    this.flipped.push(card);

    if (this.flipped.length === 2) {
      this.locked = true;
      this.time.delayedCall(380, () => this.checkMatch());
    }
  }

  private flipCard(card: Card, showFront: boolean) {
    if (card.busy) return;
    card.busy = true;
    card.flipped = showFront;

    this.tweens.add({
      targets: card.container,
      scaleX: 0.06,
      duration: 85,
      onComplete: () => {
        card.back.setVisible(!showFront);
        card.question.setVisible(!showFront);
        card.front.setVisible(showFront);
        this.tweens.add({
          targets: card.container,
          scaleX: 1,
          duration: 85,
          onComplete: () => {
            card.busy = false;
          },
        });
      },
    });
  }

  private checkMatch() {
    const [a, b] = this.flipped;
    this.flipped = [];
    this.locked = false;

    if (a.symbol === b.symbol) {
      a.matched = true;
      b.matched = true;
      this.matchedCount += 1;
      this.correct += 1;
      this.subtaskOk.push(this.wrongFlips === this.firstTryWrong);
      this.firstTryWrong = this.wrongFlips;
      this.celebrate(a.container);
      this.celebrate(b.container);
      if (this.matchedCount === this.params.pairs) {
        this.finish(100);
      }
    } else {
      this.wrong += 1;
      this.wrongFlips += 1;
      this.time.delayedCall(200, () => {
        this.flipCard(a, false);
        this.flipCard(b, false);
      });
    }
  }

  private celebrate(container: Phaser.GameObjects.Container) {
    this.tweens.add({
      targets: container,
      scale: 1.12,
      duration: 120,
      yoyo: true,
    });
    const star = this.add
      .text(container.x, container.y, '✨', {
        fontFamily: FONT,
        fontSize: '40px',
      })
      .setOrigin(0.5)
      .setDepth(20);
    this.tweens.add({
      targets: star,
      y: star.y - 40,
      alpha: 0,
      duration: 600,
      onComplete: () => star.destroy(),
    });
  }

  protected onTimeUp() {
    const completion = (this.matchedCount / this.params.pairs) * 100;
    this.finish(completion);
  }
}
