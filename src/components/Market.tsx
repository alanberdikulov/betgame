// Market component - Bid/Ask trading on sum of 3 card ranks

import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Card, rankText, SUIT_SYMBOLS, SUIT_COLORS } from '../lib/deck';
import { formatMoney } from '../lib/format';
import { randomInt } from '../lib/random';

interface MarketProps {
  currentCards?: [Card, Card, Card];
  showCards: boolean;
}

export const Market: React.FC<MarketProps> = ({ currentCards, showCards }) => {
  const {
    marketBid,
    marketAsk,
    marketTrade,
    setMarketQuotes,
    setMarketTrade,
    isRoundActive,
    hasCompletedRound,
    bank,
    getTotalStake
  } = useGameStore();

  const [unitsInput, setUnitsInput] = useState(0);

  // Generate market quotes on mount and when round resets
  useEffect(() => {
    if (!isRoundActive && !hasCompletedRound) {
      generateQuotes();
    }
  }, [isRoundActive, hasCompletedRound]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateQuotes = () => {
    // Sample fair value: sum of 3 uniform ranks (1-13)
    const fairValue = randomInt(1, 13) + randomInt(1, 13) + randomInt(1, 13);
    
    // Choose spread 2, 3, or 4
    const spread = randomInt(2, 4);
    
    let bid = fairValue - Math.floor(spread / 2);
    let ask = fairValue + Math.ceil(spread / 2);
    
    // 25% chance for player edge
    if (Math.random() < 0.25) {
      if (fairValue > 21) {
        bid += 1; // favor SELL
      } else if (fairValue < 21) {
        ask -= 1; // favor BUY
      } else {
        // fairValue === 21, randomly nudge
        if (Math.random() < 0.5) {
          ask -= 1;
        } else {
          bid += 1;
        }
      }
    }
    
    // Clamp to valid ranges
    bid = Math.max(3, Math.min(39, bid));
    ask = Math.max(bid + 1, Math.min(39, ask));
    
    setMarketQuotes(bid, ask);
  };

  const handleTrade = (side: 'BUY' | 'SELL') => {
    if (unitsInput <= 0) {
      alert('Enter Units > 0 before trading.');
      return;
    }

    const price = side === 'BUY' ? marketAsk : marketBid;
    const needed = price * unitsInput;
    
    // Check affordability including other games' stakes
    const totalStake = getTotalStake();
    const currentMinusThis = totalStake - marketTrade.committed;
    
    if (needed + currentMinusThis > bank) {
      const available = Math.max(0, bank - currentMinusThis);
      alert(
        `Not enough bank for this trade.\n` +
        `Required: ${formatMoney(needed)}\n` +
        `Available to commit: ${formatMoney(available)}`
      );
      return;
    }

    // Accept the trade
    setMarketTrade({
      side,
      units: unitsInput,
      price,
      committed: needed
    });
  };



  // Reset units and market trade when round resets
  React.useEffect(() => {
    if (!isRoundActive && !hasCompletedRound) {
      setUnitsInput(0);
      setMarketTrade({ side: null, units: 0, price: 0, committed: 0 });
    }
  }, [isRoundActive, hasCompletedRound, setMarketTrade]);

  const renderCard = (card: Card | null, index: number) => {
    if (!showCards || !card) {
      return (
        <div key={index} className="card back">
          🂠
        </div>
      );
    }

    const colorClass = SUIT_COLORS[card.suit] === '#dc2626' ? 'red' : 'black';
    const rankStr = rankText(card.rank);
    const suitStr = SUIT_SYMBOLS[card.suit];

    return (
      <div key={index} className={`card ${colorClass}`}>
        <div className="rank-suit">
          {rankStr}<br/>{suitStr}
        </div>
        <div className="center-suit">{suitStr}</div>
        <div className="rank-suit-flip">
          {rankStr}<br/>{suitStr}
        </div>
      </div>
    );
  };

  const getBuyButtonText = () => {
    if (marketTrade.side === 'BUY') return 'Bought ✓';
    return `Buy @Ask`;
  };

  const getSellButtonText = () => {
    if (marketTrade.side === 'SELL') return 'Sold ✓';
    return `Sell @Bid`;
  };

  return (
    <div className="split-top">
      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>3-Card SUM</h3>
      
      <p className="panel-subtitle">(Sum of ranks; A=1 … K=13)</p>
      
      <div className="card-container">
        {[0, 1, 2].map(i => renderCard(currentCards?.[i] || null, i))}
      </div>
      
      <div className="market-quotes">
        <div className="bid">
          <span>Bid: </span>
          <span style={{ fontWeight: 700, color: '#dc2626' }}>{marketBid}</span>
        </div>
        <div className="ask">
          <span>Ask: </span>
          <span style={{ fontWeight: 700, color: '#16a34a' }}>{marketAsk}</span>
        </div>
      </div>
      
      <div className="trade-section">
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          Units
          <input
            type="number"
            min="0"
            step="1"
            value={unitsInput}
            onChange={(e) => setUnitsInput(parseInt(e.target.value) || 0)}
            className="units-input"
            disabled={isRoundActive || marketTrade.side !== null}
          />
        </label>
        
        <div className="trade-buttons">
          <button
            className="btn btn-danger"
            onClick={() => handleTrade('SELL')}
            disabled={isRoundActive || marketTrade.side === 'SELL'}
          >
            {getSellButtonText()}
          </button>
          
          <button
            className="btn btn-success"
            onClick={() => handleTrade('BUY')}
            disabled={isRoundActive || marketTrade.side === 'BUY'}
          >
            {getBuyButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};
