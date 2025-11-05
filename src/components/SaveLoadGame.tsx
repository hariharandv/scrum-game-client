import React, { useState, useEffect } from 'react';
import { GameStateService } from '../services/gameState';
import type { SavedGame } from '../services/gameState';
import type { GameState } from '../types/game';
import './SaveLoadGame.css';

interface SaveLoadGameProps {
  currentGameState: GameState | null;
  onLoadGame: (gameState: GameState) => void;
  isLoading?: boolean;
}

export const SaveLoadGame: React.FC<SaveLoadGameProps> = ({
  currentGameState,
  onLoadGame,
  isLoading = false
}) => {
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingGame, setIsLoadingGame] = useState(false);

  // Load saved games list on mount
  useEffect(() => {
    loadSavedGames();
  }, []);

  const loadSavedGames = () => {
    const games = GameStateService.getSavedGames();
    setSavedGames(games);
  };

  const handleSaveGame = async () => {
    if (!currentGameState || !saveName.trim()) return;

    setIsSaving(true);
    try {
      await GameStateService.saveGame(currentGameState, saveName.trim());
      setShowSaveDialog(false);
      setSaveName('');
      loadSavedGames(); // Refresh the list
    } catch (error) {
      console.error('Failed to save game:', error);
      alert('Failed to save game. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadGame = async (savedGame: SavedGame) => {
    setIsLoadingGame(true);
    try {
      onLoadGame(savedGame.gameState);
      setShowLoadDialog(false);
    } catch (error) {
      console.error('Failed to load game:', error);
      alert('Failed to load game. Please try again.');
    } finally {
      setIsLoadingGame(false);
    }
  };

  const handleDeleteGame = (gameId: string) => {
    if (window.confirm('Are you sure you want to delete this saved game?')) {
      const success = GameStateService.deleteGame(gameId);
      if (success) {
        loadSavedGames(); // Refresh the list
      } else {
        alert('Failed to delete game. Please try again.');
      }
    }
  };

  const handleExportGame = () => {
    if (!currentGameState) return;

    try {
      const exportData = GameStateService.exportGame(currentGameState);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scrum-game-${currentGameState.id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export game:', error);
      alert('Failed to export game. Please try again.');
    }
  };

  const handleImportGame = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const gameState = GameStateService.importGame(jsonData);
        onLoadGame(gameState);
      } catch (error) {
        console.error('Failed to import game:', error);
        alert('Failed to import game. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  return (
    <div className="save-load-game">
      <div className="game-actions">
        <button
          className="action-button save"
          onClick={() => setShowSaveDialog(true)}
          disabled={!currentGameState || isLoading}
        >
          💾 Save Game
        </button>

        <button
          className="action-button load"
          onClick={() => setShowLoadDialog(true)}
          disabled={isLoading}
        >
          📁 Load Game
        </button>

        <button
          className="action-button export"
          onClick={handleExportGame}
          disabled={!currentGameState || isLoading}
        >
          📤 Export
        </button>

        <label className="action-button import">
          📥 Import
          <input
            type="file"
            accept=".json"
            onChange={handleImportGame}
            style={{ display: 'none' }}
            disabled={isLoading}
          />
        </label>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Save Game</h3>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="save-name">Save Name:</label>
                <input
                  id="save-name"
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Enter a name for this save"
                  disabled={isSaving}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowSaveDialog(false)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="save-button"
                onClick={handleSaveGame}
                disabled={!saveName.trim() || isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Load Game</h3>
            <div className="modal-body">
              {savedGames.length === 0 ? (
                <p className="no-saves">No saved games found.</p>
              ) : (
                <div className="saved-games-list">
                  {savedGames.map((savedGame) => (
                    <div key={savedGame.id} className="saved-game-item">
                      <div className="game-info">
                        <div className="game-name">{savedGame.name}</div>
                        <div className="game-description">{savedGame.description}</div>
                        <div className="game-date">
                          Saved: {new Date(savedGame.savedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="game-actions">
                        <button
                          className="load-button"
                          onClick={() => handleLoadGame(savedGame)}
                          disabled={isLoadingGame}
                        >
                          {isLoadingGame ? 'Loading...' : 'Load'}
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteGame(savedGame.id)}
                          disabled={isLoadingGame}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowLoadDialog(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};