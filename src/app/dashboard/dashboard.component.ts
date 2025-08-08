import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GameStorageService } from '../services/game-storage.service';

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
  upcomingMatches: any[] = [];
  statistics: any = {};

  constructor(private gameStorage: GameStorageService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.statistics = this.gameStorage.getStatistics();
    this.recentGames = this.gameStorage.getGames().slice(-3); // Last 3 games

    // Mock upcoming matches (you can replace with real data later)
    this.upcomingMatches = [
      {
        date: new Date(2025, 7, 15),
        homeTeam: 'Lions RFC',
        awayTeam: 'Eagles United',
        venue: 'City Stadium',
      },
      {
        date: new Date(2025, 7, 22),
        homeTeam: 'Tigers FC',
        awayTeam: 'Sharks RFC',
        venue: 'Home Ground',
      },
    ];
  }

  quickStartGame() {
    // Navigate to score tracker with default teams
    // Could pre-populate with scheduled match data
  }
}
