import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Team {
  name: string;
  score: number;
  tries: number;
  conversions: number;
  penalties: number;
  dropGoals: number;
  penaltyTries: number;
}

export interface ScoreEvent {
  timestamp: Date;
  team: string;
  scoreType: string;
  points: number;
  description: string;
}

@Component({
  selector: 'app-simple-score-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simple-score-tracker.component.html',
  styleUrls: ['./simple-score-tracker.component.scss'],
})
export class SimpleScoreTrackerComponent {
  homeTeam: Team = {
    name: 'Home Team',
    score: 0,
    tries: 0,
    conversions: 0,
    penalties: 0,
    dropGoals: 0,
    penaltyTries: 0,
  };

  awayTeam: Team = {
    name: 'Away Team',
    score: 0,
    tries: 0,
    conversions: 0,
    penalties: 0,
    dropGoals: 0,
    penaltyTries: 0,
  };

  gameStarted = false;
  gameTime = '00:00';
  gameTimer: any;
  startTime: Date | null = null;
  scoreHistory: ScoreEvent[] = [];
  notification = '';

  startGame() {
    this.gameStarted = true;
    this.startTime = new Date();
    this.startTimer();
    this.showNotification('Game Started! 🏈');
  }

  endGame() {
    this.gameStarted = false;
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
    this.showNotification('Game Ended! 🏁');
  }

  resetGame() {
    this.gameStarted = false;
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
    this.gameTime = '00:00';
    this.startTime = null;
    this.scoreHistory = [];

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

    this.showNotification('Game Reset! 🔄');
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

    this.showNotification(`${description} (+${points} pts) 🎯`);
  }

  undoLastScore() {
    if (this.scoreHistory.length === 0) {
      this.showNotification('No scores to undo ❌');
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

    this.showNotification(`Undid: ${lastScore.description} ↶`);
  }

  editTeamName(team: 'home' | 'away') {
    const targetTeam = team === 'home' ? this.homeTeam : this.awayTeam;
    const newName = prompt(
      `Enter new name for ${targetTeam.name}:`,
      targetTeam.name
    );
    if (newName && newName.trim()) {
      targetTeam.name = newName.trim();
      this.showNotification(`Team renamed to ${targetTeam.name} ✏️`);
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

  private showNotification(message: string) {
    this.notification = message;
    // Simple notification system - you could enhance this
    console.log(`🏈 ${message}`);
    setTimeout(() => {
      this.notification = '';
    }, 3000);
  }
}
