// Dice game component - 2 dice with 7 betting options

import React, { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { formatMultiplier, formatProbability } from '../lib/format';
import { BIAS_DISPLAY, generateMultiplierAndBias } from '../lib/bias';
import {
  diceProb_sum7, dicePred_sum7,
  diceProb_doubles, dicePred_doubles,
  diceProb_sumAtLeast10, dicePred_sumAtLeast10,
  diceProb_atLeastOne6, dicePred_atLeastOne6,
  diceProb_oddSum, dicePred_oddSum,
  diceProb_firstGreaterSecond, dicePred_firstGreaterSecond,
  diceProb_sumIn4or5, dicePred_sumIn4or5
} from '../lib/probabilities';

interface DiceBet {
  id: string;
  label: string;
  probability: number;
  predicate: (dice: [number, number]) => boolean;
}

const DICE_BETS: DiceBet[] = [
  {
    id: 'sum_7',
    label: 'Sum is 7',
    probability: diceProb_sum7(),
    predicate: dicePred_sum7
  },
  {
    id: 'doubles',
    label: 'Doubles',
    probability: diceProb_doubles(),
    predicate: dicePred_doubles
  },
  {
    id: 'sum_gte_10',
    label: 'Sum ≥ 10',
    probability: diceProb_sumAtLeast10(),
    predicate: dicePred_sumAtLeast10
  },
  {
    id: 'at_least_one_6',
    label: 'At least one 6',
    probability: diceProb_atLeastOne6(),
    predicate: dicePred_atLeastOne6
  },
  {
    id: 'odd_sum',
    label: 'Odd sum',
    probability: diceProb_oddSum(),
    predicate: dicePred_oddSum
  },
  {
    id: 'first_gt_second',
    label: 'First die > second',
    probability: diceProb_firstGreaterSecond(),
    predicate: dicePred_firstGreaterSecond
  },
  {
    id: 'sum_4_or_5',
    label: 'Sum in {4,5}',
    probability: diceProb_sumIn4or5(),
    predicate: dicePred_sumIn4or5
  }
];

export const Dice: React.FC = () => {
  const {
    showProbabilities,
    showBias,
    diceStakes,
    diceTerms,
    setDiceStake,
    setDiceTerms,
    isRoundActive
  } = useGameStore();

  // Initialize dice terms on mount
  useEffect(() => {
    refreshTerms();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshTerms = () => {
    const newTerms: Record<string, { multiplier: number; bias: 'fair' | 'house' | 'player' }> = {};
    
    DICE_BETS.forEach(bet => {
      const { multiplier, bias } = generateMultiplierAndBias(bet.probability);
      newTerms[bet.id] = { multiplier, bias };
    });
    
    setDiceTerms(newTerms);
  };

  const handleStakeChange = (betId: string, value: string) => {
    const stake = parseInt(value) || 0;
    setDiceStake(betId, stake);
  };

  const getTableClassName = () => {
    let className = 'betting-table';
    if (!showProbabilities && !showBias) className += ' hide-both';
    else if (!showProbabilities) className += ' hide-prob';
    else if (!showBias) className += ' hide-bias';
    return className;
  };

  return (
    <div className="panel">
      <h2 className="panel-title">
        Throwing two dices. 
        <span style={{ fontWeight: 'normal', fontSize: '12px', color: '#9ca3af', marginLeft: '8px' }}>
          (6–7 different bets like in Flipping a coin)
        </span>
      </h2>
      
      <div className={getTableClassName()}>
        {/* Headers */}
        <div className="table-header">Bet Type</div>
        {showProbabilities && <div className="table-header">Prob.</div>}
        <div className="table-header">Payout</div>
        {showBias && <div className="table-header">Bias</div>}
        <div className="table-header">Stake</div>
        
        {/* Betting rows */}
        {DICE_BETS.map(bet => {
          const stake = diceStakes[bet.id] || 0;
          const terms = diceTerms[bet.id];
          
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
      

    </div>
  );
};
