import type { FocusMetrics, GameResult, GameLevelConfig } from '../types';

/**
 * Focus Score (BRD §8):
 *   0.4 * Akurasi + 0.3 * Konsistensi + 0.2 * Kecepatan + 0.1 * Penyelesaian
 */
export function computeFocusScore(result: GameResult, config: GameLevelConfig): FocusMetrics {
  const totalMoves = result.correct + result.wrong;
  const accuracy = totalMoves === 0 ? 0 : Math.round((result.correct / totalMoves) * 100);

  const consistency =
    result.subtaskOk.length === 0
      ? accuracy
      : Math.round(
          (result.subtaskOk.filter(Boolean).length / result.subtaskOk.length) * 100,
        );

  let speed: number;
  if (result.quitEarly) {
    speed = Math.round(result.completionPct * 0.5);
  } else if (result.parTimeMs <= 0) {
    speed = 100;
  } else {
    speed = Math.round(clamp01((config.parTimeMs / result.timeMs) * 100));
  }

  const completion = Math.round(result.completionPct);

  const score = Math.round(
    accuracy * 0.4 + consistency * 0.3 + speed * 0.2 + completion * 0.1,
  );

  const stars =
    score >= config.starsGuide.three ? 3 : score >= config.starsGuide.two ? 2 : score >= config.starsGuide.one ? 1 : 0;

  return { accuracy, consistency, speed, completion, score, stars };
}

function clamp01(n: number) {
  return Math.max(0, Math.min(100, n));
}
