// Deck and card utilities

export type Suit = 'H' | 'D' | 'C' | 'S';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
export type Card = { rank: Rank; suit: Suit };

const SUITS: Suit[] = ['H', 'D', 'C', 'S'];
const RANKS: Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export const SUIT_SYMBOLS = {
  H: '♥',
  D: '♦', 
  C: '♣',
  S: '♠'
} as const;

export const SUIT_COLORS = {
  H: '#dc2626', // red
  D: '#dc2626', // red
  C: '#111827', // black
  S: '#111827'  // black
} as const;

export const RED_SUITS: Set<Suit> = new Set(['H', 'D']);

export function rankText(rank: Rank): string {
  switch (rank) {
    case 1: return 'A';
    case 11: return 'J';
    case 12: return 'Q';
    case 13: return 'K';
    default: return rank.toString();
  }
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

// Shuffle array in place using Fisher-Yates algorithm
function shuffleInPlace<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Draw 3 cards without replacement
export function draw3Cards(): [Card, Card, Card] {
  const deck = createDeck();
  shuffleInPlace(deck);
  return [deck[0], deck[1], deck[2]];
}

export function isRedCard(card: Card): boolean {
  return RED_SUITS.has(card.suit);
}

export function cardSum(cards: Card[]): number {
  return cards.reduce((sum, card) => sum + card.rank, 0);
}
