import { useState, useEffect } from 'react';
import { GameBoard } from './components/Board';
import { GameStatePanel } from './components/GameState';
import { RoleActionPanel } from './components/Actions';
import { RetrospectivePage } from './pages/RetrospectivePage';
import { apiClient } from './services/api';
// import { webSocketClient } from './services/websocket';
import type { GameState, Card, BoardColumn } from './types/game';
import { canMoveCardFromColumn, canMoveCardToColumn, canRollDice, getRoleDisplayName } from './utils/rolePermissions';
import './App.css';

function App() {
  // Game state from API
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Current player is now determined by game state
  const currentPlayer = gameState?.currentPlayerTurn || 'Stakeholder';

  // Load game state from API
  useEffect(() => {
    const loadGameState = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First check if server is available
        try {
          const healthResponse = await fetch('http://localhost:5000/health', { 
            method: 'GET',
            signal: AbortSignal.timeout(2000) // 2 second timeout
          });
          
          if (!healthResponse.ok) {
            throw new Error('Server not responding');
          }
        } catch (healthErr) {
          // Server not available - this is expected, show setup screen
          setIsLoading(false);
          return;
        }

        // First try to get existing game state
        const response = await apiClient.getGameState();

        if (response.success && response.data) {
          setGameState(response.data);
        } else {
          // If no game exists, start a new one
          const startResponse = await apiClient.startGame();
          if (startResponse.success && startResponse.data) {
            setGameState(startResponse.data);
          } else {
            setError(startResponse.error?.message || 'Failed to start game');
          }
        }
      } catch (err) {
        setError('Failed to connect to game server. Please ensure the backend is running.');
        console.error('Error loading game state:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadGameState();

    // Cleanup WebSocket connection on unmount
    // return () => {
    //   webSocketClient.disconnect();
    // };
  }, []);

  const handleCardMove = async (cardId: string, fromColumn: BoardColumn, toColumn: BoardColumn) => {
    // Check if current player has permission to move this card
    if (!canMoveCardFromColumn(currentPlayer, fromColumn)) {
      setError(`${getRoleDisplayName(currentPlayer)} cannot move cards from ${fromColumn}. This is not your column!`);
      return;
    }

    if (!canMoveCardToColumn(currentPlayer, fromColumn, toColumn)) {
      setError(`${getRoleDisplayName(currentPlayer)} cannot move cards to ${toColumn}. Cards must move sequentially!`);
      return;
    }

    try {
      const response = await apiClient.moveCard(cardId, fromColumn, toColumn);
      if (response.success) {
        // Refresh game state after successful move
        const stateResponse = await apiClient.getGameState();
        if (stateResponse.success && stateResponse.data) {
          setGameState(stateResponse.data);
        }
      } else {
        setError(response.error?.message || 'Failed to move card');
      }
    } catch (err) {
      setError('Failed to move card');
      console.error('Error moving card:', err);
    }
  };

  const handleCardClick = (card: Card) => {
    console.log('Card clicked:', card);
    // TODO: Implement card selection logic
  };

  const handleAdvancePhase = async () => {
    try {
      const response = await apiClient.advancePhase();
      if (response.success) {
        // Refresh game state after phase advancement
        const stateResponse = await apiClient.getGameState();
        if (stateResponse.success && stateResponse.data) {
          setGameState(stateResponse.data);
        }
      } else {
        setError(response.error?.message || 'Failed to advance phase');
      }
    } catch (err) {
      setError('Failed to advance phase');
      console.error('Error advancing phase:', err);
    }
  };

  const handleAdvanceTurn = async () => {
    try {
      const response = await apiClient.advanceTurn();
      if (response.success) {
        // Refresh game state after turn advancement
        const stateResponse = await apiClient.getGameState();
        if (stateResponse.success && stateResponse.data) {
          setGameState(stateResponse.data);
        }
      } else {
        setError(response.error?.message || 'Failed to advance turn');
      }
    } catch (err) {
      setError('Failed to advance turn');
      console.error('Error advancing turn:', err);
    }
  };

  const handleCardSelect = async (cardIds: string[]) => {
    try {
      const response = await apiClient.pullToSprint(cardIds);
      if (response.success) {
        // Refresh game state after pulling cards to sprint
        const stateResponse = await apiClient.getGameState();
        if (stateResponse.success && stateResponse.data) {
          setGameState(stateResponse.data);
        }
      } else {
        setError(response.error?.message || 'Failed to pull cards to sprint');
      }
    } catch (err) {
      setError('Failed to pull cards to sprint');
      console.error('Error pulling cards to sprint:', err);
    }
  };

  const handleRollDice = async (cardId: string) => {
    if (!gameState) return;

    // Find the card to determine its column
    let cardColumn: BoardColumn | null = null;
    for (const [column, columnState] of Object.entries(gameState.boardState.columns)) {
      // Check both slots and queue
      if (columnState.slots.find((c: Card) => c.id === cardId) ||
          columnState.queue.find((c: Card) => c.id === cardId)) {
        cardColumn = column as BoardColumn;
        break;
      }
    }

    if (!cardColumn) {
      setError('Card not found');
      return;
    }

    // Check if current player can roll dice for this card
    if (!canRollDice(currentPlayer, cardColumn, gameState.boardState.currentPhase)) {
      setError(`${getRoleDisplayName(currentPlayer)} cannot roll dice in ${cardColumn} during ${gameState.boardState.currentPhase} phase!`);
      return;
    }

    try {
      const response = await apiClient.rollD6(cardId);
      if (response.success) {
        // Refresh game state after dice roll
        const stateResponse = await apiClient.getGameState();
        if (stateResponse.success && stateResponse.data) {
          setGameState(stateResponse.data);
        }
      } else {
        setError(response.error?.message || 'Failed to roll dice');
      }
    } catch (err) {
      setError('Failed to roll dice');
      console.error('Error rolling dice:', err);
    }
  };

  const handleAllocateCapacity = async (cardId: string, effort: number) => {
    try {
      const response = await apiClient.allocateCapacity(cardId, effort);
      if (response.success) {
        // Refresh game state after capacity allocation
        const stateResponse = await apiClient.getGameState();
        if (stateResponse.success && stateResponse.data) {
          setGameState(stateResponse.data);
        }
      } else {
        setError(response.error?.message || 'Failed to allocate capacity');
      }
    } catch (err) {
      setError('Failed to allocate capacity');
      console.error('Error allocating capacity:', err);
    }
  };

  const handleAcceptCard = async (cardId: string) => {
    try {
      const response = await apiClient.acceptCard(cardId);
      if (response.success) {
        // Refresh game state after accepting card
        const stateResponse = await apiClient.getGameState();
        if (stateResponse.success && stateResponse.data) {
          setGameState(stateResponse.data);
        }
      } else {
        setError(response.error?.message || 'Failed to accept card');
      }
    } catch (err) {
      setError('Failed to accept card');
      console.error('Error accepting card:', err);
    }
  };

  const handleUseToken = async (cardId: string) => {
    try {
      const response = await apiClient.useToken(cardId);
      if (response.success) {
        // Refresh game state after using token
        const stateResponse = await apiClient.getGameState();
        if (stateResponse.success && stateResponse.data) {
          setGameState(stateResponse.data);
        }
      } else {
        setError(response.error?.message || 'Failed to use token');
      }
    } catch (err) {
      setError('Failed to use token');
      console.error('Error using token:', err);
    }
  };

  const handleAllocateTechnicalDebt = (effort: number) => {
    console.log(`Allocating ${effort} effort to technical debt`);
    // TODO: Implement technical debt allocation
  };

  const handleRejectCard = async (cardId: string) => {
    try {
      const response = await apiClient.rejectCard(cardId);
      if (response.success) {
        // Refresh game state after rejecting card
        const stateResponse = await apiClient.getGameState();
        if (stateResponse.success && stateResponse.data) {
          setGameState(stateResponse.data);
        }
      } else {
        setError(response.error?.message || 'Failed to reject card');
      }
    } catch (err) {
      setError('Failed to reject card');
      console.error('Error rejecting card:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="app loading">
        <div className="loading-screen">
          <h1>Scrum Velocity Simulator</h1>
          <div className="loading-spinner"></div>
          <p>Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app error">
        <div className="error-screen">
          <h1>Scrum Velocity Simulator</h1>
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show setup screen if no game state and no error (server not running)
  if (!gameState && !isLoading && !error) {
    return (
      <div className="app setup">
        <div className="setup-screen">
          <h1>Scrum Velocity Simulator</h1>
          <div className="setup-icon">🚀</div>
          <h2>Welcome to the Scrum Game!</h2>
          <p>To get started, you need to start the backend server:</p>
          
          <div className="setup-instructions">
            <h3>Setup Instructions:</h3>
            <ol>
              <li>Open a new terminal</li>
              <li>Navigate to the server directory: <code>cd server</code></li>
              <li>Start the server: <code>npm run dev</code></li>
              <li>Return here and click "Connect to Server"</li>
            </ol>
          </div>
          
          <div className="setup-actions">
            <button onClick={() => window.location.reload()} className="primary-button">
              Connect to Server
            </button>
            <p className="setup-note">
              The server runs on <strong>http://localhost:5000</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // This should never happen, but TypeScript needs it
  if (!gameState) {
    return (
      <div className="app loading">
        <div className="loading-screen">
          <h1>Scrum Velocity Simulator</h1>
          <div className="loading-spinner"></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>Scrum Velocity Simulator</h1>
          <div className="game-info">
            <span className="turn-info">Turn: {gameState.boardState.currentTurn}</span>
            <span className="phase-info">Phase: {gameState.boardState.currentPhase}</span>
            <span className="player-info">Current Player: {currentPlayer.replace('-', ' ')}</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        {gameState.boardState.currentPhase === 'Retrospective' ? (
          <RetrospectivePage
            gameState={gameState}
            currentPlayer={currentPlayer}
            onRecordAdaptation={(adaptation) => console.log('Adaptation recorded:', adaptation)}
            onCompleteRetrospective={handleAdvanceTurn}
            isLoading={isLoading}
          />
        ) : (
          <div className="game-layout">
            {/* Game Board - Takes up most of the space */}
            <div className="game-board-section">
              <GameBoard
                columns={gameState.boardState.columns}
                onCardMove={handleCardMove}
                onCardClick={handleCardClick}
                currentPhase={gameState.boardState.currentPhase}
                currentPlayer={currentPlayer}
              />
            </div>

            {/* Side Panel - Game State and Actions */}
            <div className="side-panel">
              <GameStatePanel
                gameState={gameState}
                currentPhase={gameState.boardState.currentPhase}
                scrumMasterState={gameState.scrumMasterState}
                onAdvancePhase={handleAdvancePhase}
                onAdvanceTurn={handleAdvanceTurn}
              />

              <RoleActionPanel
                currentPlayer={currentPlayer}
                currentPhase={gameState.boardState.currentPhase}
                availableCards={[]} // TODO: Filter based on current phase and player
                selectedCards={[]}
                onCardSelect={handleCardSelect}
                onRollDice={handleRollDice}
                onAllocateCapacity={handleAllocateCapacity}
                onAcceptCard={handleAcceptCard}
                onRejectCard={handleRejectCard}
                onUseToken={handleUseToken}
                onAllocateTechnicalDebt={handleAllocateTechnicalDebt}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;