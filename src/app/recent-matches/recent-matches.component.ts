import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  Match,
  MatchEvent,
  MatchStorageService,
} from '../services/match-storage.service';
import { MatchApiService } from '../services/match-api.service';
import { EventManagerDialogComponent } from '../shared/event-manager-dialog/event-manager-dialog.component';

@Component({
  selector: 'app-recent-matches',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule, RouterModule],
  template: `
    <div class="recent-matches-container">
      <!-- Header -->
      <div class="page-header">
        <h1>
          <mat-icon>history</mat-icon>
          Recent Match Results
        </h1>
        <p class="subtitle">
          Review past matches, events, and team performance
        </p>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <mat-button-toggle-group
          #filterGroup="matButtonToggleGroup"
          value="all"
          (change)="onFilterChange($event.value)"
        >
          <mat-button-toggle value="all">All Matches</mat-button-toggle>
          <mat-button-toggle value="wins">Wins</mat-button-toggle>
          <mat-button-toggle value="losses">Losses</mat-button-toggle>
          <mat-button-toggle value="draws">Draws</mat-button-toggle>
        </mat-button-toggle-group>

        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search matches</mat-label>
          <input
            matInput
            [(ngModel)]="searchTerm"
            (input)="onSearchChange()"
            placeholder="Team name, competition..."
          />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <!-- Stats Summary -->
      <div class="stats-summary" *ngIf="filteredMatches.length > 0">
        <div class="stat-card wins">
          <div class="stat-value">{{ getWinsCount() }}</div>
          <div class="stat-label">Wins</div>
        </div>
        <div class="stat-card losses">
          <div class="stat-value">{{ getLossesCount() }}</div>
          <div class="stat-label">Losses</div>
        </div>
        <div class="stat-card draws">
          <div class="stat-value">{{ getDrawsCount() }}</div>
          <div class="stat-label">Draws</div>
        </div>
        <div class="stat-card total">
          <div class="stat-value">{{ filteredMatches.length }}</div>
          <div class="stat-label">Total Matches</div>
        </div>
      </div>

      <!-- Recent Matches List -->
      <div class="matches-grid" *ngIf="filteredMatches.length > 0">
        <div
          class="enhanced-match-card"
          *ngFor="let match of filteredMatches"
          [attr.data-result]="getMatchResult(match)"
        >
          <!-- Match Result Header -->
          <div class="match-result-header">
            <div class="match-teams-result">
              <div class="team-result home">
                <div class="team-name">{{ match.homeTeam }}</div>
                <div class="team-score">{{ match.homeScore || 0 }}</div>
              </div>
              <div class="vs-result">-</div>
              <div class="team-result away">
                <div class="team-name">{{ match.awayTeam }}</div>
                <div class="team-score">{{ match.awayScore || 0 }}</div>
              </div>
            </div>

            <div class="match-meta">
              <div class="result-badge" [ngClass]="getResultClass(match)">
                {{ getMatchResult(match) }}
              </div>
              <div class="match-date">
                {{ match.date | date : 'MMM dd, yyyy' }}
              </div>
            </div>
          </div>

          <!-- Match Info Bar -->
          <div
            class="match-info-bar"
            [ngClass]="getMatchTypeClass(match.matchType)"
            *ngIf="match.matchType || match.competition"
          >
            <div class="match-type" *ngIf="match.matchType">
              <mat-icon [style.color]="getMatchTypeColor(match.matchType)">
                {{ getMatchTypeIcon(match.matchType) }}
              </mat-icon>
              <span>{{ formatMatchType(match.matchType) }}</span>
            </div>
            <div class="competition" *ngIf="match.competition">
              <mat-icon>emoji_events</mat-icon>
              <span>{{ match.competition }}</span>
            </div>
          </div>

          <!-- Events Timeline -->
          <div
            class="events-timeline"
            *ngIf="match.events && match.events.length > 0"
          >
            <div class="timeline-title">
              <mat-icon>timeline</mat-icon>
              <span>Match Events ({{ match.events.length }})</span>
            </div>

            <div class="timeline">
              <div
                class="timeline-event"
                *ngFor="let event of getSortedEvents(match.events).slice(0, 5)"
                [ngClass]="'event-' + event.eventType"
              >
                <div class="event-time">{{ event.time }}</div>
                <div class="event-content">
                  <div class="event-header">
                    <span class="event-icon">{{
                      getEventIcon(event.eventType)
                    }}</span>
                    <span class="event-type">{{
                      getEventTypeDisplay(event.eventType)
                    }}</span>
                    <span class="event-team" [ngClass]="event.team">
                      {{
                        event.team === 'home' ? match.homeTeam : match.awayTeam
                      }}
                    </span>
                  </div>
                  <div class="event-description">{{ event.description }}</div>
                  <div class="event-player" *ngIf="event.ourPlayer">
                    <mat-icon>person</mat-icon>
                    <span>{{ event.ourPlayer }}</span>
                  </div>
                  <div class="event-notes" *ngIf="event.notes">
                    {{ event.notes }}
                  </div>
                </div>
              </div>
            </div>

            <button
              mat-button
              *ngIf="match.events.length > 5"
              (click)="showAllEvents(match)"
              class="show-more-events"
            >
              Show {{ match.events.length - 5 }} more events
            </button>

            <button
              mat-raised-button
              color="primary"
              (click)="openEventManager(match)"
              class="add-event-btn"
            >
              <mat-icon>add</mat-icon>
              Manage Events
            </button>
          </div>

          <!-- No Events State -->
          <div
            class="no-events"
            *ngIf="!match.events || match.events.length === 0"
          >
            <div class="no-events-content">
              <mat-icon>event_note</mat-icon>
              <p>No match events recorded</p>
              <button
                mat-raised-button
                color="primary"
                (click)="openEventManager(match)"
              >
                <mat-icon>add</mat-icon>
                Add Match Events
              </button>
            </div>
          </div>

          <!-- Match Statistics -->
          <div
            class="match-stats"
            *ngIf="match.events && match.events.length > 0"
          >
            <div class="stat-item">
              <span class="stat-label">Tries</span>
              <span class="stat-value">{{
                getEventCount(match.events, 'try')
              }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Conversions</span>
              <span class="stat-value">{{
                getEventCount(match.events, 'conversion')
              }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Penalties</span>
              <span class="stat-value">{{
                getEventCount(match.events, 'penalty')
              }}</span>
            </div>
          </div>

          <!-- Database ID -->
          <div class="match-id">{{ match._id || match.id }}</div>

          <!-- Card Actions -->
          <mat-card-actions align="end">
            <button mat-button (click)="viewMatchReport(match)">
              <mat-icon>description</mat-icon>
              Full Report
            </button>
            <button mat-button (click)="openEventManager(match)">
              <mat-icon>edit</mat-icon>
              Edit Events
            </button>
            <button
              mat-icon-button
              [matMenuTriggerFor]="matchActionsMenu"
              [attr.aria-label]="
                'More actions for ' + match.homeTeam + ' vs ' + match.awayTeam
              "
            >
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #matchActionsMenu="matMenu">
              <button mat-menu-item (click)="duplicateMatch(match)">
                <mat-icon>content_copy</mat-icon>
                <span>Duplicate Match</span>
              </button>
              <button mat-menu-item (click)="exportMatch(match)">
                <mat-icon>download</mat-icon>
                <span>Export Data</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="deleteMatch(match)" class="danger">
                <mat-icon>delete</mat-icon>
                <span>Delete Match</span>
              </button>
            </mat-menu>
          </mat-card-actions>
        </div>
      </div>

      <!-- No Matches State -->
      <div
        class="no-matches"
        *ngIf="filteredMatches.length === 0 && !isLoading"
      >
        <mat-icon>sports_rugby</mat-icon>
        <h3>
          {{
            searchTerm || filterType !== 'all'
              ? 'No matches found'
              : 'No recent matches'
          }}
        </h3>
        <p *ngIf="searchTerm || filterType !== 'all'">
          Try adjusting your search or filter criteria
        </p>
        <p *ngIf="!searchTerm && filterType === 'all'">
          Recent match results will appear here after matches are completed
        </p>
        <button mat-raised-button color="primary" routerLink="/calendar">
          <mat-icon>calendar_today</mat-icon>
          View Calendar
        </button>
      </div>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="isLoading">
        <mat-spinner></mat-spinner>
        <p>Loading recent matches...</p>
      </div>
    </div>
  `,
  styles: [
    `
      .recent-matches-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        animation: fadeIn 0.6s ease-in-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .page-header {
        text-align: center;
        margin-bottom: 3rem;
        color: white;

        h1 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;

          mat-icon {
            font-size: 2.5rem;
            width: 2.5rem;
            height: 2.5rem;
          }
        }

        .subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          margin: 0;
        }
      }

      .filters-section {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 2rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;

        mat-button-toggle-group {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 25px;
          overflow: hidden;

          mat-button-toggle {
            color: white;
            border: none;

            &.mat-button-toggle-checked {
              background: rgba(255, 255, 255, 0.2);
              color: white;
            }
          }
        }

        .search-field {
          min-width: 300px;

          ::ng-deep {
            .mat-mdc-text-field-wrapper {
              background-color: rgba(255, 255, 255, 0.1);
              border-radius: 25px;
            }

            .mat-mdc-form-field-label {
              color: rgba(255, 255, 255, 0.8);
            }

            .mat-mdc-input-element {
              color: white;
            }

            .mat-mdc-form-field-icon-suffix {
              color: rgba(255, 255, 255, 0.6);
            }
          }
        }
      }

      .stats-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 3rem;

        .stat-card {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          backdrop-filter: blur(10px);
          transition: transform 0.3s ease;

          &:hover {
            transform: translateY(-4px);
          }

          .stat-value {
            font-size: 3rem;
            font-weight: 800;
            color: white;
            line-height: 1;
          }

          .stat-label {
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.8);
            margin-top: 0.5rem;
          }

          &.wins .stat-value {
            color: #4caf50;
          }

          &.losses .stat-value {
            color: #f44336;
          }

          &.draws .stat-value {
            color: #ff9800;
          }

          &.total .stat-value {
            color: #2196f3;
          }
        }
      }

      .matches-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
        gap: 2rem;
        margin-bottom: 2rem;
      }

      // Enhanced Match Card Styles (similar to calendar component)
      .enhanced-match-card {
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
        }

        &[data-result='W'] {
          border-left: 5px solid #4caf50;
        }

        &[data-result='L'] {
          border-left: 5px solid #f44336;
        }

        &[data-result='D'] {
          border-left: 5px solid #ff9800;
        }

        .match-result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);

          .match-teams-result {
            display: flex;
            align-items: center;
            gap: 1rem;

            .team-result {
              text-align: center;

              .team-name {
                font-weight: 700;
                font-size: 1.1rem;
                color: #2c3e50;
              }

              .team-score {
                font-size: 2rem;
                font-weight: 800;
                color: #3498db;

                &.home {
                  color: #27ae60;
                }
              }
            }

            .vs-result {
              font-size: 1.5rem;
              font-weight: 600;
              color: #7f8c8d;
            }
          }

          .match-meta {
            text-align: right;

            .result-badge {
              padding: 0.5rem 1rem;
              border-radius: 20px;
              font-weight: 600;
              font-size: 0.9rem;
              margin-bottom: 0.5rem;

              &.win {
                background: #e8f5e8;
                color: #27ae60;
              }

              &.loss {
                background: #ffebee;
                color: #e74c3c;
              }

              &.draw {
                background: #fff3cd;
                color: #f39c12;
              }
            }

            .match-date {
              font-size: 0.9rem;
              color: #7f8c8d;
            }
          }
        }

        // Rest of the match card styles...
        .match-info-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.5rem;
          background: rgba(52, 152, 219, 0.1);

          &.boys-teams {
            background: rgba(33, 150, 243, 0.1);
            border-left: 4px solid #2196f3;
          }

          &.girls-teams {
            background: rgba(233, 30, 99, 0.1);
            border-left: 4px solid #e91e63;
          }

          .match-type,
          .competition {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
            font-weight: 600;
          }
        }

        // Events timeline and other components...
        .events-timeline {
          margin: 1.5rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px;

          .timeline-title {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            color: #2c3e50;
            font-weight: 600;
          }

          .timeline {
            .timeline-event {
              position: relative;
              padding: 0.75rem;
              margin-bottom: 0.75rem;
              background: white;
              border-radius: 8px;
              border-left: 4px solid #3498db;

              &.event-try {
                border-left-color: #27ae60;
              }

              &.event-penalty {
                border-left-color: #f39c12;
              }

              &.event-card {
                border-left-color: #e74c3c;
              }

              .event-time {
                position: absolute;
                top: 0.5rem;
                right: 0.75rem;
                font-size: 0.8rem;
                color: #7f8c8d;
                font-weight: 600;
              }

              .event-content {
                .event-header {
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
                  margin-bottom: 0.5rem;

                  .event-type {
                    font-weight: 600;
                    color: #2c3e50;
                  }

                  .event-team {
                    font-size: 0.85rem;
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    font-weight: 500;

                    &.home {
                      background: rgba(39, 174, 96, 0.1);
                      color: #27ae60;
                    }

                    &.away {
                      background: rgba(52, 152, 219, 0.1);
                      color: #3498db;
                    }
                  }
                }

                .event-description {
                  color: #34495e;
                  margin-bottom: 0.5rem;
                }

                .event-player {
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
                  color: #27ae60;
                  font-weight: 600;
                  font-size: 0.9rem;
                }

                .event-notes {
                  margin-top: 0.5rem;
                  color: #7f8c8d;
                  font-style: italic;
                }
              }
            }
          }

          .show-more-events,
          .add-event-btn {
            margin-top: 1rem;
            width: 100%;
          }
        }

        .no-events {
          text-align: center;
          padding: 2rem;

          .no-events-content {
            color: #7f8c8d;

            mat-icon {
              font-size: 3rem;
              width: 3rem;
              height: 3rem;
              margin-bottom: 1rem;
              opacity: 0.5;
            }

            p {
              margin-bottom: 1.5rem;
              font-size: 1rem;
            }
          }
        }

        .match-stats {
          display: flex;
          justify-content: space-around;
          padding: 1rem 1.5rem;
          background: rgba(52, 152, 219, 0.05);
          border-top: 1px solid rgba(0, 0, 0, 0.05);

          .stat-item {
            text-align: center;

            .stat-label {
              display: block;
              font-size: 0.8rem;
              color: #7f8c8d;
              margin-bottom: 0.25rem;
            }

            .stat-value {
              display: block;
              font-size: 1.5rem;
              font-weight: 700;
              color: #2c3e50;
            }
          }
        }

        .match-id {
          position: absolute;
          bottom: 8px;
          right: 8px;
          font-size: 10px;
          color: #bdc3c7;
          opacity: 0.7;
        }

        mat-card-actions {
          padding: 1rem 1.5rem;
          background: #f8f9fa;
          border-top: 1px solid rgba(0, 0, 0, 0.05);

          button {
            border-radius: 8px;
            font-weight: 500;

            &:not(:last-child) {
              margin-right: 0.5rem;
            }

            &.danger {
              color: #e74c3c;
            }
          }
        }
      }

      .no-matches {
        text-align: center;
        color: white;
        padding: 4rem 2rem;

        mat-icon {
          font-size: 5rem;
          width: 5rem;
          height: 5rem;
          margin-bottom: 2rem;
          opacity: 0.7;
        }

        h3 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
        }

        p {
          opacity: 0.8;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        button {
          border-radius: 25px;
          font-weight: 600;
        }
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 50vh;
        color: white;

        mat-spinner {
          margin-bottom: 1rem;
        }

        p {
          font-size: 1.1rem;
          opacity: 0.8;
        }
      }

      // Mobile responsiveness
      @media (max-width: 768px) {
        .recent-matches-container {
          padding: 1rem;
        }

        .page-header h1 {
          font-size: 2rem;

          mat-icon {
            font-size: 2rem;
            width: 2rem;
            height: 2rem;
          }
        }

        .filters-section {
          flex-direction: column;
          gap: 1rem;

          .search-field {
            min-width: 250px;
          }
        }

        .matches-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .enhanced-match-card {
          .match-result-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      }
    `,
  ],
})
export class RecentMatchesComponent implements OnInit, OnDestroy {
  matches: Match[] = [];
  filteredMatches: Match[] = [];
  searchTerm = '';
  filterType: 'all' | 'wins' | 'losses' | 'draws' = 'all';
  isLoading = true;
  private subscription = new Subscription();

  constructor(
    private matchStorageService: MatchStorageService,
    private matchApi: MatchApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecentMatches();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadRecentMatches(): void {
    this.isLoading = true;

    // Get matches from local storage first
    const localMatches = this.matchStorageService.getAllMatches();

    // Filter for completed matches only
    const completedMatches = localMatches.filter(
      (match) =>
        match.status === 'completed' &&
        (match.homeScore !== undefined || match.awayScore !== undefined)
    );

    this.matches = completedMatches.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    this.applyFilters();
    this.isLoading = false;

    // Try to refresh from API
    this.matchApi.getAllMatches().subscribe({
      next: (apiMatches) => {
        const completedApiMatches = apiMatches.filter(
          (match) =>
            match.status === 'completed' &&
            (match.homeScore !== undefined || match.awayScore !== undefined)
        );

        this.matches = completedApiMatches.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading matches from API:', error);
      },
    });
  }

  onFilterChange(filterType: 'all' | 'wins' | 'losses' | 'draws'): void {
    this.filterType = filterType;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.matches];

    // Apply result filter
    if (this.filterType !== 'all') {
      filtered = filtered.filter((match) => {
        const result = this.getMatchResult(match);
        return result.toLowerCase() === this.filterType.slice(0, -1); // Remove 's' from 'wins', etc.
      });
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchTerm = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (match) =>
          match.homeTeam.toLowerCase().includes(searchTerm) ||
          match.awayTeam.toLowerCase().includes(searchTerm) ||
          (match.competition &&
            match.competition.toLowerCase().includes(searchTerm)) ||
          (match.venue && match.venue.toLowerCase().includes(searchTerm))
      );
    }

    this.filteredMatches = filtered;
  }

  getMatchResult(match: Match): string {
    if (match.homeScore === undefined || match.awayScore === undefined) {
      return 'N/A';
    }

    if (match.homeScore > match.awayScore) {
      return 'W';
    } else if (match.homeScore < match.awayScore) {
      return 'L';
    } else {
      return 'D';
    }
  }

  getResultClass(match: Match): string {
    const result = this.getMatchResult(match);
    switch (result) {
      case 'W':
        return 'win';
      case 'L':
        return 'loss';
      case 'D':
        return 'draw';
      default:
        return '';
    }
  }

  getWinsCount(): number {
    return this.filteredMatches.filter((m) => this.getMatchResult(m) === 'W')
      .length;
  }

  getLossesCount(): number {
    return this.filteredMatches.filter((m) => this.getMatchResult(m) === 'L')
      .length;
  }

  getDrawsCount(): number {
    return this.filteredMatches.filter((m) => this.getMatchResult(m) === 'D')
      .length;
  }

  // Event management methods
  openEventManager(match: Match): void {
    const dialogRef = this.dialog.open(EventManagerDialogComponent, {
      width: '90vw',
      maxWidth: '800px',
      data: { match } as any, // EventManagerDialogData
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.events) {
        // Update match with new events
        const updatedMatch = { ...match, events: result.events };
        this.matchStorageService.updateMatch(match.id, updatedMatch);

        // Sync with API
        this.matchApi
          .updateMatch(match._id || match.id, updatedMatch)
          .subscribe({
            next: () => {
              this.snackBar.open('Events updated successfully', 'Close', {
                duration: 2000,
              });
              this.loadRecentMatches(); // Refresh data
            },
            error: (error) => {
              console.error('Error updating events:', error);
              this.snackBar.open(
                'Events saved locally (API sync failed)',
                'Close',
                { duration: 3000 }
              );
            },
          });
      }
    });
  }

  getSortedEvents(events: MatchEvent[]): MatchEvent[] {
    return events.sort((a, b) => {
      // Sort by time descending (most recent first)
      return b.time.localeCompare(a.time);
    });
  }

  getEventCount(events: MatchEvent[], eventType: string): number {
    return events.filter((event) => event.eventType === eventType).length;
  }

  getEventIcon(eventType: string): string {
    const icons: { [key: string]: string } = {
      try: '🏉',
      conversion: '⚽',
      penalty: '🚨',
      drop_goal: '🎯',
      card: '🟨',
      injury: '🏥',
      substitution: '🔄',
      other: '📝',
    };
    return icons[eventType] || '📝';
  }

  getEventTypeDisplay(eventType: string): string {
    const displays: { [key: string]: string } = {
      try: 'Try',
      conversion: 'Conversion',
      penalty: 'Penalty',
      drop_goal: 'Drop Goal',
      card: 'Card',
      injury: 'Injury',
      substitution: 'Substitution',
      other: 'Other',
    };
    return displays[eventType] || 'Event';
  }

  showAllEvents(match: Match): void {
    // Navigate to a detailed match view or show in dialog
    this.snackBar.open('Full match details coming soon', 'Close', {
      duration: 2000,
    });
  }

  viewMatchReport(match: Match): void {
    // Generate and show match report
    this.snackBar.open('Match report feature coming soon', 'Close', {
      duration: 2000,
    });
  }

  duplicateMatch(match: Match): void {
    this.snackBar.open('Duplicate match feature coming soon', 'Close', {
      duration: 2000,
    });
  }

  exportMatch(match: Match): void {
    // Export match data
    const matchData = JSON.stringify(match, null, 2);
    const blob = new Blob([matchData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `match-${match.homeTeam}-vs-${match.awayTeam}-${
      new Date(match.date).toISOString().split('T')[0]
    }.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  deleteMatch(match: Match): void {
    if (
      confirm(
        `Are you sure you want to delete the match between ${match.homeTeam} and ${match.awayTeam}?`
      )
    ) {
      // Delete from both API and local storage
      const matchId = match._id || match.id;

      this.matchApi.deleteMatch(matchId).subscribe({
        next: () => {
          this.matchStorageService.deleteMatch(match.id);
          this.snackBar.open('Match deleted successfully', 'Close', {
            duration: 2000,
          });
          this.loadRecentMatches(); // Refresh data
        },
        error: (error) => {
          console.error('Error deleting match:', error);
          this.matchStorageService.deleteMatch(match.id);
          this.snackBar.open('Match deleted locally (API error)', 'Close', {
            duration: 3000,
          });
          this.loadRecentMatches(); // Refresh data
        },
      });
    }
  }

  // Match type formatting (shared with calendar)
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

  getMatchTypeColor(matchType: string | undefined): string {
    switch (matchType) {
      case 'boys':
        return '#2196f3';
      case 'girls':
        return '#e91e63';
      case 'mixed':
        return '#4caf50';
      default:
        return '#757575';
    }
  }

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
}
