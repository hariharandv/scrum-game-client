import React from 'react';
import type { BoardColumn, Card, ColumnState } from '../../types/game';
import { CardComponent } from './Card';
import './Column.css';

interface ColumnProps {
  name: BoardColumn;
  columnState: ColumnState;
  onCardDrop?: (cardId: string, targetColumn: BoardColumn) => void;
  onCardClick?: (card: Card) => void;
  isHighlighted?: boolean;
}

export const Column: React.FC<ColumnProps> = ({
  name,
  columnState,
  onCardDrop,
  onCardClick,
  isHighlighted = false
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const cardId = e.dataTransfer.getData('cardId');
    const fromColumn = e.dataTransfer.getData('fromColumn') as BoardColumn;
    
    if (cardId && fromColumn && onCardDrop) {
      onCardDrop(cardId, name);
    }
    
    // Clear the drag data
    e.dataTransfer.clearData();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set to false if leaving the column content
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  };

  const getColumnTitle = (columnName: BoardColumn): string => {
    const titles: Record<BoardColumn, string> = {
      Funnel: 'Funnel',
      ProductBacklog: 'Product Backlog',
      SprintBacklog: 'Sprint Backlog',
      Implementation: 'Implementation',
      Integration: 'Integration',
      Testing: 'Testing',
      PreDeployment: 'Pre-Deployment',
      Production: 'Production'
    };
    return titles[columnName];
  };

  const getColumnDescription = (columnName: BoardColumn): string => {
    const descriptions: Record<BoardColumn, string> = {
      Funnel: 'Raw ideas and requirements',
      ProductBacklog: 'Prioritized and refined items',
      SprintBacklog: 'Committed work for current sprint',
      Implementation: 'Core coding and unit testing',
      Integration: 'Module cohesion and interfaces',
      Testing: 'Quality assurance and validation',
      PreDeployment: 'Release readiness and staging',
      Production: 'Value realization and delivery'
    };
    return descriptions[columnName];
  };

  const totalCards = columnState.slots.length + columnState.queue.length;

  return (
    <div className={`column ${isHighlighted ? 'column-highlighted' : ''}`}>
      <div className="column-header">
        <h3 className="column-title">
          {getColumnTitle(name)}
          {isHighlighted && <span className="your-column-badge">👤 Your Column</span>}
        </h3>
        <div className="column-description">{getColumnDescription(name)}</div>
        <div className="card-count">
          {totalCards} cards ({columnState.slots.length}/{columnState.wipLimit} active, {columnState.queue.length} waiting)
        </div>
      </div>

      <div
        className={`column-content ${isDragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        {/* Active Slots */}
        <div className="column-section">
          <div className="section-header">Active Work ({columnState.slots.length}/{columnState.wipLimit})</div>
          <div className="section-content">
            {columnState.slots.map((card) => (
              <CardComponent
                key={card.id}
                card={card}
                onClick={() => onCardClick?.(card)}
              />
            ))}
            {columnState.slots.length === 0 && (
              <div className="empty-section">No active work</div>
            )}
          </div>
        </div>

        {/* Queue */}
        {columnState.queue.length > 0 && (
          <div className="column-section queue-section">
            <div className="section-header">Waiting Queue ({columnState.queue.length})</div>
            <div className="section-content">
              {columnState.queue.map((card) => (
                <CardComponent
                  key={card.id}
                  card={card}
                  onClick={() => onCardClick?.(card)}
                  isQueued={true}
                />
              ))}
            </div>
          </div>
        )}

        {totalCards === 0 && (
          <div className="empty-column">
            <div className="empty-message">No cards in {getColumnTitle(name)}</div>
          </div>
        )}
      </div>
    </div>
  );
};