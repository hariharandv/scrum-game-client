import React from 'react';
import type { GameState, GamePhase, ScrumMasterState } from '../../types/game';
import './GameStatePanel.css';

interface GameStatePanelProps {
  gameState?: GameState;
  currentPhase?: GamePhase;
  scrumMasterState?: ScrumMasterState;
  onAdvancePhase?: () => void;
  onAdvanceTurn?: () => void;
}

export const GameStatePanel: React.FC<GameStatePanelProps> = ({
  gameState,
  currentPhase,
  scrumMasterState,
  onAdvancePhase,
  onAdvanceTurn
}) => {
  if (!gameState) {
    return (
      <div className="game-state-panel loading">
        <div className="loading-message">Loading game state...</div>
      </div>
    );
  }

  const { boardState } = gameState;
  const capacityUsed = boardState.usedCapacity;
  const capacityTotal = boardState.teamCapacity;
  const capacityPercentage = capacityTotal > 0 ? (capacityUsed / capacityTotal) * 100 : 0;

  const getPhaseDisplayName = (phase: GamePhase): string => {
    const names: Record<GamePhase, string> = {
      SprintPlanning: 'Sprint Planning',
      Execution: 'Execution & Daily Scrum',
      SprintReview: 'Sprint Review',
      Retrospective: 'Retrospective'
    };
    return names[phase];
  };

  const getPhaseColor = (phase: GamePhase): string => {
    const colors: Record<GamePhase, string> = {
      SprintPlanning: '#4299e1',
      Execution: '#ed8936',
      SprintReview: '#48bb78',
      Retrospective: '#9f7aea'
    };
    return colors[phase];
  };

  return (
    <div className="game-state-panel">
      <div className="panel-header">
        <h3>Game State</h3>
        <div className="turn-info">
          Turn {boardState.currentTurn} of {gameState.maxTurns || 10}
        </div>
      </div>

      <div className="panel-content">
        {/* Current Phase */}
        <div className="state-section">
          <div className="section-label">Current Phase</div>
          <div
            className="phase-display"
            style={{ backgroundColor: getPhaseColor(currentPhase || boardState.currentPhase) }}
          >
            {getPhaseDisplayName(currentPhase || boardState.currentPhase)}
          </div>
        </div>

        {/* Capacity */}
        <div className="state-section">
          <div className="section-label">Team Capacity</div>
          <div className="capacity-display">
            <div className="capacity-bar">
              <div
                className="capacity-fill"
                style={{ width: `${capacityPercentage}%` }}
              />
            </div>
            <div className="capacity-text">
              {capacityUsed} / {capacityTotal} Effort Points
            </div>
          </div>
        </div>

        {/* Scrum Master Tokens */}
        {scrumMasterState && (
          <div className="state-section">
            <div className="section-label">Scrum Master Tokens</div>
            <div className="tokens-display">
              <div className="token-count">
                {scrumMasterState.tokensAvailable} / {scrumMasterState.tokensTotal} available
              </div>
              <div className="token-bar">
                {Array.from({ length: scrumMasterState.tokensTotal }, (_, i) => (
                  <div
                    key={i}
                    className={`token ${i < scrumMasterState.tokensAvailable ? 'available' : 'used'}`}
                  />
                ))}
              </div>
              {scrumMasterState.technicalDebtActive && (
                <div className="technical-debt-notice">
                  Technical Debt Active (expires Turn {scrumMasterState.technicalDebtExpiresAtTurn})
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Player */}
        <div className="state-section">
          <div className="section-label">Current Player</div>
          <div className="player-display">
            {gameState.currentPlayerTurn.replace('-', ' ')}
          </div>
        </div>

        {/* Metrics */}
        <div className="state-section">
          <div className="section-label">Sprint Metrics</div>
          <div className="metrics-display">
            <div className="metric">
              <span className="metric-label">Velocity:</span>
              <span className="metric-value">
                {boardState.metrics.velocityPerTurn[boardState.metrics.velocityPerTurn.length - 1] || 0}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Accumulated Score:</span>
              <span className="metric-value">{boardState.metrics.accumulatedScore}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          {onAdvancePhase && (
            <button
              className="action-button primary"
              onClick={onAdvancePhase}
            >
              Advance Phase
            </button>
          )}
          {onAdvanceTurn && (
            <button
              className="action-button secondary"
              onClick={onAdvanceTurn}
            >
              Advance Turn
            </button>
          )}
        </div>
      </div>
    </div>
  );
};