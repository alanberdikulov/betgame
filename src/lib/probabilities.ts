// Probability calculations and predicates for all betting games

import { Card, RED_SUITS } from './deck';

// ==================== COINS ====================

export function coinProb_exactSequence(_sequence: string): number {
  return 1 / 8;
}

export function coinPred_exactSequence(sequence: string) {
  return (outcome: string) => outcome === sequence;
}

export function coinProb_exactKHeads(k: number): number {
  // C(3,k) / 8
  const combinations = {
    0: 1, // TTT
    1: 3, // HTT, THT, TTH
    2: 3, // HHT, HTH, THH
    3: 1  // HHH
  };
  return (combinations[k as keyof typeof combinations] || 0) / 8;
}

export function coinPred_exactKHeads(k: number) {
  return (outcome: string) => outcome.split('').filter(c => c === 'H').length === k;
}

export function coinProb_atLeastKHeads(k: number): number {
  let total = 0;
  for (let i = k; i <= 3; i++) {
    total += coinProb_exactKHeads(i);
  }
  return total;
}

export function coinPred_atLeastKHeads(k: number) {
  return (outcome: string) => outcome.split('').filter(c => c === 'H').length >= k;
}

export function coinProb_firstIsH(): number {
  return 0.5;
}

export function coinPred_firstIsH(outcome: string): boolean {
  return outcome[0] === 'H';
}

export function coinProb_containsHH(): number {
  return 3 / 8; // HHT, HHH, THH
}

export function coinPred_containsHH(outcome: string): boolean {
  return outcome.includes('HH');
}

// ==================== DICE ====================

export function diceProb_sum7(): number {
  return 6 / 36; // (1,6), (2,5), (3,4), (4,3), (5,2), (6,1)
}

export function dicePred_sum7(dice: [number, number]): boolean {
  return dice[0] + dice[1] === 7;
}

export function diceProb_doubles(): number {
  return 6 / 36; // (1,1), (2,2), (3,3), (4,4), (5,5), (6,6)
}

export function dicePred_doubles(dice: [number, number]): boolean {
  return dice[0] === dice[1];
}

export function diceProb_sumAtLeast10(): number {
  return 6 / 36; // (4,6), (5,5), (5,6), (6,4), (6,5), (6,6)
}

export function dicePred_sumAtLeast10(dice: [number, number]): boolean {
  return dice[0] + dice[1] >= 10;
}

export function diceProb_atLeastOne6(): number {
  return 11 / 36; // 6*2 - 1 (subtract the (6,6) double count)
}

export function dicePred_atLeastOne6(dice: [number, number]): boolean {
  return dice[0] === 6 || dice[1] === 6;
}

export function diceProb_oddSum(): number {
  return 18 / 36; // Half of all combinations
}

export function dicePred_oddSum(dice: [number, number]): boolean {
  return (dice[0] + dice[1]) % 2 === 1;
}

export function diceProb_firstGreaterSecond(): number {
  return 15 / 36; // All (i,j) where i > j
}

export function dicePred_firstGreaterSecond(dice: [number, number]): boolean {
  return dice[0] > dice[1];
}

export function diceProb_sumIn4or5(): number {
  return 7 / 36; // sum=4: (1,3), (2,2), (3,1); sum=5: (1,4), (2,3), (3,2), (4,1)
}

export function dicePred_sumIn4or5(dice: [number, number]): boolean {
  const sum = dice[0] + dice[1];
  return sum === 4 || sum === 5;
}

// ==================== 2 CARDS ====================

export function f2Prob_productLt50(): number {
  // Calculate exact probability for product of first 2 cards < 50
  // considering no replacement from 52-card deck
  let favorable = 0;
  const total = 52 * 51;
  
  for (let r1 = 1; r1 <= 13; r1++) {
    for (let r2 = 1; r2 <= 13; r2++) {
      if (r1 * r2 < 50) {
        if (r1 === r2) {
          // Same rank: 4 * 3 = 12 ways
          favorable += 12;
        } else {
          // Different ranks: 4 * 4 = 16 ways
          favorable += 16;
        }
      }
    }
  }
  
  return favorable / total;
}

export function f2Pred_productLt50(cards: Card[]): boolean {
  return cards[0].rank * cards[1].rank < 50;
}

export function f2Prob_sumEven(): number {
  // Two cards have even sum if both are even or both are odd
  // Even ranks: 2,4,6,8,10,12 (6 ranks × 4 suits = 24 cards)
  // Odd ranks: 1,3,5,7,9,11,13 (7 ranks × 4 suits = 28 cards)
  const evenCards = 24, oddCards = 28, totalCards = 52;
  
  const evenEven = (evenCards / totalCards) * ((evenCards - 1) / (totalCards - 1));
  const oddOdd = (oddCards / totalCards) * ((oddCards - 1) / (totalCards - 1));
  
  return evenEven + oddOdd;
}

export function f2Pred_sumEven(cards: Card[]): boolean {
  return (cards[0].rank + cards[1].rank) % 2 === 0;
}

export function f2Prob_differentColors(): number {
  // First card: any color (52/52)
  // Second card: opposite color (26/51)
  return 26 / 51;
}

export function f2Pred_differentColors(cards: Card[]): boolean {
  const card1IsRed = RED_SUITS.has(cards[0].suit);
  const card2IsRed = RED_SUITS.has(cards[1].suit);
  return card1IsRed !== card2IsRed;
}

export function f2Prob_atLeastOneFace(): number {
  // Face cards: J(11), Q(12), K(13) = 3 ranks × 4 suits = 12 cards
  // Non-face cards: 40 cards
  // Probability = 1 - P(both non-face)
  return 1 - (40 / 52) * (39 / 51);
}

export function f2Pred_atLeastOneFace(cards: Card[]): boolean {
  return cards[0].rank >= 11 || cards[1].rank >= 11;
}
