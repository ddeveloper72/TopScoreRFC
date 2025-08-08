import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, catchError, map } from 'rxjs';
import { ApiService, GameData as ApiGameData, GameStats } from './api.service';

// Keep existing interface for backward compatibility
export interface GameData {
  id: string;
  timestamp: Date | string;
  homeTeam: {
    name: string;
    score: number;
    breakdown?: any;
  };
  awayTeam: {
    name: string;
    score: number;
    breakdown?: any;
  };
  gameTime: string;
  scoreHistory: any[];
  status: 'active' | 'completed' | 'paused';
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GameStorageService {
  private readonly STORAGE_KEY = 'rugby-score-games';
  private gamesSubject = new BehaviorSubject<GameData[]>([]);
  public games$ = this.gamesSubject.asObservable();

  private useApi = true; // Set to false to use only localStorage
  private fallbackToLocal = true; // Fallback to localStorage if API fails

  constructor(private apiService: ApiService) {
    this.loadGames();
  }

  /**
   * Load games from API or localStorage
   */
  private loadGames(): void {
    if (this.useApi) {
      this.loadGamesFromApi();
    } else {
      this.loadGamesFromLocalStorage();
    }
  }

  private loadGamesFromApi(): void {
    this.apiService.getAllGames().subscribe({
      next: (games) => {
        const convertedGames = games.map((game) =>
          this.convertApiToLocal(game)
        );
        this.gamesSubject.next(convertedGames);
      },
      error: (error) => {
        console.warn(
          'Failed to load games from API, falling back to localStorage:',
          error
        );
        if (this.fallbackToLocal) {
          this.loadGamesFromLocalStorage();
        }
      },
    });
  }

  private loadGamesFromLocalStorage(): void {
    const games = this.getGamesFromStorage();
    this.gamesSubject.next(games);
  }

  /**
   * Save a game (API first, then localStorage fallback)
   */
  saveGame(gameData: Omit<GameData, 'id' | 'timestamp'>): Observable<string> {
    if (this.useApi) {
      return this.saveGameToApi(gameData);
    } else {
      return this.saveGameToLocalStorage(gameData);
    }
  }

  private saveGameToApi(
    gameData: Omit<GameData, 'id' | 'timestamp'>
  ): Observable<string> {
    const apiGameData = this.convertLocalToApi(gameData);

    return this.apiService.createGame(apiGameData).pipe(
      map((savedGame) => {
        const convertedGame = this.convertApiToLocal(savedGame);
        const currentGames = this.gamesSubject.value;
        this.gamesSubject.next([...currentGames, convertedGame]);
        return convertedGame.id;
      }),
      catchError((error) => {
        console.warn(
          'Failed to save game to API, falling back to localStorage:',
          error
        );
        if (this.fallbackToLocal) {
          return this.saveGameToLocalStorage(gameData);
        }
        throw error;
      })
    );
  }

  private saveGameToLocalStorage(
    gameData: Omit<GameData, 'id' | 'timestamp'>
  ): Observable<string> {
    const games = this.getGamesFromStorage();
    const newGame: GameData = {
      ...gameData,
      id: this.generateId(),
      timestamp: new Date(),
    };

    games.push(newGame);
    this.setGamesInStorage(games);
    this.gamesSubject.next(games);
    return of(newGame.id);
  }

  /**
   * Update a game
   */
  updateGame(id: string, updates: Partial<GameData>): Observable<boolean> {
    if (this.useApi) {
      return this.updateGameInApi(id, updates);
    } else {
      return this.updateGameInLocalStorage(id, updates);
    }
  }

  private updateGameInApi(
    id: string,
    updates: Partial<GameData>
  ): Observable<boolean> {
    const apiUpdates = this.convertLocalToApi(updates);

    return this.apiService.updateGame(id, apiUpdates).pipe(
      map((updatedGame) => {
        const convertedGame = this.convertApiToLocal(updatedGame);
        const currentGames = this.gamesSubject.value;
        const gameIndex = currentGames.findIndex((g) => g.id === id);

        if (gameIndex !== -1) {
          currentGames[gameIndex] = convertedGame;
          this.gamesSubject.next([...currentGames]);
        }
        return true;
      }),
      catchError((error) => {
        console.warn(
          'Failed to update game in API, falling back to localStorage:',
          error
        );
        if (this.fallbackToLocal) {
          return this.updateGameInLocalStorage(id, updates);
        }
        throw error;
      })
    );
  }

  private updateGameInLocalStorage(
    id: string,
    updates: Partial<GameData>
  ): Observable<boolean> {
    const games = this.getGamesFromStorage();
    const gameIndex = games.findIndex((g) => g.id === id);

    if (gameIndex !== -1) {
      games[gameIndex] = { ...games[gameIndex], ...updates };
      this.setGamesInStorage(games);
      this.gamesSubject.next(games);
      return of(true);
    }
    return of(false);
  }

  /**
   * Delete a game
   */
  deleteGame(id: string): Observable<boolean> {
    if (this.useApi) {
      return this.deleteGameFromApi(id);
    } else {
      return this.deleteGameFromLocalStorage(id);
    }
  }

  private deleteGameFromApi(id: string): Observable<boolean> {
    return this.apiService.deleteGame(id).pipe(
      map(() => {
        const currentGames = this.gamesSubject.value;
        const filteredGames = currentGames.filter((g) => g.id !== id);
        this.gamesSubject.next(filteredGames);
        return true;
      }),
      catchError((error) => {
        console.warn(
          'Failed to delete game from API, falling back to localStorage:',
          error
        );
        if (this.fallbackToLocal) {
          return this.deleteGameFromLocalStorage(id);
        }
        throw error;
      })
    );
  }

  private deleteGameFromLocalStorage(id: string): Observable<boolean> {
    const games = this.getGamesFromStorage();
    const filteredGames = games.filter((g) => g.id !== id);
    this.setGamesInStorage(filteredGames);
    this.gamesSubject.next(filteredGames);
    return of(true);
  }

  /**
   * Clear all games
   */
  clearAllGames(): Observable<boolean> {
    if (this.useApi) {
      return this.clearAllGamesFromApi();
    } else {
      return this.clearAllGamesFromLocalStorage();
    }
  }

  private clearAllGamesFromApi(): Observable<boolean> {
    return this.apiService.deleteAllGames().pipe(
      map(() => {
        this.gamesSubject.next([]);
        return true;
      }),
      catchError((error) => {
        console.warn(
          'Failed to clear all games from API, falling back to localStorage:',
          error
        );
        if (this.fallbackToLocal) {
          return this.clearAllGamesFromLocalStorage();
        }
        throw error;
      })
    );
  }

  private clearAllGamesFromLocalStorage(): Observable<boolean> {
    localStorage.removeItem(this.STORAGE_KEY);
    this.gamesSubject.next([]);
    return of(true);
  }

  /**
   * Get games (synchronous for backward compatibility)
   */
  getGames(): GameData[] {
    return this.gamesSubject.value;
  }

  /**
   * Get games from localStorage
   */
  private getGamesFromStorage(): GameData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error parsing games from localStorage:', error);
    }
    return [];
  }

  /**
   * Set games in localStorage
   */
  private setGamesInStorage(games: GameData[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(games));
    } catch (error) {
      console.error('Error saving games to localStorage:', error);
    }
  }

  /**
   * Convert API GameData to local GameData format
   */
  private convertApiToLocal(apiGame: ApiGameData): GameData {
    return {
      id: apiGame._id || apiGame.id || '',
      timestamp: apiGame.createdAt || new Date().toISOString(),
      homeTeam: {
        name: apiGame.homeTeam.name,
        score: apiGame.homeTeam.score,
        breakdown: {},
      },
      awayTeam: {
        name: apiGame.awayTeam.name,
        score: apiGame.awayTeam.score,
        breakdown: {},
      },
      gameTime: apiGame.gameTime,
      scoreHistory: apiGame.scoreHistory || [],
      status: apiGame.status,
      createdAt: apiGame.createdAt,
      updatedAt: apiGame.updatedAt,
    };
  }

  /**
   * Convert local GameData to API GameData format
   */
  private convertLocalToApi(
    localGame: Partial<GameData>
  ): Partial<ApiGameData> {
    const apiGame: Partial<ApiGameData> = {};

    if (localGame.homeTeam) {
      apiGame.homeTeam = {
        name: localGame.homeTeam.name,
        score: localGame.homeTeam.score,
      };
    }

    if (localGame.awayTeam) {
      apiGame.awayTeam = {
        name: localGame.awayTeam.name,
        score: localGame.awayTeam.score,
      };
    }

    if (localGame.gameTime) apiGame.gameTime = localGame.gameTime;
    if (localGame.status) apiGame.status = localGame.status;
    if (localGame.scoreHistory) apiGame.scoreHistory = localGame.scoreHistory;

    return apiGame;
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get game statistics
   */
  getGameStatistics(): Observable<GameStats | any> {
    if (this.useApi) {
      return this.apiService.getGameStats().pipe(
        catchError((error) => {
          console.warn(
            'Failed to get stats from API, calculating from local data:',
            error
          );
          return of(this.calculateLocalStats());
        })
      );
    } else {
      return of(this.calculateLocalStats());
    }
  }

  private calculateLocalStats(): any {
    const games = this.getGames();
    const totalGames = games.length;
    const completedGames = games.filter((g) => g.status === 'completed').length;
    const activeGames = games.filter((g) => g.status === 'active').length;

    let totalHomeScore = 0;
    let totalAwayScore = 0;
    const completedGamesList = games.filter((g) => g.status === 'completed');

    completedGamesList.forEach((game) => {
      totalHomeScore += game.homeTeam.score;
      totalAwayScore += game.awayTeam.score;
    });

    const averageHomeScore =
      completedGamesList.length > 0
        ? Math.round(totalHomeScore / completedGamesList.length)
        : 0;
    const averageAwayScore =
      completedGamesList.length > 0
        ? Math.round(totalAwayScore / completedGamesList.length)
        : 0;

    return {
      totalGames,
      completedGames,
      activeGames,
      averageScore: {
        home: averageHomeScore,
        away: averageAwayScore,
      },
    };
  }

  /**
   * Set API usage mode
   */
  setUseApi(useApi: boolean): void {
    this.useApi = useApi;
    this.loadGames(); // Reload games with new mode
  }

  /**
   * Check if API is being used
   */
  isUsingApi(): boolean {
    return this.useApi;
  }

  /**
   * Test API connection
   */
  testApiConnection(): Observable<boolean> {
    return this.apiService.healthCheck().pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
