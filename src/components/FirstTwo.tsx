// FirstTwo (2 Cards) component - betting on first two cards from the shared 3-card deal

import React, { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { formatMultiplier, formatProbability } from '../lib/format';
import { BIAS_DISPLAY, generateMultiplierAndBias } from '../lib/bias';
import {
  f2Prob_productLt50, f2Pred_productLt50,
  f2Prob_sumEven, f2Pred_sumEven,
  f2Prob_differentColors, f2Pred_differentColors,
  f2Prob_atLeastOneFace, f2Pred_atLeastOneFace
} from '../lib/probabilities';
import { Card } from '../lib/deck';

interface F2Bet {
  id: string;
  label: string;
  probability: number;
  predicate: (cards: Card[]) => boolean;
}

const F2_BETS: F2Bet[] = [
  {
    id: 'product_lt_50',
    label: 'Product of first 2 < 50',
    probability: f2Prob_productLt50(),
    predicate: f2Pred_productLt50
  },
  {
    id: 'sum_even',
    label: 'Sum of first 2 is even',
    probability: f2Prob_sumEven(),
    predicate: f2Pred_sumEven
  },
  {
    id: 'different_colors',
    label: 'Different colors',
    probability: f2Prob_differentColors(),
    predicate: f2Pred_differentColors
  },
  {
    id: 'at_least_one_face',
    label: 'At least one face card',
    probability: f2Prob_atLeastOneFace(),
    predicate: f2Pred_atLeastOneFace
  }
];

export const FirstTwo: React.FC = () => {
  const {
    showProbabilities,
    showBias,
    f2Stakes,
    f2Terms,
    setF2Stake,
    setF2Terms,
    isRoundActive
  } = useGameStore();

  // Initialize terms on mount
  useEffect(() => {
    refreshTerms();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshTerms = () => {
    const newTerms: Record<string, { multiplier: number; bias: 'fair' | 'house' | 'player' }> = {};
    
    F2_BETS.forEach(bet => {
      const { multiplier, bias } = generateMultiplierAndBias(bet.probability);
      newTerms[bet.id] = { multiplier, bias };
    });
    
    setF2Terms(newTerms);
  };

  const handleStakeChange = (betId: string, value: string) => {
    const stake = parseInt(value) || 0;
    setF2Stake(betId, stake);
  };

  const getTableClassName = () => {
    let className = 'betting-table';
    if (!showProbabilities && !showBias) className += ' hide-both';
    else if (!showProbabilities) className += ' hide-prob';
    else if (!showBias) className += ' hide-bias';
    return className;
  };

  return (
    <div className="split-bottom">
      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
        2 Cards
        <span style={{ fontWeight: 'normal', fontSize: '11px', color: '#9ca3af', marginLeft: '6px' }}>
          (Bets on the first two cards of the shared 3-card deal)
        </span>
      </h3>
      
      <div className={getTableClassName()} style={{ fontSize: '12px' }}>
        {/* Headers */}
        <div className="table-header">Bet Type</div>
        {showProbabilities && <div className="table-header">Prob.</div>}
        <div className="table-header">Payout</div>
        {showBias && <div className="table-header">Bias</div>}
        <div className="table-header">Stake</div>
        
        {/* Betting rows */}
        {F2_BETS.map(bet => {
          const stake = f2Stakes[bet.id] || 0;
          const terms = f2Terms[bet.id];
          
          return (
            <React.Fragment key={bet.id}>
              <div className="table-row bet-label" style={{ fontSize: '11px' }}>{bet.label}</div>
              {showProbabilities && (
                <div className="table-row probability" style={{ fontSize: '10px' }}>
                  {formatProbability(bet.probability)}
                </div>
              )}
              <div className="table-row multiplier" style={{ fontSize: '11px' }}>
                {terms ? formatMultiplier(terms.multiplier) : '—'}
              </div>
              {showBias && (
                <div className="table-row">
                  {terms && (
                    <span 
                      className={`bias-badge bias-${terms.bias}`}
                      style={{ 
                        backgroundColor: BIAS_DISPLAY[terms.bias].color,
                        fontSize: '10px',
                        padding: '1px 4px',
                        minWidth: '40px'
                      }}
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
                  style={{ width: '70px', fontSize: '12px' }}
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
