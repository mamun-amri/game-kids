import Phaser from 'phaser';
import type { GameBridge } from './bridge';

export const W = 640;
export const H = 760;

export const COLORS = {
  bg: 0xfff6e9,
  purple: 0x7c3aed,
  purpleDark: 0x5b21b6,
  pink: 0xec4899,
  blue: 0x38bdf8,
  green: 0x4ade80,
  greenDark: 0x16a34a,
  yellow: 0xfacc15,
  orange: 0xfb923c,
  red: 0xf87171,
  ink: 0x3b2f63,
  inkSoft: 0x8a7fb8,
  paper: 0xfffdf5,
  card: 0xffffff,
};

export const FONT = "'Baloo 2', 'Trebuchet MS', system-ui, sans-serif";

export function makeText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  content: string,
  opts: Partial<Phaser.Types.GameObjects.Text.TextStyle> = {},
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, content, {
    fontFamily: FONT,
    color: '#3b2f63',
    fontSize: '28px',
    fontStyle: 'bold',
    ...opts,
  });
}

export function makeButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  onTap: () => void,
  opts: { fill?: number; textColor?: string; fontSize?: number } = {},
): Phaser.GameObjects.Container {
  const fill = opts.fill ?? COLORS.purple;
  const g = scene.add.graphics();
  g.fillStyle(fill, 1);
  g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
  g.lineStyle(4, 0x000000, 0.14);
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2);

  const t = makeText(scene, 0, 0, label, {
    color: opts.textColor ?? '#ffffff',
    fontSize: `${opts.fontSize ?? 24}px`,
  }).setOrigin(0.5);

  const container = scene.add.container(x, y, [g, t]);
  container.setSize(w, h);
  container.setInteractive(
    new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
    Phaser.Geom.Rectangle.Contains,
  );
  container.on('pointerdown', () => {
    scene.tweens.add({
      targets: container,
      scale: 0.94,
      duration: 60,
      yoyo: true,
    });
    onTap();
  });
  container.setDepth(10);
  return container;
}

export function roundedCard(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  fill: number,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.fillStyle(fill, 1);
  g.fillRoundedRect(x, y, w, h, radius);
  g.lineStyle(3, 0x000000, 0.08);
  g.strokeRoundedRect(x, y, w, h, radius);
  return g;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.max(0, Math.floor(seconds % 60));
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function starString(n: number): string {
  return '⭐'.repeat(n) + '☆'.repeat(Math.max(0, 3 - n));
}

/** Shared HUD: quit button, level label, timer. Returns an update callback for the timer. */
export function setupHud(
  scene: Phaser.Scene,
  bridge: GameBridge,
  onTick: (timeLeft: number) => void,
) {
  const back = makeButton(scene, 48, 42, 74, 46, '✕', () => {
    bridge.onQuit();
  }, { fill: COLORS.red, fontSize: 20 });

  makeText(scene, 90, 24, `Level ${bridge.config.level}`, {
    fontSize: '18px',
    color: '#8a7fb8',
  }).setOrigin(0, 0);

  const tier = bridge.config.tier;
  const tierText = makeText(scene, 90, 44, `${tier.icon} ${tier.name}`, {
    fontSize: '14px',
    color: tier.color,
  }).setOrigin(0, 0);

  const timer = makeText(scene, 590, 40, '', {
    fontSize: '24px',
    color: '#7c3aed',
  }).setOrigin(0.5, 0.5);

  let timeLeft = bridge.config.timeLimit;
  const tick = () => {
    timeLeft = Math.max(0, timeLeft - 1);
    timer.setText(formatTime(timeLeft));
    timer.setColor(timeLeft <= 10 ? '#ef4444' : '#7c3aed');
    onTick(timeLeft);
  };

  const timerEvent = scene.time.addEvent({
    delay: 1000,
    loop: true,
    callback: tick,
  });

  return { back, tierText, timer, tick, timerEvent, timeLeft };
}
