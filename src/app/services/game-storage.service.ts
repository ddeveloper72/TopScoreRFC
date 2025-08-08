import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface GameData {
  id: string;
  timestamp: Date;
  homeTeam: {
    name: string;
    score: number;
    breakdown: any;
  };
  awayTeam: {
    name: string;
    score: number;
    breakdown: any;
  };
  gameTime: string;
  scoreHistory: any[];
  status: 'active' | 'completed';
}

@Injectable({
  providedIn: 'root',
})
export class GameStorageService {
  private readonly STORAGE_KEY = 'rugby-score-games';
  private gamesSubject = new BehaviorSubject<GameData[]>([]);
  public games$ = this.gamesSubject.asObservable();

  constructor() {
    this.loadGames();
  }

  /**
   * Save a game to local storage
   */
  saveGame(gameData: Omit<GameData, 'id' | 'timestamp'>): string {
    const games = this.getGames();
    const newGame: GameData = {
      ...gameData,
      id: this.generateId(),
      timestamp: new Date(),
    };

    games.push(newGame);
    this.setGames(games);
    return newGame.id;
  }

  /**
   * Update an existing game
   */
  updateGame(id: string, gameData: Partial<GameData>): boolean {
    const games = this.getGames();
    const gameIndex = games.findIndex((g) => g.id === id);

    if (gameIndex === -1) {
      return false;
    }

    games[gameIndex] = { ...games[gameIndex], ...gameData };
    this.setGames(games);
    return true;
  }

  /**
   * Get all saved games
   */
  getGames(): GameData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading games from localStorage:', error);
      return [];
    }
  }

  /**
   * Get a specific game by ID
   */
  getGame(id: string): GameData | null {
    const games = this.getGames();
    return games.find((g) => g.id === id) || null;
  }

  /**
   * Delete a game
   */
  deleteGame(id: string): boolean {
    const games = this.getGames();
    const filteredGames = games.filter((g) => g.id !== id);

    if (filteredGames.length === games.length) {
      return false; // Game not found
    }

    this.setGames(filteredGames);
    return true;
  }

  /**
   * Clear all games
   */
  clearAllGames(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.gamesSubject.next([]);
  }

  /**
   * Export games as JSON
   */
  exportGames(): string {
    const games = this.getGames();
    return JSON.stringify(games, null, 2);
  }

  /**
   * Import games from JSON
   */
  importGames(jsonString: string): boolean {
    try {
      const importedGames = JSON.parse(jsonString);
      if (Array.isArray(importedGames)) {
        const existingGames = this.getGames();
        const allGames = [...existingGames, ...importedGames];
        this.setGames(allGames);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing games:', error);
      return false;
    }
  }

  /**
   * Get game statistics
   */
  getStatistics() {
    const games = this.getGames();
    const completedGames = games.filter((g) => g.status === 'completed');

    return {
      totalGames: games.length,
      completedGames: completedGames.length,
      activeGames: games.length - completedGames.length,
      averageScore: this.calculateAverageScore(completedGames),
      mostRecentGame: games.length > 0 ? games[games.length - 1] : null,
    };
  }

  private setGames(games: GameData[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(games));
      this.gamesSubject.next(games);
    } catch (error) {
      console.error('Error saving games to localStorage:', error);
    }
  }

  private loadGames(): void {
    const games = this.getGames();
    this.gamesSubject.next(games);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private calculateAverageScore(games: GameData[]) {
    if (games.length === 0) return { home: 0, away: 0 };

    const totals = games.reduce(
      (acc, game) => ({
        home: acc.home + game.homeTeam.score,
        away: acc.away + game.awayTeam.score,
      }),
      { home: 0, away: 0 }
    );

    return {
      home: Math.round(totals.home / games.length),
      away: Math.round(totals.away / games.length),
    };
  }
}
