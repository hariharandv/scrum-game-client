import React, { useState } from 'react';
import type { Card } from '../../types/game';
import './CapacityAllocator.css';

interface CapacityAllocatorProps {
  availableCards: Card[];
  onAllocateCapacity?: (cardId: string, effort: number) => void;
  onAllocateTechnicalDebt?: (effort: number) => void;
  isLoading?: boolean;
}

export const CapacityAllocator: React.FC<CapacityAllocatorProps> = ({
  availableCards,
  onAllocateCapacity,
  onAllocateTechnicalDebt,
  isLoading = false
}) => {
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [technicalDebtEffort, setTechnicalDebtEffort] = useState<number>(0);

  const handleAllocationChange = (cardId: string, effort: number) => {
    setAllocations(prev => ({
      ...prev,
      [cardId]: effort
    }));
  };

  const handleSubmitAllocations = () => {
    // Submit capacity allocations for cards
    Object.entries(allocations).forEach(([cardId, effort]) => {
      if (effort > 0 && onAllocateCapacity) {
        onAllocateCapacity(cardId, effort);
      }
    });

    // Submit technical debt allocation
    if (technicalDebtEffort > 0 && onAllocateTechnicalDebt) {
      onAllocateTechnicalDebt(technicalDebtEffort);
    }

    // Reset form
    setAllocations({});
    setTechnicalDebtEffort(0);
  };

  const totalAllocatedEffort = Object.values(allocations).reduce((sum, effort) => sum + effort, 0) + technicalDebtEffort;
  const hasAllocations = totalAllocatedEffort > 0;

  return (
    <div className="capacity-allocator">
      <div className="allocator-header">
        <h4>Capacity Allocation</h4>
        <p>Distribute your team's effort points across sprint backlog items and technical debt.</p>
      </div>

      <div className="allocation-summary">
        <div className="total-effort">
          Total Allocated: <strong>{totalAllocatedEffort}</strong> effort points
        </div>
      </div>

      {/* Card Allocations */}
      <div className="card-allocations">
        <h5>Sprint Backlog Items</h5>
        {availableCards.length === 0 ? (
          <div className="no-cards">No cards available for capacity allocation</div>
        ) : (
          <div className="allocation-grid">
            {availableCards.map(card => (
              <div key={card.id} className="allocation-item">
                <div className="card-info">
                  <div className="card-title">{card.title}</div>
                  <div className="card-details">
                    Size: {card.effort} points | Column: {card.currentColumn}
                  </div>
                </div>

                <div className="effort-input">
                  <label htmlFor={`effort-${card.id}`}>Effort:</label>
                  <input
                    id={`effort-${card.id}`}
                    type="number"
                    min="0"
                    max={card.effort}
                    value={allocations[card.id] || 0}
                    onChange={(e) => handleAllocationChange(card.id, parseInt(e.target.value) || 0)}
                    disabled={isLoading}
                  />
                  <span className="max-effort">/ {card.effort}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Technical Debt Allocation */}
      <div className="technical-debt-section">
        <h5>Technical Debt Investment</h5>
        <div className="technical-debt-info">
          <p>Invest effort points in technical debt to reduce the severity of future D6=6 failures.</p>
          <div className="benefit-note">
            💡 <strong>Benefit:</strong> D6=6 rolls revert to Implementation instead of Sprint Backlog for 2 turns
          </div>
        </div>

        <div className="effort-input">
          <label htmlFor="technical-debt-effort">Technical Debt Effort:</label>
          <input
            id="technical-debt-effort"
            type="number"
            min="0"
            value={technicalDebtEffort}
            onChange={(e) => setTechnicalDebtEffort(parseInt(e.target.value) || 0)}
            disabled={isLoading}
          />
          <span className="unit">effort points</span>
        </div>
      </div>

      {/* Submit Button */}
      {hasAllocations && (
        <div className="allocation-actions">
          <button
            className="submit-button"
            onClick={handleSubmitAllocations}
            disabled={isLoading}
          >
            {isLoading ? 'Allocating...' : 'Confirm Capacity Allocation'}
          </button>
        </div>
      )}
    </div>
  );
};