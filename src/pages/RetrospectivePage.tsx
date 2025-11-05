import React, { useState } from 'react';
import { CFDChart } from '../components/Charts';
import type { CFDDataPoint } from '../components/Charts';
import type { GameState, PlayerRole } from '../types/game';
import './RetrospectivePage.css';

interface RetrospectivePageProps {
  gameState: GameState;
  currentPlayer: PlayerRole;
  onRecordAdaptation?: (adaptation: string) => void;
  onCompleteRetrospective?: () => void;
  isLoading?: boolean;
}

export const RetrospectivePage: React.FC<RetrospectivePageProps> = ({
  gameState,
  currentPlayer,
  onRecordAdaptation,
  onCompleteRetrospective,
  isLoading = false
}) => {
  const [adaptationText, setAdaptationText] = useState('');
  const [recordedAdaptations, setRecordedAdaptations] = useState<string[]>([]);

  // Convert game state metrics to CFD data format
  const cfdData: CFDDataPoint[] = gameState.boardState.metrics.cumulativeFlowData.map((dataPoint, index) => ({
    turn: index + 1,
    funnel: dataPoint.columnCounts.Funnel || 0,
    productBacklog: dataPoint.columnCounts.ProductBacklog || 0,
    sprintBacklog: dataPoint.columnCounts.SprintBacklog || 0,
    implementation: dataPoint.columnCounts.Implementation || 0,
    integration: dataPoint.columnCounts.Integration || 0,
    testing: dataPoint.columnCounts.Testing || 0,
    preDeployment: dataPoint.columnCounts.PreDeployment || 0,
    production: dataPoint.columnCounts.Production || 0
  }));

  // Calculate key metrics for the retrospective
  const totalVelocity = gameState.boardState.metrics.velocityPerTurn.reduce((sum, vel) => sum + vel, 0);
  const averageVelocity = gameState.boardState.metrics.velocityPerTurn.length > 0
    ? totalVelocity / gameState.boardState.metrics.velocityPerTurn.length
    : 0;
  const totalRevertEvents = gameState.boardState.metrics.revertEvents.length;
  const tokenUsage = gameState.scrumMasterState.tokensUsed;

  const handleRecordAdaptation = () => {
    if (adaptationText.trim()) {
      const newAdaptation = adaptationText.trim();
      setRecordedAdaptations(prev => [...prev, newAdaptation]);
      onRecordAdaptation?.(newAdaptation);
      setAdaptationText('');
    }
  };

  const getRoleInsights = (role: PlayerRole) => {
    const insights: Record<PlayerRole, string[]> = {
      'Stakeholder': [
        'How well did the team respond to changing requirements?',
        'Were new features delivered that increased business value?',
        'How can we improve requirement clarity and prioritization?'
      ],
      'ProductOwner': [
        'How effective was backlog prioritization?',
        'Did we deliver the highest value items first?',
        'How can we improve stakeholder communication?'
      ],
      'ScrumMaster': [
        'How effectively did we remove impediments?',
        'Were there patterns in the types of issues encountered?',
        'How can we improve team facilitation and process adherence?'
      ],
      'Developer-Impl': [
        'How smooth was the implementation process?',
        'Were there recurring technical challenges?',
        'How can we improve code quality and reduce defects?'
      ],
      'Developer-Intg': [
        'How well did modules integrate together?',
        'Were there interface or dependency issues?',
        'How can we improve integration testing and practices?'
      ],
      'QATester': [
        'How effective was our testing approach?',
        'Did we catch issues early enough?',
        'How can we improve test coverage and quality assurance?'
      ],
      'ReleaseManager': [
        'How smooth were our deployment processes?',
        'Were there environment or infrastructure issues?',
        'How can we improve release management and automation?'
      ],
      'Customer': [
        'Did the delivered features meet user needs?',
        'How was the overall user experience?',
        'What feedback can we provide for future improvements?'
      ]
    };

    return insights[role] || ['What went well?', 'What could be improved?', 'What should we try next?'];
  };

  return (
    <div className="retrospective-page">
      <div className="retro-header">
        <h1>Sprint Retrospective</h1>
        <p className="retro-subtitle">
          Review the sprint, analyze our Cumulative Flow Diagram, and identify process improvements
        </p>
      </div>

      <div className="retro-content">
        {/* Sprint Metrics Overview */}
        <div className="metrics-overview">
          <h2>Sprint Performance Summary</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">{totalVelocity}</div>
              <div className="metric-label">Total Velocity</div>
              <div className="metric-description">Effort points delivered to Production</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{averageVelocity.toFixed(1)}</div>
              <div className="metric-label">Average Velocity</div>
              <div className="metric-description">Per sprint turn</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{totalRevertEvents}</div>
              <div className="metric-label">Revert Events</div>
              <div className="metric-description">D6 roll setbacks encountered</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{tokenUsage}</div>
              <div className="metric-label">Tokens Used</div>
              <div className="metric-description">Impediment mitigation actions</div>
            </div>
          </div>
        </div>

        {/* CFD Chart */}
        <div className="cfd-section">
          <CFDChart
            data={cfdData}
            title="Sprint Cumulative Flow Diagram"
            height={500}
          />
        </div>

        {/* Role-Specific Insights */}
        <div className="insights-section">
          <h2>Your Perspective ({currentPlayer})</h2>
          <div className="insights-questions">
            <h3>Reflection Questions:</h3>
            <ul>
              {getRoleInsights(currentPlayer).map((question, index) => (
                <li key={index}>{question}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Process Adaptations */}
        <div className="adaptations-section">
          <h2>Process Adaptations</h2>
          <p>Record one mandatory process improvement or change to try in the next sprint.</p>

          <div className="adaptation-input">
            <textarea
              value={adaptationText}
              onChange={(e) => setAdaptationText(e.target.value)}
              placeholder="What process change will we implement next sprint?"
              rows={3}
              disabled={isLoading}
            />
            <button
              className="record-button"
              onClick={handleRecordAdaptation}
              disabled={!adaptationText.trim() || isLoading}
            >
              Record Adaptation
            </button>
          </div>

          {recordedAdaptations.length > 0 && (
            <div className="recorded-adaptations">
              <h3>Recorded Adaptations:</h3>
              <ul>
                {recordedAdaptations.map((adaptation, index) => (
                  <li key={index}>{adaptation}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Complete Retrospective */}
        <div className="retro-actions">
          <button
            className="complete-button"
            onClick={onCompleteRetrospective}
            disabled={recordedAdaptations.length === 0 || isLoading}
          >
            {isLoading ? 'Completing...' : 'Complete Retrospective'}
          </button>
          {recordedAdaptations.length === 0 && (
            <p className="completion-note">
              Record at least one process adaptation to complete the retrospective.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};