import React, { useState } from 'react';
import type { Card } from '../../types/game';
import './DiceRollUI.css';

interface DiceRollUIProps {
  availableCards: Card[];
  onRollDice?: (cardId: string) => void;
  onUseToken?: (cardId: string) => void;
  isLoading?: boolean;
}

export const DiceRollUI: React.FC<DiceRollUIProps> = ({
  availableCards,
  onRollDice,
  onUseToken,
  isLoading = false
}) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const handleRollDice = async (cardId: string) => {
    if (!onRollDice || isLoading) return;

    setIsRolling(true);
    setSelectedCard(cardId);

    // Simulate dice rolling animation
    setTimeout(() => {
      onRollDice(cardId);
      setIsRolling(false);
      setSelectedCard(null);
    }, 2000);
  };

  const getColumnName = (status: string): string => {
    const names: Record<string, string> = {
      Implementation: 'Implementation',
      Integration: 'Integration',
      Testing: 'Testing',
      PreDeployment: 'Pre-Deployment'
    };
    return names[status] || status;
  };

  return (
    <div className="dice-roll-ui">
      <div className="dice-instructions">
        <p>Select a card to roll the D6 dice. The roll determines the card's movement:</p>
        <div className="dice-outcomes">
          <div className="outcome">🎯 <strong>1:</strong> Critical Success → Production</div>
          <div className="outcome">➡️ <strong>2-3:</strong> Progress → Next Column</div>
          <div className="outcome">↩️ <strong>4:</strong> Scope Creep → Product Backlog</div>
          <div className="outcome">⚠️ <strong>5:</strong> Impediment → Previous Column</div>
          <div className="outcome">💥 <strong>6:</strong> Critical Failure → Sprint Backlog</div>
        </div>
      </div>

      <div className="card-selection">
        {availableCards.length === 0 ? (
          <div className="no-cards">No cards available for D6 rolls in current phase</div>
        ) : (
          <div className="card-grid">
            {availableCards.map(card => (
              <div key={card.id} className="dice-card">
                <div className="card-header">
                  <div className={`effort effort-${card.effort}`}>
                    {card.effort}
                  </div>
                  <div className="column-badge">
                    {getColumnName(card.currentColumn)}
                  </div>
                </div>

                <div className="card-title">{card.title}</div>

                <div className="card-actions">
                  <button
                    className={`roll-button ${isRolling && selectedCard === card.id ? 'rolling' : ''}`}
                    onClick={() => handleRollDice(card.id)}
                    disabled={isLoading || isRolling}
                  >
                    {isRolling && selectedCard === card.id ? (
                      <>
                        <div className="dice-animation">🎲</div>
                        Rolling...
                      </>
                    ) : (
                      <>🎲 Roll D6</>
                    )}
                  </button>

                  {onUseToken && (
                    <button
                      className="token-button"
                      onClick={() => onUseToken(card.id)}
                      disabled={isLoading}
                      title="Use Scrum Master token to mitigate reversion"
                    >
                      🛡️ Use Token
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};