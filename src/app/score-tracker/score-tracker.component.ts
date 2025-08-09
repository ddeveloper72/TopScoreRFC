import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameStorageService } from '../services/game-storage.service';
import { fadeInOut, slideInFromBottom } from '../animations/route-animations';

export interface Team {
  name: string;
  score: number;
  tries: number;
  conversions: number;
  penalties: number;
  dropGoals: number;
  penaltyTries: number;
  color: string;
}

export interface ScoreEvent {
  timestamp: Date;
  team: string;
  scoreType: string;
  points: number;
  description: string;
}

@Component({
  selector: 'app-score-tracker',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatToolbarModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './score-tracker.component.html',
  styleUrl: './score-tracker.component.scss',
  animations: [fadeInOut, slideInFromBottom],
})
export class ScoreTrackerComponent implements OnInit, OnDestroy {
  homeTeam: Team = {
    name: 'Home Team',
    score: 0,
    tries: 0,
    conversions: 0,
    penalties: 0,
    dropGoals: 0,
    penaltyTries: 0,
    color: '#1976d2',
  };

  awayTeam: Team = {
    name: 'Away Team',
    score: 0,
    tries: 0,
    conversions: 0,
    penalties: 0,
    dropGoals: 0,
    penaltyTries: 0,
    color: '#388e3c',
  };

  gameStarted = false;
  gameTime = '00:00';
  gameTimer: any;
  startTime: Date | null = null;
  scoreHistory: ScoreEvent[] = [];

  // Game persistence
  private currentGameId: string | null = null;
  private subscription = new Subscription();
  private autoSaveInterval: any;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private gameStorageService: GameStorageService
  ) {}

  ngOnInit(): void {
    // Check for pre-filled team names from route params
    this.route.queryParams.subscribe((params) => {
      if (params['homeTeam']) {
        this.homeTeam.name = params['homeTeam'];
      }
      if (params['awayTeam']) {
        this.awayTeam.name = params['awayTeam'];
      }
      if (params['matchId']) {
        // TODO: Link to match from calendar
        console.log('Match ID:', params['matchId']);
      }
    });

    // Try to load existing active game
    this.loadActiveGame();

    // Setup auto-save every 30 seconds during active games
    this.autoSaveInterval = setInterval(() => {
      if (this.gameStarted && this.currentGameId) {
        this.saveGameState();
      }
    }, 30000);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    // Save game state before leaving
    if (this.gameStarted && this.currentGameId) {
      this.saveGameState();
    }
  }

  startGame() {
    this.gameStarted = true;
    this.startTime = new Date();

    // Create new game in storage if not already exists
    if (!this.currentGameId) {
      this.createNewGame();
    }

    this.startTimer();
    this.snackBar.open('Game Started!', 'Close', { duration: 2000 });

    // Save initial state
    this.saveGameState();
  }

  endGame() {
    this.gameStarted = false;
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }

    // Mark game as completed and save
    if (this.currentGameId) {
      this.saveGameState();
    }

    this.snackBar.open('Game Ended!', 'Close', { duration: 2000 });
  }

  resetGame() {
    this.gameStarted = false;
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
    this.gameTime = '00:00';
    this.startTime = null;
    this.scoreHistory = [];
    this.currentGameId = null; // Clear current game reference

    // Reset scores
    this.homeTeam = {
      ...this.homeTeam,
      score: 0,
      tries: 0,
      conversions: 0,
      penalties: 0,
      dropGoals: 0,
      penaltyTries: 0,
    };
    this.awayTeam = {
      ...this.awayTeam,
      score: 0,
      tries: 0,
      conversions: 0,
      penalties: 0,
      dropGoals: 0,
      penaltyTries: 0,
    };

    this.snackBar.open('Game Reset!', 'Close', { duration: 2000 });
  }

  private startTimer() {
    this.gameTimer = setInterval(() => {
      if (this.startTime) {
        const now = new Date();
        const diff = now.getTime() - this.startTime.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        this.gameTime = `${minutes.toString().padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}`;
      }
    }, 1000);
  }

  addScore(team: 'home' | 'away', scoreType: string) {
    const targetTeam = team === 'home' ? this.homeTeam : this.awayTeam;
    let points = 0;
    let description = '';

    switch (scoreType) {
      case 'try':
        points = 5;
        targetTeam.tries++;
        description = `Try scored by ${targetTeam.name}`;
        break;
      case 'conversion':
        points = 2;
        targetTeam.conversions++;
        description = `Conversion by ${targetTeam.name}`;
        break;
      case 'penalty':
        points = 3;
        targetTeam.penalties++;
        description = `Penalty kick by ${targetTeam.name}`;
        break;
      case 'dropGoal':
        points = 3;
        targetTeam.dropGoals++;
        description = `Drop goal by ${targetTeam.name}`;
        break;
      case 'penaltyTry':
        points = 5;
        targetTeam.penaltyTries++;
        description = `Penalty try awarded to ${targetTeam.name}`;
        break;
    }

    targetTeam.score += points;

    // Add to history
    this.scoreHistory.unshift({
      timestamp: new Date(),
      team: targetTeam.name,
      scoreType: scoreType,
      points: points,
      description: description,
    });

    this.snackBar.open(`${description} (+${points} pts)`, 'Close', {
      duration: 3000,
    });

    // Save game state after scoring
    if (this.currentGameId) {
      this.saveGameState();
    }
  }

  undoLastScore() {
    if (this.scoreHistory.length === 0) {
      this.snackBar.open('No scores to undo', 'Close', { duration: 2000 });
      return;
    }

    const lastScore = this.scoreHistory.shift()!;
    const targetTeam =
      lastScore.team === this.homeTeam.name ? this.homeTeam : this.awayTeam;

    // Remove points
    targetTeam.score -= lastScore.points;

    // Remove from specific counters
    switch (lastScore.scoreType) {
      case 'try':
        targetTeam.tries--;
        break;
      case 'conversion':
        targetTeam.conversions--;
        break;
      case 'penalty':
        targetTeam.penalties--;
        break;
      case 'dropGoal':
        targetTeam.dropGoals--;
        break;
      case 'penaltyTry':
        targetTeam.penaltyTries--;
        break;
    }

    this.snackBar.open(`Undid: ${lastScore.description}`, 'Close', {
      duration: 3000,
    });

    // Save game state after undo
    if (this.currentGameId) {
      this.saveGameState();
    }
  }

  editTeamName(team: 'home' | 'away') {
    const targetTeam = team === 'home' ? this.homeTeam : this.awayTeam;
    const newName = prompt(
      `Enter new name for ${targetTeam.name}:`,
      targetTeam.name
    );
    if (newName && newName.trim()) {
      targetTeam.name = newName.trim();
    }
  }

  getWinningTeam(): Team | null {
    if (this.homeTeam.score > this.awayTeam.score) return this.homeTeam;
    if (this.awayTeam.score > this.homeTeam.score) return this.awayTeam;
    return null;
  }

  getScoreDifference(): number {
    return Math.abs(this.homeTeam.score - this.awayTeam.score);
  }

  /**
   * Save current game state to storage
   */
  private saveGameState(): void {
    if (!this.currentGameId) {
      return;
    }

    const gameData = {
      homeTeam: {
        name: this.homeTeam.name,
        score: this.homeTeam.score,
        breakdown: {
          tries: this.homeTeam.tries,
          conversions: this.homeTeam.conversions,
          penalties: this.homeTeam.penalties,
          dropGoals: this.homeTeam.dropGoals,
          penaltyTries: this.homeTeam.penaltyTries,
        },
      },
      awayTeam: {
        name: this.awayTeam.name,
        score: this.awayTeam.score,
        breakdown: {
          tries: this.awayTeam.tries,
          conversions: this.awayTeam.conversions,
          penalties: this.awayTeam.penalties,
          dropGoals: this.awayTeam.dropGoals,
          penaltyTries: this.awayTeam.penaltyTries,
        },
      },
      gameTime: this.gameTime,
      scoreHistory: this.scoreHistory,
      status: this.gameStarted
        ? 'active'
        : ('completed' as 'active' | 'completed'),
    };

    this.gameStorageService.updateGame(this.currentGameId, gameData);
  }

  /**
   * Load active game from storage if it exists
   */
  private loadActiveGame(): void {
    const activeGames = this.gameStorageService
      .getGames()
      .filter((game) => game.status === 'active');

    if (activeGames.length > 0) {
      const game = activeGames[0]; // Load the most recent active game
      this.currentGameId = game.id;

      // Restore game state
      this.homeTeam = {
        name: game.homeTeam.name,
        score: game.homeTeam.score,
        tries: game.homeTeam.breakdown?.tries || 0,
        conversions: game.homeTeam.breakdown?.conversions || 0,
        penalties: game.homeTeam.breakdown?.penalties || 0,
        dropGoals: game.homeTeam.breakdown?.dropGoals || 0,
        penaltyTries: game.homeTeam.breakdown?.penaltyTries || 0,
        color: '#1976d2',
      };

      this.awayTeam = {
        name: game.awayTeam.name,
        score: game.awayTeam.score,
        tries: game.awayTeam.breakdown?.tries || 0,
        conversions: game.awayTeam.breakdown?.conversions || 0,
        penalties: game.awayTeam.breakdown?.penalties || 0,
        dropGoals: game.awayTeam.breakdown?.dropGoals || 0,
        penaltyTries: game.awayTeam.breakdown?.penaltyTries || 0,
        color: '#388e3c',
      };

      this.gameTime = game.gameTime;
      this.scoreHistory = game.scoreHistory || [];
      this.gameStarted = true;

      // Resume timer if game is active
      this.startTime = new Date(game.timestamp);
      this.startTimer();

      this.snackBar.open('Restored active game!', 'Close', { duration: 3000 });
    }
  }

  /**
   * Create a new game in storage
   */
  private createNewGame(): void {
    const gameData = {
      homeTeam: {
        name: this.homeTeam.name,
        score: 0,
        breakdown: {
          tries: 0,
          conversions: 0,
          penalties: 0,
          dropGoals: 0,
          penaltyTries: 0,
        },
      },
      awayTeam: {
        name: this.awayTeam.name,
        score: 0,
        breakdown: {
          tries: 0,
          conversions: 0,
          penalties: 0,
          dropGoals: 0,
          penaltyTries: 0,
        },
      },
      gameTime: '00:00',
      scoreHistory: [],
      status: 'active' as 'active' | 'completed',
    };

    this.currentGameId = this.gameStorageService.saveGame(gameData);
  }
}
