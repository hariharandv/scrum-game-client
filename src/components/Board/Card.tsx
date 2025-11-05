import React from 'react';
import type { Card } from '../../types/game';
import './Card.css';

interface CardComponentProps {
  card: Card;
  onClick?: () => void;
}

export const CardComponent: React.FC<CardComponentProps> = ({ card, onClick }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('cardId', card.id);
    e.dataTransfer.setData('fromColumn', card.currentColumn);
    e.dataTransfer.effectAllowed = 'move';
  };

  const getEffortColor = (effort: number): string => {
    switch (effort) {
      case 1: return 'effort-small';
      case 3: return 'effort-medium';
      case 5: return 'effort-large';
      default: return 'effort-unknown';
    }
  };

  return (
    <div
      className={`card ${getEffortColor(card.effort)} ${card.isTechnicalDebt ? 'technical-debt' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
    >
      <div className="card-header">
        <div className="card-effort">{card.effort}</div>
        {card.isTechnicalDebt && (
          <div className="technical-debt-indicator">TD</div>
        )}
      </div>

      <div className="card-content">
        <h4 className="card-title">{card.title}</h4>
        {card.description && (
          <p className="card-description">{card.description}</p>
        )}
      </div>

      <div className="card-footer">
        <div className="card-meta">
          <span className="card-turn">Turn {card.createdTurn}</span>
          {card.revertCount > 0 && (
            <span className="card-reverts">Reverts: {card.revertCount}</span>
          )}
          {card.cycleTime && (
            <span className="card-cycle-time">CT: {card.cycleTime}</span>
          )}
        </div>
        {card.assignedTo && (
          <div className="card-assignee">{card.assignedTo}</div>
        )}
      </div>
    </div>
  );
};