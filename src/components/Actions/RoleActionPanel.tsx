import React from 'react';
import type { PlayerRole, GamePhase, Card } from '../../types/game';
import { DiceRollUI } from './DiceRollUI';
import { CapacityAllocator } from './CapacityAllocator';
import './RoleActionPanel.css';

interface RoleActionPanelProps {
  currentPlayer: PlayerRole;
  currentPhase: GamePhase;
  availableCards?: Card[];
  selectedCards?: string[];
  onCardSelect?: (cardIds: string[]) => void;
  onRollDice?: (cardId: string) => void;
  onAllocateCapacity?: (cardId: string, effort: number) => void;
  onAcceptCard?: (cardId: string) => void;
  onRejectCard?: (cardId: string) => void;
  onUseToken?: (cardId: string) => void;
  onAllocateTechnicalDebt?: (effort: number) => void;
  isLoading?: boolean;
}

export const RoleActionPanel: React.FC<RoleActionPanelProps> = ({
  currentPlayer,
  currentPhase,
  availableCards = [],
  selectedCards = [],
  onCardSelect,
  onRollDice,
  onAllocateCapacity,
  onAcceptCard,
  onRejectCard,
  onUseToken,
  onAllocateTechnicalDebt,
  isLoading = false
}) => {

  const getRoleDisplayName = (role: PlayerRole): string => {
    const names: Record<PlayerRole, string> = {
      'Stakeholder': 'Business Analyst/Stakeholder',
      'ProductOwner': 'Product Owner',
      'ScrumMaster': 'Scrum Master',
      'Developer-Impl': 'Developer (Implementation)',
      'Developer-Intg': 'Developer (Integration)',
      'QATester': 'QA Tester',
      'ReleaseManager': 'Release Manager',
      'Customer': 'Customer/Value Stakeholder'
    };
    return names[role];
  };

  const getRoleDescription = (role: PlayerRole, phase: GamePhase): string => {
    const descriptions: Record<PlayerRole, Record<GamePhase, string>> = {
      'Stakeholder': {
        SprintPlanning: 'Add new requirements to the Product Backlog',
        Execution: 'Monitor progress and provide feedback',
        SprintReview: 'Review delivered features',
        Retrospective: 'Share insights on process improvements'
      },
      'ProductOwner': {
        SprintPlanning: 'Prioritize and order the Product Backlog',
        Execution: 'Monitor sprint progress and remove impediments',
        SprintReview: 'Accept or reject completed work',
        Retrospective: 'Focus on value delivery and stakeholder satisfaction'
      },
      'ScrumMaster': {
        SprintPlanning: 'Ensure commitment transparency and team capacity',
        Execution: 'Facilitate daily scrum and remove impediments',
        SprintReview: 'Ensure proper demo and feedback collection',
        Retrospective: 'Facilitate process improvement discussions'
      },
      'Developer-Impl': {
        SprintPlanning: 'Estimate and commit to implementation tasks',
        Execution: 'Code, test, and integrate features',
        SprintReview: 'Demo implemented features',
        Retrospective: 'Discuss technical challenges and solutions'
      },
      'Developer-Intg': {
        SprintPlanning: 'Estimate and commit to integration tasks',
        Execution: 'Ensure module cohesion and interface compatibility',
        SprintReview: 'Demo integrated features',
        Retrospective: 'Discuss integration challenges and solutions'
      },
      'QATester': {
        SprintPlanning: 'Estimate and commit to testing tasks',
        Execution: 'Validate features against acceptance criteria',
        SprintReview: 'Report testing results and quality metrics',
        Retrospective: 'Discuss quality improvements and testing efficiency'
      },
      'ReleaseManager': {
        SprintPlanning: 'Estimate and commit to deployment tasks',
        Execution: 'Prepare releases and manage deployment pipeline',
        SprintReview: 'Confirm release readiness',
        Retrospective: 'Discuss deployment process improvements'
      },
      'Customer': {
        SprintPlanning: 'Provide feedback on backlog priorities',
        Execution: 'Monitor feature development progress',
        SprintReview: 'Validate delivered value',
        Retrospective: 'Share end-user experience insights'
      }
    };
    return descriptions[role]?.[phase] || 'Participate in current phase activities';
  };

  const renderSprintPlanningActions = () => {
    // Get available cards from Product Backlog for selection
    const productBacklogCards = availableCards.filter(card =>
      card.currentColumn === 'ProductBacklog'
    );

    if (currentPlayer === 'ProductOwner') {
      return (
        <div className="action-section">
          <h4>Product Backlog Management</h4>
          <p>Order and prioritize items in the Product Backlog for maximum value delivery.</p>
          <div className="action-note">
            💡 <strong>Drag cards</strong> in the Product Backlog column to reorder them by priority
          </div>
        </div>
      );
    }

    if (currentPlayer === 'ScrumMaster') {
      return (
        <div className="action-section">
          <h4>Sprint Commitment</h4>
          <p>Ensure the team commits to work that fits within capacity limits.</p>
          <div className="action-note">
            ⚠️ <strong>Monitor team capacity:</strong> Selected work must not exceed available effort points
          </div>
        </div>
      );
    }

    if (currentPlayer.startsWith('Developer')) {
      return (
        <div className="action-section">
          <h4>Sprint Planning</h4>
          <p>Select items from the Product Backlog to move to Sprint Backlog.</p>
          {productBacklogCards.length > 0 && (
            <div className="card-selection">
              <h5>Available Cards from Product Backlog:</h5>
              <div className="card-list">
                {productBacklogCards.map(card => (
                  <div key={card.id} className="card-item">
                    <input
                      type="checkbox"
                      id={`card-${card.id}`}
                      checked={selectedCards.includes(card.id)}
                      onChange={(e) => {
                        const newSelection = e.target.checked
                          ? [...selectedCards, card.id]
                          : selectedCards.filter(id => id !== card.id);
                        onCardSelect?.(newSelection);
                      }}
                      disabled={isLoading}
                    />
                    <label htmlFor={`card-${card.id}`}>
                      <strong>{card.title}</strong> ({card.effort} points)
                    </label>
                  </div>
                ))}
              </div>
              {selectedCards.length > 0 && (
                <button
                  className="action-button primary"
                  onClick={() => onCardSelect?.(selectedCards)}
                  disabled={isLoading}
                >
                  Move to Sprint Backlog
                </button>
              )}
            </div>
          )}
          {productBacklogCards.length === 0 && (
            <div className="no-cards">No cards available in Product Backlog</div>
          )}
        </div>
      );
    }

    return (
      <div className="action-section">
        <h4>Observe Sprint Planning</h4>
        <p>Watch as the team plans the upcoming sprint work.</p>
      </div>
    );
  };

  const renderExecutionActions = () => {
    // Get cards from Sprint Backlog for capacity allocation
    const sprintBacklogCards = availableCards.filter(card =>
      card.currentColumn === 'SprintBacklog'
    );

    if (currentPlayer === 'ScrumMaster') {
      return (
        <div className="action-section">
          <h4>Daily Scrum Facilitation</h4>
          <p>Monitor progress and be ready to use impediment tokens if needed.</p>
          <div className="action-note">
            🎯 Use tokens when D6 rolls result in 5 or 6 to reduce reversion severity
          </div>
        </div>
      );
    }

    if (currentPlayer.startsWith('Developer')) {
      return (
        <div className="action-section">
          <h4>Capacity Allocation & Development</h4>
          <CapacityAllocator
            availableCards={sprintBacklogCards}
            onAllocateCapacity={onAllocateCapacity}
            onAllocateTechnicalDebt={onAllocateTechnicalDebt}
            isLoading={isLoading}
          />
        </div>
      );
    }

    return (
      <div className="action-section">
        <h4>Monitor Execution</h4>
        <p>Observe the team's progress through the development phases.</p>
      </div>
    );
  };

  const renderSprintReviewActions = () => {
    // Get cards from PreDeployment for acceptance/rejection
    const preDeploymentCards = availableCards.filter(card =>
      card.currentColumn === 'PreDeployment'
    );

    if (currentPlayer === 'ProductOwner') {
      return (
        <div className="action-section">
          <h4>Work Acceptance</h4>
          <p>Review completed work in Pre-Deployment and decide acceptance.</p>
          {preDeploymentCards.length > 0 && (
            <div className="card-review">
              {preDeploymentCards.map(card => (
                <div key={card.id} className="review-card">
                  <div className="card-info">
                    <strong>{card.title}</strong>
                    <div className="card-details">
                      Effort: {card.effort} | Cycle Time: {card.cycleTime || 'N/A'}
                    </div>
                  </div>
                  <div className="review-actions">
                    <button
                      className="action-button success"
                      onClick={() => onAcceptCard?.(card.id)}
                      disabled={isLoading}
                    >
                      ✅ Accept
                    </button>
                    <button
                      className="action-button danger"
                      onClick={() => onRejectCard?.(card.id)}
                      disabled={isLoading}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {preDeploymentCards.length === 0 && (
            <div className="no-cards">No cards in Pre-Deployment for review</div>
          )}
        </div>
      );
    }

    return (
      <div className="action-section">
        <h4>Sprint Review</h4>
        <p>Observe the Product Owner's acceptance decisions.</p>
      </div>
    );
  };

  const renderRetrospectiveActions = () => {
    return (
      <div className="action-section">
        <h4>Retrospective</h4>
        <p>Review the sprint metrics and discuss process improvements.</p>
        <div className="action-note">
          📊 Check the metrics panel for velocity trends, cycle times, and bottleneck analysis
        </div>
      </div>
    );
  };

  const renderPhaseActions = () => {
    switch (currentPhase) {
      case 'SprintPlanning':
        return renderSprintPlanningActions();
      case 'Execution':
        return renderExecutionActions();
      case 'SprintReview':
        return renderSprintReviewActions();
      case 'Retrospective':
        return renderRetrospectiveActions();
      default:
        return <div className="action-section">Phase actions loading...</div>;
    }
  };

  return (
    <div className="role-action-panel">
      <div className="panel-header">
        <h3>{getRoleDisplayName(currentPlayer)}</h3>
        <div className="role-description">
          {getRoleDescription(currentPlayer, currentPhase)}
        </div>
      </div>

      <div className="panel-content">
        {renderPhaseActions()}

        {/* Dice Roll UI for Execution Phase */}
        {currentPhase === 'Execution' && availableCards.length > 0 && (
          <div className="action-section">
            <h4>D6 Roll Actions</h4>
            <DiceRollUI
              availableCards={availableCards}
              onRollDice={onRollDice}
              onUseToken={onUseToken}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};