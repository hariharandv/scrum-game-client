import React from 'react';
import type { BoardColumn, Card, PlayerRole, ColumnState } from '../../types/game';
import { BOARD_COLUMNS } from '../../types/game';
import { Column } from './Column';
import { ROLE_COLUMN_MAP } from '../../utils/rolePermissions';
import './GameBoard.css';

interface GameBoardProps {
  columns: Record<BoardColumn, ColumnState>;
  onCardMove?: (cardId: string, fromColumn: BoardColumn, toColumn: BoardColumn) => void;
  onCardClick?: (card: Card) => void;
  currentPhase?: string;
  currentPlayer?: PlayerRole;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  columns,
  onCardMove,
  onCardClick,
  currentPhase,
  currentPlayer
}) => {
  const handleCardDrop = (cardId: string, toColumn: BoardColumn) => {
    if (!onCardMove) return;
    
    // Find the card in the columns to determine fromColumn
    let fromColumn: BoardColumn | null = null;
    
    for (const [columnName, columnState] of Object.entries(columns)) {
      // Check slots and queue
      if (columnState.slots.find((card: Card) => card.id === cardId) ||
          columnState.queue.find((card: Card) => card.id === cardId)) {
        fromColumn = columnName as BoardColumn;
        break;
      }
    }
    
    if (fromColumn && fromColumn !== toColumn) {
      onCardMove(cardId, fromColumn, toColumn);
    }
  };

  // Get columns that the current player is responsible for
  const playerColumns = currentPlayer ? ROLE_COLUMN_MAP[currentPlayer] : [];

  return (
    <div className="game-board">
      <div className="board-header">
        <h2>Game Board</h2>
        {currentPhase && (
          <div className="phase-indicator">
            Current Phase: <span className="phase-name">{currentPhase}</span>
          </div>
        )}
      </div>

      <div className="board-columns">
        {BOARD_COLUMNS.map((columnName) => {
          const isPlayerColumn = playerColumns.includes(columnName);
          return (
            <Column
              key={columnName}
              name={columnName}
              columnState={columns[columnName]}
              onCardDrop={(cardId: string, targetColumn: BoardColumn) => handleCardDrop(cardId, targetColumn)}
              onCardClick={onCardClick}
              isHighlighted={isPlayerColumn}
            />
          );
        })}
      </div>
    </div>
  );
};