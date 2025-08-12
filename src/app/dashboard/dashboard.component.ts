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
    this.upcomingMatches = this.matchStorage.getMatches()
      .filter(match => new Date(match.date) >= now && match.status === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4); // Show up to 4 upcoming matches
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

  // Get match type icon
  getMatchTypeIcon(matchType: string | undefined): string {
    switch (matchType) {
      case 'boys':
        return 'male';
      case 'girls':
        return 'female';
      case 'mixed':
        return 'groups';
      default:
        return 'groups';
    }
  }

  quickStartGame() {
    // Navigate to score tracker with default teams
    // Could pre-populate with scheduled match data
  }
}
