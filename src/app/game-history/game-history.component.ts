import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { GameStorageService, GameData } from '../services/game-storage.service';
import { RugbyBallPrimaryComponent, RugbyBallGrayComponent, RugbyBallAccentComponent } from '../shared/rugby-ball-variants/rugby-ball-variants.component';

interface GameFilter {
  search: string;
  status: 'all' | 'completed' | 'active';
  sortBy: 'date' | 'score' | 'teams';
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: 'app-game-history',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MaterialModule, RugbyBallPrimaryComponent, RugbyBallGrayComponent, RugbyBallAccentComponent],
  templateUrl: './game-history.component.html',
  styleUrls: ['./game-history.component.scss'],
})
export class GameHistoryComponent implements OnInit {
  games: GameData[] = [];
  filteredGames: GameData[] = [];
  statistics: any = {};

  filter: GameFilter = {
    search: '',
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
  };

  constructor(private gameStorage: GameStorageService) {}

  ngOnInit() {
    this.loadGames();
    this.loadStatistics();
  }

  loadGames() {
    this.games = this.gameStorage.getGames();
    this.applyFilter();
  }

  loadStatistics() {
    this.statistics = this.gameStorage.getStatistics();
  }

  applyFilter() {
    let filtered = [...this.games];

    // Filter by search term
    if (this.filter.search.trim()) {
      const searchTerm = this.filter.search.toLowerCase();
      filtered = filtered.filter(
        (game) =>
          game.homeTeam.name.toLowerCase().includes(searchTerm) ||
          game.awayTeam.name.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by status
    if (this.filter.status !== 'all') {
      filtered = filtered.filter((game) => game.status === this.filter.status);
    }

    // Sort games
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (this.filter.sortBy) {
        case 'date':
          comparison =
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'score':
          const totalA = a.homeTeam.score + a.awayTeam.score;
          const totalB = b.homeTeam.score + b.awayTeam.score;
          comparison = totalA - totalB;
          break;
        case 'teams':
          comparison = a.homeTeam.name.localeCompare(b.homeTeam.name);
          break;
      }

      return this.filter.sortOrder === 'desc' ? -comparison : comparison;
    });

    this.filteredGames = filtered;
  }

  onFilterChange() {
    this.applyFilter();
  }

  clearSearch() {
    this.filter.search = '';
    this.applyFilter();
  }

  getWinner(game: GameData): string {
    if (game.homeTeam.score > game.awayTeam.score) {
      return game.homeTeam.name;
    } else if (game.awayTeam.score > game.homeTeam.score) {
      return game.awayTeam.name;
    }
    return 'Draw';
  }

  getScoreDifference(game: GameData): number {
    return Math.abs(game.homeTeam.score - game.awayTeam.score);
  }

  getGameDuration(game: GameData): string {
    return game.gameTime || '00:00';
  }

  deleteGame(gameId: string) {
    if (
      confirm(
        'Are you sure you want to delete this game? This action cannot be undone.'
      )
    ) {
      this.gameStorage.deleteGame(gameId);
      this.loadGames();
      this.loadStatistics();
    }
  }

  exportGame(game: GameData) {
    const dataStr = JSON.stringify(game, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `rugby-game-${game.homeTeam.name}-vs-${
      game.awayTeam.name
    }-${new Date(game.timestamp).toISOString().split('T')[0]}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  exportAllGames() {
    const dataStr = this.gameStorage.exportGames();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `rugby-games-export-${
      new Date().toISOString().split('T')[0]
    }.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  clearAllGames() {
    if (
      confirm(
        'Are you sure you want to delete ALL games? This action cannot be undone.'
      )
    ) {
      this.gameStorage.clearAllGames();
      this.loadGames();
      this.loadStatistics();
    }
  }

  getStatusColor(status: string): string {
    return status === 'completed' ? 'success' : 'warning';
  }

  getStatusIcon(status: string): string {
    return status === 'completed' ? 'check_circle' : 'schedule';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
