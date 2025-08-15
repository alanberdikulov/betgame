// Formatting utilities

export function formatMoney(amount: number): string {
  return `$${Math.round(amount)}`;
}

export function formatMultiplier(multiplier: number): string {
  return `${multiplier.toFixed(1)}×`;
}

export function formatProbability(probability: number): string {
  return `P=${probability.toFixed(3)}`;
}

export const DICE_FACES = {
  1: '⚀',
  2: '⚁', 
  3: '⚂',
  4: '⚃',
  5: '⚄',
  6: '⚅'
} as const;
