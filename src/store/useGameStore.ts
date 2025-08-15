// Game state management using Zustand

import { create } from 'zustand';
import { Card } from '../lib/deck';
import { BiasType } from '../lib/bias';

export interface BetRow {
  id: string;
  stake: number;
  multiplier: number;
  bias: BiasType;
}

export interface RoundResult {
  coins: string;
  dice: [number, number];
  cards: [Card, Card, Card];
  pnl: number;
}

export interface MarketTrade {
  side: 'BUY' | 'SELL' | null;
  units: number;
  price: number;
  committed: number;
}

export interface GameState {
  // Core game state
  bank: number;
  currentRound: number;
  isRoundActive: boolean;
  hasCompletedRound: boolean;
  
  // UI toggles
  showProbabilities: boolean;
  showBias: boolean;
  
  // Betting stakes
  coinStakes: Record<string, number>;
  diceStakes: Record<string, number>;
  f2Stakes: Record<string, number>;
  
  // Multipliers and bias (refresh each round)
  coinTerms: Record<string, { multiplier: number; bias: BiasType }>;
  diceTerms: Record<string, { multiplier: number; bias: BiasType }>;
  f2Terms: Record<string, { multiplier: number; bias: BiasType }>;
  
  // Market state
  marketBid: number;
  marketAsk: number;
  marketTrade: MarketTrade;
  
  // Round history
  roundHistory: RoundResult[];
  
  // Actions
  setBank: (bank: number) => void;
  adjustBank: (amount: number) => void;
  
  setShowProbabilities: (show: boolean) => void;
  setShowBias: (show: boolean) => void;
  
  setCoinStake: (betId: string, stake: number) => void;
  setDiceStake: (betId: string, stake: number) => void;
  setF2Stake: (betId: string, stake: number) => void;
  
  setCoinTerms: (terms: Record<string, { multiplier: number; bias: BiasType }>) => void;
  setDiceTerms: (terms: Record<string, { multiplier: number; bias: BiasType }>) => void;
  setF2Terms: (terms: Record<string, { multiplier: number; bias: BiasType }>) => void;
  
  setMarketQuotes: (bid: number, ask: number) => void;
  setMarketTrade: (trade: MarketTrade) => void;
  
  startRound: () => void;
  endRound: (result: RoundResult) => void;
  
  getTotalStake: () => number;
  clearAllStakes: () => void;
  
  resetRoundCompletion: () => void;
  
  resetGame: () => void;
}

const INITIAL_BANK = 1000;

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  bank: INITIAL_BANK,
  currentRound: 0,
  isRoundActive: false,
  hasCompletedRound: false,
  
  showProbabilities: true,
  showBias: true,
  
  coinStakes: {},
  diceStakes: {},
  f2Stakes: {},
  
  coinTerms: {},
  diceTerms: {},
  f2Terms: {},
  
  marketBid: 21,
  marketAsk: 23,
  marketTrade: { side: null, units: 0, price: 0, committed: 0 },
  
  roundHistory: [],
  
  // Actions
  setBank: (bank: number) => set({ bank }),
  
  adjustBank: (amount: number) => set(state => ({ 
    bank: state.bank + amount 
  })),
  
  setShowProbabilities: (show: boolean) => set({ showProbabilities: show }),
  
  setShowBias: (show: boolean) => set({ showBias: show }),
  
  setCoinStake: (betId: string, stake: number) => set(state => ({
    coinStakes: { ...state.coinStakes, [betId]: Math.max(0, stake) }
  })),
  
  setDiceStake: (betId: string, stake: number) => set(state => ({
    diceStakes: { ...state.diceStakes, [betId]: Math.max(0, stake) }
  })),
  
  setF2Stake: (betId: string, stake: number) => set(state => ({
    f2Stakes: { ...state.f2Stakes, [betId]: Math.max(0, stake) }
  })),
  
  setCoinTerms: (terms: Record<string, { multiplier: number; bias: BiasType }>) => 
    set({ coinTerms: terms }),
  
  setDiceTerms: (terms: Record<string, { multiplier: number; bias: BiasType }>) => 
    set({ diceTerms: terms }),
  
  setF2Terms: (terms: Record<string, { multiplier: number; bias: BiasType }>) => 
    set({ f2Terms: terms }),
  
  setMarketQuotes: (bid: number, ask: number) => set({ 
    marketBid: bid, 
    marketAsk: ask 
  }),
  
  setMarketTrade: (trade: MarketTrade) => set({ 
    marketTrade: trade 
  }),
  
  startRound: () => set(state => ({ 
    isRoundActive: true,
    hasCompletedRound: false,
    currentRound: state.currentRound + 1
  })),
  
  endRound: (result: RoundResult) => set(state => ({
    isRoundActive: false,
    hasCompletedRound: true,
    roundHistory: [result, ...state.roundHistory.slice(0, 79)] // Keep last 80 rounds
  })),
  
  getTotalStake: () => {
    const state = get();
    const coinTotal = Object.values(state.coinStakes).reduce((sum, stake) => sum + stake, 0);
    const diceTotal = Object.values(state.diceStakes).reduce((sum, stake) => sum + stake, 0);
    const f2Total = Object.values(state.f2Stakes).reduce((sum, stake) => sum + stake, 0);
    const marketTotal = state.marketTrade.committed;
    
    return coinTotal + diceTotal + f2Total + marketTotal;
  },
  
  clearAllStakes: () => set({ 
    coinStakes: {},
    diceStakes: {},
    f2Stakes: {},
    marketTrade: { side: null, units: 0, price: 0, committed: 0 }
  }),
  
  resetRoundCompletion: () => set({
    hasCompletedRound: false
  }),
  
  resetGame: () => set({
    bank: INITIAL_BANK,
    currentRound: 0,
    isRoundActive: false,
    hasCompletedRound: false,
    coinStakes: {},
    diceStakes: {},
    f2Stakes: {},
    coinTerms: {},
    diceTerms: {},
    f2Terms: {},
    marketBid: 21,
    marketAsk: 23,
    marketTrade: { side: null, units: 0, price: 0, committed: 0 },
    roundHistory: []
  })
}));
