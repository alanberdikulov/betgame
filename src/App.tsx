// Main App component with game logic and layout

import React from 'react';
import { useGameStore } from './store/useGameStore';
import { Outcome } from './components/Outcome';
import { Coins } from './components/Coins';
import { Dice } from './components/Dice';
import { Market } from './components/Market';
import { FirstTwo } from './components/FirstTwo';
import { flipCoins, rollDice } from './lib/random';
import { draw3Cards, Card, cardSum } from './lib/deck';
import { generateMultiplierAndBias } from './lib/bias';
import './styles.css';

// Import betting logic for settlement
import {
  coinPred_exactSequence, coinPred_exactKHeads, coinPred_atLeastKHeads,
  coinPred_firstIsH, coinPred_containsHH,
  dicePred_sum7, dicePred_doubles, dicePred_sumAtLeast10, dicePred_atLeastOne6,
  dicePred_oddSum, dicePred_firstGreaterSecond, dicePred_sumIn4or5,
  f2Pred_productLt50, f2Pred_sumEven, f2Pred_differentColors, f2Pred_atLeastOneFace
} from './lib/probabilities';

const COIN_PREDICATES = {
  'exact_hth': coinPred_exactSequence('HTH'),
  'exact_tht': coinPred_exactSequence('THT'),
  'exactly_2_heads': coinPred_exactKHeads(2),
  'exactly_1_head': coinPred_exactKHeads(1),
  'at_least_2_heads': coinPred_atLeastKHeads(2),
  'first_coin_h': coinPred_firstIsH,
  'contains_hh': coinPred_containsHH
};

const DICE_PREDICATES = {
  'sum_7': dicePred_sum7,
  'doubles': dicePred_doubles,
  'sum_gte_10': dicePred_sumAtLeast10,
  'at_least_one_6': dicePred_atLeastOne6,
  'odd_sum': dicePred_oddSum,
  'first_gt_second': dicePred_firstGreaterSecond,
  'sum_4_or_5': dicePred_sumIn4or5
};

const F2_PREDICATES = {
  'product_lt_50': f2Pred_productLt50,
  'sum_even': f2Pred_sumEven,
  'different_colors': f2Pred_differentColors,
  'at_least_one_face': f2Pred_atLeastOneFace
};

function App() {
  const {
    showProbabilities,
    showBias,
    setShowProbabilities,
    setShowBias,
    coinStakes,
    coinTerms,
    diceStakes,
    diceTerms,
    f2Stakes,
    f2Terms,
    marketTrade,
    bank,
    getTotalStake,
    adjustBank,
    startRound,
    endRound,
    clearAllStakes,
    resetRoundCompletion,
    setCoinTerms,
    setDiceTerms,
    setF2Terms,
    setMarketTrade
  } = useGameStore();


  const [currentCards, setCurrentCards] = React.useState<[Card, Card, Card] | undefined>();

  const handleStartRound = () => {
    const totalStake = getTotalStake();
    
    if (totalStake > bank) {
      alert('Not enough bank for these bets across all games.');
      return;
    }

    // Start the round
    startRound();
    
    // Deduct total stake from bank
    adjustBank(-totalStake);
    
    // Generate outcomes
    const coins = flipCoins(3);
    const dice = rollDice();
    const cards = draw3Cards();
    setCurrentCards(cards);
    
    // Settle each game
    const coinWins = settleCoinGame(coins);
    const diceWins = settleDiceGame(dice);
    const f2Wins = settleF2Game(cards);
    const marketPnL = settleMarket(cards);
    
    // Calculate total winnings and round P&L
    const totalWinnings = coinWins + diceWins + f2Wins;
    const roundPnL = totalWinnings + marketPnL;
    
    // Add winnings to bank
    adjustBank(totalWinnings + marketPnL + marketTrade.committed);
    
    // Record the round result and end the round
    endRound({
      coins,
      dice,
      cards,
      pnl: roundPnL
    });
  };

  const handleNextRound = () => {
    // Reset round completion flag
    resetRoundCompletion();
    
    // Refresh all terms
    refreshAllTerms();
    
    // Reset market
    setMarketTrade({ side: null, units: 0, price: 0, committed: 0 });
    
    // Clear all stakes
    clearAllStakes();
    
    // Hide cards
    setCurrentCards(undefined);
  };

  const refreshAllTerms = () => {
    // Refresh coins
    const newCoinTerms: Record<string, { multiplier: number; bias: 'fair' | 'house' | 'player' }> = {};
    Object.keys(COIN_PREDICATES).forEach(betId => {
      // Get probability from imported functions - for simplicity, use fixed values
      const probabilities = {
        'exact_hth': 1/8, 'exact_tht': 1/8, 'exactly_2_heads': 3/8, 'exactly_1_head': 3/8,
        'at_least_2_heads': 4/8, 'first_coin_h': 0.5, 'contains_hh': 3/8
      };
      const { multiplier, bias } = generateMultiplierAndBias(probabilities[betId as keyof typeof probabilities]);
      newCoinTerms[betId] = { multiplier, bias };
    });
    setCoinTerms(newCoinTerms);

    // Refresh dice
    const newDiceTerms: Record<string, { multiplier: number; bias: 'fair' | 'house' | 'player' }> = {};
    Object.keys(DICE_PREDICATES).forEach(betId => {
      const probabilities = {
        'sum_7': 6/36, 'doubles': 6/36, 'sum_gte_10': 6/36, 'at_least_one_6': 11/36,
        'odd_sum': 18/36, 'first_gt_second': 15/36, 'sum_4_or_5': 7/36
      };
      const { multiplier, bias } = generateMultiplierAndBias(probabilities[betId as keyof typeof probabilities]);
      newDiceTerms[betId] = { multiplier, bias };
    });
    setDiceTerms(newDiceTerms);

    // Refresh F2
    const newF2Terms: Record<string, { multiplier: number; bias: 'fair' | 'house' | 'player' }> = {};
    Object.keys(F2_PREDICATES).forEach(betId => {
      const probabilities = {
        'product_lt_50': 0.7843, // approximate from calculation
        'sum_even': 0.5098, 'different_colors': 0.5098, 'at_least_one_face': 0.4706
      };
      const { multiplier, bias } = generateMultiplierAndBias(probabilities[betId as keyof typeof probabilities]);
      newF2Terms[betId] = { multiplier, bias };
    });
    setF2Terms(newF2Terms);
  };

  const settleCoinGame = (outcome: string): number => {
    let winnings = 0;
    
    Object.entries(coinStakes).forEach(([betId, stake]) => {
      if (stake > 0) {
        const predicate = COIN_PREDICATES[betId as keyof typeof COIN_PREDICATES];
        const terms = coinTerms[betId];
        
        if (predicate && terms && predicate(outcome)) {
          winnings += Math.round(stake * terms.multiplier);
        }
      }
    });
    
    return winnings;
  };

  const settleDiceGame = (dice: [number, number]): number => {
    let winnings = 0;
    
    Object.entries(diceStakes).forEach(([betId, stake]) => {
      if (stake > 0) {
        const predicate = DICE_PREDICATES[betId as keyof typeof DICE_PREDICATES];
        const terms = diceTerms[betId];
        
        if (predicate && terms && predicate(dice)) {
          winnings += Math.round(stake * terms.multiplier);
        }
      }
    });
    
    return winnings;
  };

  const settleF2Game = (cards: [Card, Card, Card]): number => {
    let winnings = 0;
    
    Object.entries(f2Stakes).forEach(([betId, stake]) => {
      if (stake > 0) {
        const predicate = F2_PREDICATES[betId as keyof typeof F2_PREDICATES];
        const terms = f2Terms[betId];
        
        if (predicate && terms && predicate(cards)) {
          winnings += Math.round(stake * terms.multiplier);
        }
      }
    });
    
    return winnings;
  };

  const settleMarket = (cards: [Card, Card, Card]): number => {
    if (!marketTrade.side) return 0;
    
    const total = cardSum(cards);
    const { side, units, price } = marketTrade;
    
    let pnl: number;
    if (side === 'BUY') {
      pnl = units * (total - price);
    } else {
      pnl = units * (price - total);
    }
    
    return pnl;
  };

  return (
    <div className="app">
      {/* Toolbar */}
      <div className="toolbar">
        <label>
          <input
            type="checkbox"
            checked={showProbabilities}
            onChange={(e) => setShowProbabilities(e.target.checked)}
          />
          Show Probabilities
        </label>
        <label>
          <input
            type="checkbox"
            checked={showBias}
            onChange={(e) => setShowBias(e.target.checked)}
          />
          Show Bias
        </label>
      </div>

      {/* Main 2x2 grid */}
      <div className="main-grid">
        {/* Top-Left: Outcome */}
        <Outcome />

        {/* Top-Right: Dice */}
        <Dice />

        {/* Bottom-Left: Coins */}
        <Coins onStartRound={handleStartRound} onNextRound={handleNextRound} />

        {/* Bottom-Right: Split panel */}
        <div className="panel">
          <div className="split-panel">
            <Market 
              currentCards={currentCards}
              showCards={!!currentCards}
            />
            <FirstTwo />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
