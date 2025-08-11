import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppConfigService } from './app-config.service';

export interface GameData {
  _id?: string;
  id?: string; // Keep for backward compatibility
  homeTeam: {
    name: string;
    score: number;
  };
  awayTeam: {
    name: string;
    score: number;
  };
  status: 'active' | 'completed' | 'paused';
  gameTime: string;
  scoreHistory: Array<{
    team: 'home' | 'away';
    points: number;
    type: 'Try' | 'Conversion' | 'Penalty' | 'Drop Goal' | 'Penalty Try';
    timestamp: string;
    gameTime: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface GameStats {
  totalGames: number;
  completedGames: number;
  activeGames: number;
  averageScore: {
    home: number;
    away: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl: string;
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient, cfg: AppConfigService) {
    const base = cfg.apiUrl || 'http://localhost:3000/api';
    this.apiUrl = base.replace(/\/$/, '');
  }

  // Game CRUD operations
  getAllGames(): Observable<GameData[]> {
    return this.http.get<GameData[]>(`${this.apiUrl}/games`).pipe(
      map((games) =>
        games.map((game) => ({
          ...game,
          id: game._id || game.id, // Ensure compatibility with existing code
        }))
      ),
      catchError(this.handleError)
    );
  }

  getGameById(id: string): Observable<GameData> {
    return this.http.get<GameData>(`${this.apiUrl}/games/${id}`).pipe(
      map((game) => ({
        ...game,
        id: game._id || game.id,
      })),
      catchError(this.handleError)
    );
  }

  createGame(
    game: Omit<GameData, '_id' | 'id' | 'createdAt' | 'updatedAt'>
  ): Observable<GameData> {
    return this.http
      .post<GameData>(`${this.apiUrl}/games`, game, this.httpOptions)
      .pipe(
        map((game) => ({
          ...game,
          id: game._id || game.id,
        })),
        catchError(this.handleError)
      );
  }

  updateGame(id: string, game: Partial<GameData>): Observable<GameData> {
    return this.http
      .put<GameData>(`${this.apiUrl}/games/${id}`, game, this.httpOptions)
      .pipe(
        map((game) => ({
          ...game,
          id: game._id || game.id,
        })),
        catchError(this.handleError)
      );
  }

  deleteGame(id: string): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/games/${id}`)
      .pipe(catchError(this.handleError));
  }

  deleteAllGames(): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/games`)
      .pipe(catchError(this.handleError));
  }

  // Game statistics
  getGameStats(): Observable<GameStats> {
    return this.http
      .get<GameStats>(`${this.apiUrl}/games/stats`)
      .pipe(catchError(this.handleError));
  }

  // Health check
  healthCheck(): Observable<any> {
    return this.http
      .get(`${this.apiUrl.replace('/api', '')}/health`)
      .pipe(catchError(this.handleError));
  }

  // Error handling
  private handleError(error: any) {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';

    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return throwError(() => new Error(errorMessage));
  }
}
