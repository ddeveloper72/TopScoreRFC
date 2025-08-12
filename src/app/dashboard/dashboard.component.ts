import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GameStorageService } from '../services/game-storage.service';
import { MatchStorageService, Match } from '../services/match-storage.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  recentGames: any[] = [];
  upcomingMatches: Match[] = [];
  statistics: any = {};

  constructor(
    private gameStorage: GameStorageService,
    private matchStorage: MatchStorageService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.statistics = this.gameStorage.getStatistics();
    this.recentGames = this.gameStorage.getGames().slice(-3); // Last 3 games

    // Get upcoming matches from MatchStorageService
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ); // Start of today

    this.upcomingMatches = this.matchStorage
      .getMatches()
      .filter(
        (match) =>
          new Date(match.date) >= todayStart && match.status === 'scheduled'
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4); // Show up to 4 upcoming matches

    // Debug: Log the upcoming matches
    console.log('Current date:', now);
    console.log('Today start:', todayStart);
    console.log('All matches from storage:', this.matchStorage.getMatches());
    console.log('Upcoming matches:', this.upcomingMatches);
    if (this.upcomingMatches.length > 0) {
      console.log('First match details:', this.upcomingMatches[0]);
      console.log('First match fields check:', {
        matchType: this.upcomingMatches[0].matchType,
        homeTeamCategory: this.upcomingMatches[0].homeTeamCategory,
        homeTeamAgeLevel: this.upcomingMatches[0].homeTeamAgeLevel,
        awayTeamAgeLevel: this.upcomingMatches[0].awayTeamAgeLevel,
      });
    } else {
      console.log('No upcoming matches found');
    }
  }

  // Format match type for display
  formatMatchType(matchType: string | undefined): string {
    if (!matchType) return '';

    switch (matchType) {
      case 'boys':
        return "Boys' Teams";
      case 'girls':
        return "Girls' Teams";
      case 'mixed':
        return 'Mixed/Adults';
      default:
        return matchType;
    }
  }

  // Format team category for display
  formatTeamCategory(category: string | undefined): string {
    if (!category) return '';

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

  // Get match type color for styling
  getMatchTypeColor(matchType: string | undefined): string {
    switch (matchType) {
      case 'boys':
        return '#2196f3'; // Blue
      case 'girls':
        return '#e91e63'; // Pink
      case 'mixed':
        return '#4caf50'; // Green
      default:
        return '#757575'; // Grey
    }
  }

  // Get match type CSS class
  getMatchTypeClass(matchType: string | undefined): string {
    switch (matchType) {
      case 'boys':
        return 'boys-teams';
      case 'girls':
        return 'girls-teams';
      case 'mixed':
        return 'mixed-adults';
      default:
        return '';
    }
  }

  // Get match type icon
  getMatchTypeIcon(matchType: string | undefined): string {
    switch (matchType) {
      case 'boys':
        return 'sports_rugby';
      case 'girls':
        return 'sports_handball';
      case 'mixed':
        return 'groups';
      default:
        return 'sports';
    }
  }

  // Date helper methods
  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  getDaysUntilMatch(matchDate: Date): number {
    const today = new Date();
    const diffTime = matchDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getMatchDateDisplay(date: Date): string {
    if (this.isToday(date)) {
      return 'Today';
    }
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  getCountdownDisplay(date: Date): string {
    if (this.isToday(date)) {
      return 'Today';
    }
    const days = this.getDaysUntilMatch(date);
    return days === 1 ? '1 day' : `${days} days`;
  }

  quickStartGame() {
    // Navigate to score tracker with default teams
    // Could pre-populate with scheduled match data
  }

  // Debug function to create test match with all fields
  createTestMatch() {
    const testMatch = {
      matchType: 'boys',
      homeTeam: 'Clane RFC',
      homeTeamCategory: 'youths-boys',
      homeTeamAgeLevel: 'U16',
      awayTeam: 'Test RFC',
      awayTeamAgeLevel: 'U16',
      date: new Date(),
      venue: 'Clane RFC',
      competition: 'Test Match',
      status: 'scheduled' as const,
    };

    console.log('Creating test match:', testMatch);
    const id = this.matchStorage.saveMatch(testMatch);
    console.log('Test match saved with ID:', id);

    // Reload dashboard data
    this.loadDashboardData();
  }
}
