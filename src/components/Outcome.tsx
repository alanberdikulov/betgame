// Outcome panel - displays current round results and history

import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { formatMoney, DICE_FACES } from '../lib/format';
import { rankText, SUIT_SYMBOLS } from '../lib/deck';

export const Outcome: React.FC = () => {
  const { roundHistory } = useGameStore();

  const currentResult = roundHistory[0];

  const formatCurrentOutcome = () => {
    if (!currentResult) return '—';

    const { coins, dice, cards } = currentResult;
    
    // Format coins: "H T H"
    const coinsStr = coins.split('').join(' ');
    
    // Format dice: "⚄ ⚃ (5+4=9)"
    const [die1, die2] = dice;
    const diceStr = `${DICE_FACES[die1 as keyof typeof DICE_FACES]} ${DICE_FACES[die2 as keyof typeof DICE_FACES]} (${die1}+${die2}=${die1 + die2})`;
    
    // Format cards: "A♥ 7♣ Q♦ (sum=1+7+12=20)"
    const cardsStr = cards.map(card => `${rankText(card.rank)}${SUIT_SYMBOLS[card.suit]}`).join(' ');
    const cardSum = cards.reduce((sum, card) => sum + card.rank, 0);
    const cardsWithSum = `${cardsStr} (sum=${cardSum})`;
    
    return `${coinsStr}   |   ${diceStr}   |   ${cardsWithSum}`;
  };

  const getOutcomeClassName = () => {
    if (!currentResult) return 'current-outcome';
    const pnl = currentResult.pnl;
    if (pnl > 0) return 'current-outcome positive';
    if (pnl < 0) return 'current-outcome negative';
    return 'current-outcome';
  };

  return (
    <div className="panel">
      <h2 className="panel-title">Outcome</h2>
      
      <div className={getOutcomeClassName()}>
        {formatCurrentOutcome()}
      </div>
      
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '8px' }}>
        <p style={{ fontWeight: 600, marginBottom: '8px', color: '#374151' }}>Recent rounds:</p>
      </div>
      
      <div className="round-history">
        {roundHistory.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
            No rounds played yet
          </div>
        ) : (
          roundHistory.map((result, index) => {
            const { coins, dice, cards, pnl } = result;
            
            const coinsStr = coins.split('').join(' ');
            const [die1, die2] = dice;
            const diceStr = `${DICE_FACES[die1 as keyof typeof DICE_FACES]} ${DICE_FACES[die2 as keyof typeof DICE_FACES]} (${die1}+${die2}=${die1 + die2})`;
            const cardsStr = cards.map(card => `${rankText(card.rank)}${SUIT_SYMBOLS[card.suit]}`).join(' ');
            const cardSum = cards.reduce((sum, card) => sum + card.rank, 0);
            const cardsWithSum = `${cardsStr} (sum=${cardSum})`;
            
            const historyLine = `${coinsStr}   |   ${diceStr}   |   ${cardsWithSum}   P&L this round: ${formatMoney(pnl)}`;
            
            return (
              <div key={index} className="history-item">
                {historyLine}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
