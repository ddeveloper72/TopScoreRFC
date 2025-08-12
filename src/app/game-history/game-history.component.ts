import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { MatDialog } from '@angular/material/dialog';
import { GameStorageService, GameData } from '../services/game-storage.service';
import { MatchStorageService, Match } from '../services/match-storage.service';
import { MatchDetailDialogComponent } from '../shared/match-detail-dialog/match-detail-dialog.component';
import {
  RugbyBallPrimaryComponent,
  RugbyBallGrayComponent,
  RugbyBallAccentComponent,
} from '../shared/rugby-ball-variants/rugby-ball-variants.component';

interface GameFilter {
  search: string;
  status: 'all' | 'completed' | 'scheduled' | 'cancelled';
  sortBy: 'date' | 'score' | 'teams' | 'venue';
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: 'app-game-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MaterialModule,
    RugbyBallPrimaryComponent,
    RugbyBallGrayComponent,
    RugbyBallAccentComponent,
  ],
  templateUrl: './game-history.component.html',
  styleUrls: ['./game-history.component.scss'],
})
export class GameHistoryComponent implements OnInit {
  games: GameData[] = [];
  matches: Match[] = [];
  filteredMatches: Match[] = [];
  statistics: any = {};

  filter: GameFilter = {
    search: '',
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
  };

  constructor(
    private gameStorage: GameStorageService,
    private matchStorage: MatchStorageService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadGames();
    this.loadMatches();
    this.loadStatistics();
  }

  loadGames() {
    this.games = this.gameStorage.getGames();
  }

  loadMatches() {
    this.matches = this.matchStorage.getAllMatches();
    this.applyFilter();
  }

  loadStatistics() {
    this.statistics = this.gameStorage.getStatistics();
  }

  applyFilter() {
    let filtered = [...this.matches];

    // Filter by search term
    if (this.filter.search.trim()) {
      const searchTerm = this.filter.search.toLowerCase();
      filtered = filtered.filter(
        (match) =>
          match.homeTeam.toLowerCase().includes(searchTerm) ||
          match.awayTeam.toLowerCase().includes(searchTerm) ||
          match.venue.toLowerCase().includes(searchTerm) ||
          (match.competition &&
            match.competition.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by status
    if (this.filter.status !== 'all') {
      filtered = filtered.filter(
        (match) => match.status === this.filter.status
      );
    }

    // Sort matches
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (this.filter.sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'score':
          const totalA = (a.homeScore || 0) + (a.awayScore || 0);
          const totalB = (b.homeScore || 0) + (b.awayScore || 0);
          comparison = totalA - totalB;
          break;
        case 'teams':
          comparison = a.homeTeam.localeCompare(b.homeTeam);
          break;
        case 'venue':
          comparison = a.venue.localeCompare(b.venue);
          break;
      }

      return this.filter.sortOrder === 'desc' ? -comparison : comparison;
    });

    this.filteredMatches = filtered;
  }

  onFilterChange() {
    this.applyFilter();
  }

  clearSearch() {
    this.filter.search = '';
    this.applyFilter();
  }

  openMatchDetails(match: Match): void {
    const dialogRef = this.dialog.open(MatchDetailDialogComponent, {
      data: {
        match: match,
        canEdit: true,
      },
      panelClass: 'match-detail-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'edit') {
        // Handle edit action - you could open an edit dialog here
        console.log('Edit match requested', result.match);
      } else if (result && result.action === 'delete') {
        this.deleteMatch(result.match.id);
      }
    });
  }

  getWinner(match: Match): string {
    if (
      match.status !== 'completed' ||
      match.homeScore === undefined ||
      match.awayScore === undefined
    ) {
      return 'TBD';
    }

    if (match.homeScore > match.awayScore) {
      return match.homeTeam;
    } else if (match.awayScore > match.homeScore) {
      return match.awayTeam;
    }
    return 'Draw';
  }

  getScoreDifference(match: Match): number {
    if (match.homeScore === undefined || match.awayScore === undefined) {
      return 0;
    }
    return Math.abs(match.homeScore - match.awayScore);
  }

  getTotalScore(match: Match): number {
    return (match.homeScore || 0) + (match.awayScore || 0);
  }

  deleteMatch(matchId: string) {
    if (
      confirm(
        'Are you sure you want to delete this match? This action cannot be undone.'
      )
    ) {
      this.matchStorage.deleteMatch(matchId);
      this.loadMatches();
    }
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

  exportMatch(match: Match) {
    const dataStr = JSON.stringify(match, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `rugby-match-${match.homeTeam}-vs-${match.awayTeam}-${
      new Date(match.date).toISOString().split('T')[0]
    }.json`;
    link.click();

    URL.revokeObjectURL(url);
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

  exportAllMatches() {
    const dataStr = JSON.stringify(this.matches, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `rugby-matches-export-${
      new Date().toISOString().split('T')[0]
    }.json`;
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

  clearAllMatches() {
    if (
      confirm(
        'Are you sure you want to delete ALL matches? This action cannot be undone.'
      )
    ) {
      // Clear all matches from storage
      this.matches.forEach((match) => this.matchStorage.deleteMatch(match.id));
      this.loadMatches();
    }
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
    switch (status) {
      case 'completed':
        return 'success';
      case 'scheduled':
        return 'primary';
      case 'cancelled':
        return 'warn';
      default:
        return 'accent';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return 'check_circle';
      case 'scheduled':
        return 'schedule';
      case 'cancelled':
        return 'cancel';
      default:
        return 'help';
    }
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

  formatTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatTeamCategory(category: string): string {
    switch (category) {
      case 'minis':
        return 'Minis';
      case 'youths-boys':
        return 'Youths';
      case 'girls':
        return 'Girls';
      case 'seniors':
        return 'Seniors';
      case 'womens-tag':
        return "Women's Tag";
      default:
        return category;
    }
  }

  formatMatchType(matchType: string): string {
    switch (matchType) {
      case 'boys':
        return "Boys' Teams";
      case 'girls':
        return "Girls' Teams";
      case 'mixed':
        return 'Mixed/Adults';
      default:
        return matchType || 'Not specified';
    }
  }

  getMatchTypeColor(competition?: string): string {
    if (!competition) return 'primary';

    const comp = competition.toLowerCase();
    if (comp.includes('cup') || comp.includes('final')) return 'warn';
    if (comp.includes('league') || comp.includes('championship'))
      return 'primary';
    if (comp.includes('friendly') || comp.includes('exhibition'))
      return 'accent';
    return 'primary';
  }

  hasNotes(matchId: string): boolean {
    const notes = localStorage.getItem(`match-notes-${matchId}`);
    return notes ? JSON.parse(notes).length > 0 : false;
  }

  hasPhotos(matchId: string): boolean {
    const photos = localStorage.getItem(`match-photos-${matchId}`);
    return photos ? JSON.parse(photos).length > 0 : false;
  }
}
