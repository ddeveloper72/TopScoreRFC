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
          class="match-card"
          *ngFor="let match of filteredMatches"
          [attr.data-result]="getMatchResult(match)"
        >
          <!-- Top Section - Always Visible -->
          <div class="match-top-section">
            <!-- Teams and Score -->
            <div class="match-teams-header">
              <div class="team home-team">
                <span class="team-name">{{ match.homeTeam }}</span>
                <div class="team-score">{{ match.homeScore || 0 }}</div>
              </div>

              <div class="score-separator">
                <span class="vs-text">-</span>
                <div class="result-badge" [ngClass]="getResultClass(match)">
                  {{ getMatchResult(match) }}
                </div>
              </div>

              <div class="team away-team">
                <span class="team-name">{{ match.awayTeam }}</span>
                <div class="team-score">{{ match.awayScore || 0 }}</div>
              </div>
            </div>

            <!-- Match Type and Status -->
            <div
              class="match-info-row"
              *ngIf="match.matchType || match.competition"
            >
              <div class="match-type-info" *ngIf="match.matchType">
                <mat-icon [style.color]="getMatchTypeColor(match.matchType)">
                  {{ getMatchTypeIcon(match.matchType) }}
                </mat-icon>
                <span>{{ formatMatchType(match.matchType) }}</span>
              </div>
              <div class="competition-info" *ngIf="match.competition">
                <mat-icon>emoji_events</mat-icon>
                <span>{{ match.competition }}</span>
              </div>
            </div>

            <!-- Date and Actions -->
            <div class="match-date-actions">
              <div class="match-date">
                {{ match.date | date : 'EEEE, MMM dd, yyyy' }}
              </div>
              <button
                mat-button
                (click)="viewMatchReport(match)"
                class="match-action-btn"
              >
                <mat-icon>description</mat-icon>
                Report
              </button>
            </div>
          </div>

          <!-- Bottom Section - Accordion for Match Events -->
          <mat-accordion class="match-events-accordion">
            <mat-expansion-panel
              [expanded]="isAccordionExpanded(match._id || match.id)"
              (opened)="onAccordionOpened(match._id || match.id)"
              (closed)="onAccordionClosed(match._id || match.id)"
              class="match-events-panel"
            >
              <mat-expansion-panel-header class="events-header">
                <mat-panel-title>
                  <mat-icon>timeline</mat-icon>
                  <span>Match Events ({{ match.events?.length || 0 }})</span>
                </mat-panel-title>
              </mat-expansion-panel-header>

              <!-- Match Events Content -->
              <div class="match-events-content">
                <!-- Events Timeline -->
                <div
                  class="events-timeline"
                  *ngIf="match.events && match.events.length > 0"
                >
                  <div class="timeline">
                    <div
                      class="timeline-event"
                      *ngFor="let event of getSortedEvents(match.events)"
                      [ngClass]="'event-' + event.eventType"
                    >
                      <div class="event-time">{{ event.time }}</div>
                      <div
                        class="event-icon"
                        [ngClass]="event.eventType + '-icon'"
                      >
                        <mat-icon>{{ getEventIcon(event.eventType) }}</mat-icon>
                      </div>
                      <div class="event-details">
                        <div class="event-type">
                          {{ getEventTypeDisplay(event.eventType) }}
                        </div>
                        <div class="event-description">
                          {{ event.description }}
                        </div>
                        <div class="event-team">
                          {{
                            event.team === 'home'
                              ? match.homeTeam
                              : match.awayTeam
                          }}
                        </div>
                        <div class="event-player" *ngIf="event.ourPlayer">
                          {{ event.ourPlayer }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- No Events State -->
                <div
                  class="no-events"
                  *ngIf="!match.events || match.events.length === 0"
                >
                  <mat-icon>event_note</mat-icon>
                  <p>No match events recorded</p>
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

                <!-- Action Buttons -->
                <div class="event-actions">
                  <button
                    mat-raised-button
                    color="primary"
                    (click)="openEventManager(match)"
                  >
                    <mat-icon>edit</mat-icon>
                    Manage Events
                  </button>
                </div>
              </div>
            </mat-expansion-panel>
          </mat-accordion>
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

      // Split Card Styles for Recent Matches
      .match-card {
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
      }

      // Top Section (Always Visible)
      .match-top-section {
        padding: 1.5rem;
        background: white;
        border-bottom: 2px solid #f5f5f5;
        
        .match-teams-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          
          .team {
            flex: 1;
            text-align: center;
            
            &.home-team {
              text-align: left;
            }
            
            &.away-team {
              text-align: right;
            }
            
            .team-name {
              display: block;
              font-size: 1.1rem;
              font-weight: 600;
              color: #2c3e50;
              margin-bottom: 0.25rem;
            }
            
            .team-score {
              font-size: 2rem;
              font-weight: 700;
              color: #3498db;
            }
          }
          
          .score-separator {
            margin: 0 1rem;
            text-align: center;
            
            .vs-text {
              font-size: 1.2rem;
              color: #7f8c8d;
              font-weight: 500;
              display: block;
            }

            .result-badge {
              margin-top: 0.25rem;
              padding: 0.25rem 0.5rem;
              border-radius: 12px;
              font-weight: 600;
              font-size: 0.8rem;

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
          }
        }
        
        .match-info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          
          .match-type-info,
          .competition-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #2c3e50;
            font-size: 0.9rem;
            
            mat-icon {
              font-size: 1.2rem;
              width: 1.2rem;
              height: 1.2rem;
            }
          }
        }
        
        .match-date-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          
          .match-date {
            color: #2c3e50;
            font-weight: 500;
          }
          
          .match-action-btn {
            color: #3498db;
            font-size: 0.9rem;
            
            mat-icon {
              margin-right: 0.5rem;
            }
            
            &:hover {
              background-color: rgba(52, 152, 219, 0.1);
            }
          }
        }
      }

      // Bottom Section (Accordion)
      .match-events-accordion {
        .match-events-panel {
          box-shadow: none;
          border: none;
          
          .events-header {
            background-color: #f8f9fa;
            border-top: 1px solid #e9ecef;
            
            mat-panel-title {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              color: #2c3e50;
              font-weight: 500;
              
              mat-icon {
                color: #3498db;
              }
            }
          }
          
          .match-events-content {
            padding: 1rem;
            background: white;
            
            .events-timeline {
              margin-bottom: 1rem;
              
              .timeline {
                .timeline-event {
                  display: flex;
                  align-items: center;
                  gap: 1rem;
                  padding: 0.75rem 0;
                  border-bottom: 1px solid #f0f0f0;
                  
                  &:last-child {
                    border-bottom: none;
                  }
                  
                  .event-time {
                    font-weight: 600;
                    color: #2c3e50;
                    min-width: 3rem;
                    text-align: center;
                  }
                  
                  .event-icon {
                    width: 2rem;
                    height: 2rem;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    
                    &.try-icon {
                      background-color: rgba(76, 175, 80, 0.2);
                      color: #4caf50;
                    }
                    
                    &.conversion-icon {
                      background-color: rgba(33, 150, 243, 0.2);
                      color: #2196f3;
                    }
                    
                    &.penalty-icon {
                      background-color: rgba(255, 193, 7, 0.2);
                      color: #ffc107;
                    }
                    
                    mat-icon {
                      font-size: 1rem;
                      width: 1rem;
                      height: 1rem;
                    }
                  }
                  
                  .event-details {
                    flex: 1;
                    
                    .event-type {
                      font-weight: 600;
                      color: #2c3e50;
                      margin-bottom: 0.25rem;
                    }
                    
                    .event-description {
                      font-size: 0.9rem;
                      color: #666;
                      margin-bottom: 0.25rem;
                    }
                    
                    .event-team {
                      font-size: 0.8rem;
                      color: #3498db;
                      font-weight: 500;
                    }
                    
                    .event-player {
                      font-size: 0.8rem;
                      color: #7f8c8d;
                      margin-top: 0.25rem;
                    }
                  }
                }
              }
            }
            
            .no-events {
              text-align: center;
              padding: 2rem;
              color: #7f8c8d;
              
              mat-icon {
                font-size: 3rem;
                width: 3rem;
                height: 3rem;
                margin-bottom: 1rem;
              }
            }
            
            .match-stats {
              display: flex;
              justify-content: space-around;
              margin: 1rem 0;
              padding: 1rem;
              background: #f8f9fa;
              border-radius: 8px;
              
              .stat-item {
                text-align: center;
                
                .stat-label {
                  font-size: 0.8rem;
                  color: #7f8c8d;
                  margin-bottom: 0.25rem;
                }
                
                .stat-value {
                  font-size: 1.5rem;
                  font-weight: 700;
                  color: #2c3e50;
                }
              }
            }
            
            .event-actions {
              text-align: center;
              margin-top: 1rem;
              
              button {
                mat-icon {
                  margin-right: 0.5rem;
                }
              }
            }
          }
        }
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
        }
        
        .match-top-section {
          padding: 1rem;
          
          .match-teams-header {
            .team {
              .team-name {
                font-size: 1rem;
              }
              
              .team-score {
                font-size: 1.5rem;
              }
            }
          }
          
          .match-info-row {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }
        }
        
        .match-events-content {
          .events-timeline .timeline .timeline-event {
            gap: 0.75rem;
            
            .event-time {
              min-width: 2.5rem;
              font-size: 0.9rem;
            }
            
            .event-icon {
              width: 1.75rem;
              height: 1.75rem;
            }
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

  // Accordion state management
  expandedAccordionPanels: Set<string> = new Set<string>();

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

  // Accordion Management Methods
  isAccordionExpanded(matchId: string): boolean {
    return this.expandedAccordionPanels.has(matchId);
  }

  toggleAccordionPanel(matchId: string): void {
    if (this.expandedAccordionPanels.has(matchId)) {
      this.expandedAccordionPanels.delete(matchId);
    } else {
      this.expandedAccordionPanels.add(matchId);
    }
  }

  onAccordionOpened(matchId: string): void {
    this.expandedAccordionPanels.add(matchId);
  }

  onAccordionClosed(matchId: string): void {
    this.expandedAccordionPanels.delete(matchId);
  }
}
