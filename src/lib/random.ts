// Random number generation utilities

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomChoiceWeighted<T>(choices: T[], weights: number[]): T {
  if (choices.length !== weights.length) {
    throw new Error('Choices and weights arrays must have the same length');
  }
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < choices.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return choices[i];
    }
  }
  
  return choices[choices.length - 1];
}

export function flipCoins(count: number): string {
  return Array.from({ length: count }, () => Math.random() < 0.5 ? 'H' : 'T').join('');
}

export function rollDice(): [number, number] {
  return [randomInt(1, 6), randomInt(1, 6)];
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
