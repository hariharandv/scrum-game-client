// Game State Persistence Service
// Handles saving and loading game state to/from local storage

import type { GameState } from '../types/game';

const STORAGE_KEY = 'scrum-game-state';
const SAVED_GAMES_KEY = 'scrum-game-saved-games';

export interface SavedGame {
  id: string;
  name: string;
  gameState: GameState;
  savedAt: Date;
  description?: string;
}

export class GameStateService {
  // Save current game state
  static saveGame(gameState: GameState, name?: string): string {
    try {
      const gameId = gameState.id;
      const savedGame: SavedGame = {
        id: gameId,
        name: name || `Game ${new Date().toLocaleDateString()}`,
        gameState,
        savedAt: new Date(),
        description: `Sprint ${gameState.boardState.currentTurn}, Phase ${gameState.boardState.currentPhase}`
      };

      // Save to localStorage
      localStorage.setItem(`${STORAGE_KEY}-${gameId}`, JSON.stringify(savedGame));

      // Update saved games list
      this.updateSavedGamesList(savedGame);

      return gameId;
    } catch (error) {
      console.error('Failed to save game:', error);
      throw new Error('Failed to save game state');
    }
  }

  // Load game state by ID
  static loadGame(gameId: string): GameState | null {
    try {
      const savedGameJson = localStorage.getItem(`${STORAGE_KEY}-${gameId}`);
      if (!savedGameJson) {
        return null;
      }

      const savedGame: SavedGame = JSON.parse(savedGameJson);
      return savedGame.gameState;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  // Get all saved games
  static getSavedGames(): SavedGame[] {
    try {
      const savedGamesJson = localStorage.getItem(SAVED_GAMES_KEY);
      if (!savedGamesJson) {
        return [];
      }

      const savedGames: SavedGame[] = JSON.parse(savedGamesJson);
      return savedGames.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    } catch (error) {
      console.error('Failed to get saved games:', error);
      return [];
    }
  }

  // Delete saved game
  static deleteGame(gameId: string): boolean {
    try {
      localStorage.removeItem(`${STORAGE_KEY}-${gameId}`);

      // Update saved games list
      const savedGames = this.getSavedGames().filter(game => game.id !== gameId);
      localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(savedGames));

      return true;
    } catch (error) {
      console.error('Failed to delete game:', error);
      return false;
    }
  }

  // Auto-save current game state
  static autoSave(gameState: GameState): void {
    try {
      const autoSaveKey = `${STORAGE_KEY}-autosave`;
      const autoSave: SavedGame = {
        id: 'autosave',
        name: 'Auto-saved Game',
        gameState,
        savedAt: new Date(),
        description: `Auto-saved: Sprint ${gameState.boardState.currentTurn}, Phase ${gameState.boardState.currentPhase}`
      };

      localStorage.setItem(autoSaveKey, JSON.stringify(autoSave));
    } catch (error) {
      console.error('Failed to auto-save:', error);
    }
  }

  // Load auto-saved game
  static loadAutoSave(): GameState | null {
    try {
      const autoSaveJson = localStorage.getItem(`${STORAGE_KEY}-autosave`);
      if (!autoSaveJson) {
        return null;
      }

      const autoSave: SavedGame = JSON.parse(autoSaveJson);
      return autoSave.gameState;
    } catch (error) {
      console.error('Failed to load auto-save:', error);
      return null;
    }
  }

  // Check if auto-save exists
  static hasAutoSave(): boolean {
    return localStorage.getItem(`${STORAGE_KEY}-autosave`) !== null;
  }

  // Export game state as JSON
  static exportGame(gameState: GameState): string {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      gameState
    };
    return JSON.stringify(exportData, null, 2);
  }

  // Import game state from JSON
  static importGame(jsonData: string): GameState {
    try {
      const importData = JSON.parse(jsonData);

      // Basic validation
      if (!importData.gameState) {
        throw new Error('Invalid game data format');
      }

      return importData.gameState;
    } catch (error) {
      console.error('Failed to import game:', error);
      throw new Error('Failed to import game data');
    }
  }

  // Clear all saved games
  static clearAllSavedGames(): void {
    try {
      const savedGames = this.getSavedGames();
      savedGames.forEach(game => {
        localStorage.removeItem(`${STORAGE_KEY}-${game.id}`);
      });
      localStorage.removeItem(SAVED_GAMES_KEY);
      localStorage.removeItem(`${STORAGE_KEY}-autosave`);
    } catch (error) {
      console.error('Failed to clear saved games:', error);
    }
  }

  // Private method to update saved games list
  private static updateSavedGamesList(savedGame: SavedGame): void {
    try {
      const savedGames = this.getSavedGames();

      // Remove existing entry with same ID
      const filteredGames = savedGames.filter(game => game.id !== savedGame.id);

      // Add new/updated game
      filteredGames.push(savedGame);

      // Keep only last 10 saved games
      const recentGames = filteredGames.slice(-10);

      localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(recentGames));
    } catch (error) {
      console.error('Failed to update saved games list:', error);
    }
  }
}