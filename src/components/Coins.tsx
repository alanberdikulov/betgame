// Coins game component - 3 coin flips with 7 betting options

import React, { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { formatMoney, formatMultiplier, formatProbability } from '../lib/format';
import { BIAS_DISPLAY, generateMultiplierAndBias } from '../lib/bias';
import {
  coinProb_exactSequence, coinPred_exactSequence,
  coinProb_exactKHeads, coinPred_exactKHeads,
  coinProb_atLeastKHeads, coinPred_atLeastKHeads,
  coinProb_firstIsH, coinPred_firstIsH,
  coinProb_containsHH, coinPred_containsHH
} from '../lib/probabilities';

interface CoinBet {
  id: string;
  label: string;
  probability: number;
  predicate: (outcome: string) => boolean;
}

const COIN_BETS: CoinBet[] = [
  {
    id: 'exact_hth',
    label: 'Exact order HTH',
    probability: coinProb_exactSequence('HTH'),
    predicate: coinPred_exactSequence('HTH')
  },
  {
    id: 'exact_tht',
    label: 'Exact order THT',
    probability: coinProb_exactSequence('THT'),
    predicate: coinPred_exactSequence('THT')
  },
  {
    id: 'exactly_2_heads',
    label: 'Exactly 2 heads',
    probability: coinProb_exactKHeads(2),
    predicate: coinPred_exactKHeads(2)
  },
  {
    id: 'exactly_1_head',
    label: 'Exactly 1 head',
    probability: coinProb_exactKHeads(1),
    predicate: coinPred_exactKHeads(1)
  },
  {
    id: 'at_least_2_heads',
    label: 'At least 2 heads',
    probability: coinProb_atLeastKHeads(2),
    predicate: coinPred_atLeastKHeads(2)
  },
  {
    id: 'first_coin_h',
    label: 'First coin is H',
    probability: coinProb_firstIsH(),
    predicate: coinPred_firstIsH
  },
  {
    id: 'contains_hh',
    label: 'Contains HH (consecutive)',
    probability: coinProb_containsHH(),
    predicate: coinPred_containsHH
  }
];

interface CoinsProps {
  onStartRound: () => void;
  onNextRound: () => void;
}

export const Coins: React.FC<CoinsProps> = ({ onStartRound, onNextRound }) => {
  const {
    showProbabilities,
    showBias,
    coinStakes,
    coinTerms,
    setCoinStake,
    setCoinTerms,
    isRoundActive,
    hasCompletedRound,
    bank,
    getTotalStake
  } = useGameStore();

  // Initialize coin terms on mount and refresh them when needed
  useEffect(() => {
    refreshTerms();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshTerms = () => {
    const newTerms: Record<string, { multiplier: number; bias: 'fair' | 'house' | 'player' }> = {};
    
    COIN_BETS.forEach(bet => {
      const { multiplier, bias } = generateMultiplierAndBias(bet.probability);
      newTerms[bet.id] = { multiplier, bias };
    });
    
    setCoinTerms(newTerms);
  };

  const handleStakeChange = (betId: string, value: string) => {
    const stake = parseInt(value) || 0;
    setCoinStake(betId, stake);
  };

  const getTableClassName = () => {
    let className = 'betting-table';
    if (!showProbabilities && !showBias) className += ' hide-both';
    else if (!showProbabilities) className += ' hide-prob';
    else if (!showBias) className += ' hide-bias';
    return className;
  };

  const totalStake = getTotalStake();
  const alreadyBet = totalStake;
  const leftToBet = Math.max(0, bank - totalStake);

  return (
    <div className="panel">
      <h2 className="panel-title">Flipping 3 coins</h2>
      
      <div className={getTableClassName()}>
        {/* Headers */}
        <div className="table-header">Bet Type</div>
        {showProbabilities && <div className="table-header">Prob.</div>}
        <div className="table-header">Payout</div>
        {showBias && <div className="table-header">Bias</div>}
        <div className="table-header">Stake</div>
        
        {/* Betting rows */}
        {COIN_BETS.map(bet => {
          const stake = coinStakes[bet.id] || 0;
          const terms = coinTerms[bet.id];
          
          return (
            <React.Fragment key={bet.id}>
              <div className="table-row bet-label">{bet.label}</div>
              {showProbabilities && (
                <div className="table-row probability">
                  {formatProbability(bet.probability)}
                </div>
              )}
              <div className="table-row multiplier">
                {terms ? formatMultiplier(terms.multiplier) : '—'}
              </div>
              {showBias && (
                <div className="table-row">
                  {terms && (
                    <span 
                      className={`bias-badge bias-${terms.bias}`}
                      style={{ backgroundColor: BIAS_DISPLAY[terms.bias].color }}
                    >
                      {BIAS_DISPLAY[terms.bias].text}
                    </span>
                  )}
                </div>
              )}
              <div className="table-row">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={stake}
                  onChange={(e) => handleStakeChange(bet.id, e.target.value)}
                  className="stake-input"
                  disabled={isRoundActive}
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>
      

      
      {/* Status strip */}
      <div className="status-strip bank-status">
        <div className="bank-info">
          <div className="status-item">
            <span>Amount already bet</span>
            <span className="status-value">{formatMoney(alreadyBet)}</span>
          </div>
          <div className="status-item">
            <span>amount to left to bet</span>
            <span className="status-value">{formatMoney(leftToBet)}</span>
          </div>
          <div className="status-item">
            <span>Total bank</span>
            <span className="status-value">{formatMoney(bank)}</span>
          </div>
        </div>
        
        <div className="bank-buttons">
          <button
            className="btn btn-primary"
            onClick={onStartRound}
            disabled={isRoundActive || hasCompletedRound}
            title={`Round active: ${isRoundActive}, Completed: ${hasCompletedRound}`}
          >
            Start the game
          </button>
          <button
            className="btn btn-success"
            onClick={onNextRound}
            disabled={!hasCompletedRound}
            title={`Round active: ${isRoundActive}, Completed: ${hasCompletedRound}`}
          >
            Next {!hasCompletedRound ? '(disabled)' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
