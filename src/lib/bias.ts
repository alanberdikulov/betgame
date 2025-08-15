// Bias and multiplier calculations

import { randomChoiceWeighted, randomFloat } from './random';

export type BiasType = 'fair' | 'house' | 'player';

export const BIAS_RANGES = {
  fair: { min: 0.98, max: 1.02 },
  house: { min: 0.80, max: 0.95 },
  player: { min: 1.05, max: 1.25 }
} as const;

export const BIAS_WEIGHTS = {
  fair: 0.45,
  house: 0.35,
  player: 0.20
} as const;

export const BIAS_DISPLAY = {
  fair: { text: 'Fair', color: '#6b7280' },
  house: { text: 'House', color: '#dc2626' },
  player: { text: 'Player', color: '#16a34a' }
} as const;

export function fairMultiplier(probability: number): number {
  return Math.max(1.1, 1 / probability);
}

export function generateBias(): BiasType {
  const choices: BiasType[] = ['fair', 'house', 'player'];
  const weights = [BIAS_WEIGHTS.fair, BIAS_WEIGHTS.house, BIAS_WEIGHTS.player];
  return randomChoiceWeighted(choices, weights);
}

export function biasMultiplier(fairBase: number, bias: BiasType): number {
  const range = BIAS_RANGES[bias];
  const factor = randomFloat(range.min, range.max);
  return Math.max(1.1, Math.round((fairBase * factor) * 10) / 10);
}

export function generateMultiplierAndBias(probability: number): { multiplier: number; bias: BiasType } {
  const bias = generateBias();
  const fairBase = fairMultiplier(probability);
  const multiplier = biasMultiplier(fairBase, bias);
  return { multiplier, bias };
}
