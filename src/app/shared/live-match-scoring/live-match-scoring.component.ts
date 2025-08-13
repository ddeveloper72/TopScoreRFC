import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from '../../material/material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, interval } from 'rxjs';
import {
  Match,
  MatchEvent,
  MatchStorageService,
} from '../../services/match-storage.service';
import { MatchApiService } from '../../services/match-api.service';

interface QuickEventButton {
  type:
    | 'try'
    | 'conversion'
    | 'penalty'
    | 'drop_goal'
    | 'card'
    | 'injury'
    | 'substitution';
  label: string;
  icon: string;
  points?: number;
  color: string;
}

@Component({
  selector: 'app-live-match-scoring',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="live-scoring-container" *ngIf="match">
      <!-- Match Header -->
      <div class="match-header">
        <div class="match-title">
          <h1>{{ match.homeTeam }} vs {{ match.awayTeam }}</h1>
          <div class="match-info">
            <span class="competition" *ngIf="match.competition">{{
              match.competition
            }}</span>
            <span class="match-date">{{
              match.date | date : 'MMM dd, yyyy - HH:mm'
            }}</span>
          </div>
        </div>

        <div class="match-controls">
          <button
            mat-raised-button
            [color]="isMatchActive ? 'warn' : 'primary'"
            (click)="toggleMatch()"
            class="control-btn"
          >
            <mat-icon>{{ isMatchActive ? 'pause' : 'play_arrow' }}</mat-icon>
            {{ isMatchActive ? 'Pause Match' : 'Start Match' }}
          </button>

          <button
            mat-stroked-button
            (click)="finishMatch()"
            [disabled]="!isMatchActive"
            class="control-btn"
          >
            <mat-icon>flag</mat-icon>
            Finish Match
          </button>
        </div>
      </div>

      <!-- Live Scoreboard -->
      <div class="live-scoreboard">
        <div class="team-score home-score">
          <div class="team-name">{{ match.homeTeam }}</div>
          <div class="score-display">
            <span class="score">{{ currentHomeScore }}</span>
          </div>
        </div>

        <div class="match-time">
          <div class="period">{{ currentPeriod | titlecase }} Half</div>
          <div class="time-display">{{ formatTime(matchTime) }}</div>
          <div class="period-controls" *ngIf="isMatchActive">
            <button mat-button (click)="switchPeriod()" class="period-btn">
              Switch to
              {{ currentPeriod === 'first' ? 'Second' : 'First' }} Half
            </button>
          </div>
        </div>

        <div class="team-score away-score">
          <div class="team-name">{{ match.awayTeam }}</div>
          <div class="score-display">
            <span class="score">{{ currentAwayScore }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Event Buttons -->
      <div class="quick-events" *ngIf="isMatchActive">
        <h3>🏉 Add Scoring Events</h3>
        <p class="scoring-info">
          Use these buttons to add events with correct rugby point values
        </p>
        <div class="event-buttons">
          <div class="team-section">
            <h4>{{ match.homeTeam }} (Home)</h4>
            <div class="button-grid">
              <button
                mat-raised-button
                *ngFor="let event of quickEventButtons"
                [style.background-color]="event.color"
                class="event-btn"
                (click)="quickAddEvent(event, 'home')"
              >
                <span class="event-icon">{{ event.icon }}</span>
                <span class="event-label">{{ event.label }}</span>
                <span class="event-points" *ngIf="event.points"
                  >({{ event.points }})</span
                >
              </button>
            </div>
          </div>

          <div class="team-section">
            <h4>{{ match.awayTeam }} (Away)</h4>
            <div class="button-grid">
              <button
                mat-raised-button
                *ngFor="let event of quickEventButtons"
                [style.background-color]="event.color"
                class="event-btn"
                (click)="quickAddEvent(event, 'away')"
              >
                <span class="event-icon">{{ event.icon }}</span>
                <span class="event-label">{{ event.label }}</span>
                <span class="event-points" *ngIf="event.points"
                  >({{ event.points }})</span
                >
              </button>
            </div>
          </div>
        </div>

        <!-- Custom Event Button -->
        <button
          mat-stroked-button
          color="primary"
          (click)="openCustomEventDialog()"
          class="custom-event-btn"
        >
          <mat-icon>add_circle_outline</mat-icon>
          Add Non-Scoring Event
        </button>
      </div>

      <!-- Live Event Feed -->
      <div class="live-event-feed">
        <div class="feed-header">
          <h3>Live Event Feed ({{ liveEvents.length }})</h3>
          <button
            mat-icon-button
            (click)="clearAllEvents()"
            [disabled]="liveEvents.length === 0"
            matTooltip="Clear All Events"
          >
            <mat-icon>clear_all</mat-icon>
          </button>
        </div>

        <div class="event-feed" #eventFeed>
          <div
            class="event-item"
            *ngFor="
              let event of liveEvents;
              trackBy: trackByEvent;
              let i = index
            "
            [class]="'event-' + event.eventType"
            [@slideInFromRight]
            [style.animation-delay]="i * 100 + 'ms'"
          >
            <div class="event-time-stamp">
              {{ formatTime(event.matchTime!) }}
            </div>

            <div class="event-content">
              <div class="event-header">
                <span class="event-icon">{{
                  getEventIcon(event.eventType)
                }}</span>
                <span class="event-type">{{
                  formatEventType(event.eventType)
                }}</span>
                <span class="event-team" [class]="event.team">
                  {{ event.team === 'home' ? match.homeTeam : match.awayTeam }}
                </span>
                <span
                  class="event-points"
                  *ngIf="getEventPoints(event.eventType)"
                >
                  +{{ getEventPoints(event.eventType) }}
                </span>
              </div>

              <div class="event-description">{{ event.description }}</div>

              <div class="event-player" *ngIf="event.ourPlayer">
                <mat-icon>person</mat-icon>
                {{ event.ourPlayer }}
              </div>
            </div>

            <div class="event-actions">
              <button
                mat-icon-button
                (click)="editLiveEvent(event)"
                matTooltip="Edit Event"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                (click)="deleteLiveEvent(event)"
                matTooltip="Delete Event"
                class="delete-btn"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>

          <!-- No Events State -->
          <div class="no-events" *ngIf="liveEvents.length === 0">
            <mat-icon>event</mat-icon>
            <p>
              {{
                isMatchActive
                  ? 'Start adding events as they happen!'
                  : 'No events recorded yet'
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- Match Summary (when paused or finished) -->
      <div
        class="match-summary"
        *ngIf="!isMatchActive && liveEvents.length > 0"
      >
        <h3>Match Summary</h3>
        <div class="summary-stats">
          <div class="stat-card">
            <div class="stat-number">{{ getEventCountByType('try') }}</div>
            <div class="stat-label">Tries</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">
              {{ getEventCountByType('conversion') }}
            </div>
            <div class="stat-label">Conversions</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ getEventCountByType('penalty') }}</div>
            <div class="stat-label">Penalties</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ getEventCountByType('card') }}</div>
            <div class="stat-label">Cards</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button
          mat-raised-button
          color="primary"
          (click)="saveMatch()"
          [disabled]="isSaving"
        >
          <mat-icon>save</mat-icon>
          {{ isSaving ? 'Saving...' : 'Save Match' }}
        </button>

        <button mat-stroked-button (click)="exportMatch()">
          <mat-icon>download</mat-icon>
          Export Data
        </button>

        <button mat-button (click)="exitScoring()">
          <mat-icon>exit_to_app</mat-icon>
          Exit Scoring
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-container" *ngIf="!match">
      <mat-spinner></mat-spinner>
      <p>Loading match...</p>
    </div>
  `,
  styles: [
    `
      .live-scoring-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        color: white;
        padding: 1rem;
      }

      .match-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        backdrop-filter: blur(10px);

        .match-title h1 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .match-info {
          display: flex;
          gap: 1rem;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .match-controls {
          display: flex;
          gap: 1rem;
        }

        .control-btn {
          font-weight: 600;

          // Stroked button (Finish Match)
          &[mat-stroked-button] {
            color: white !important;
            border-color: rgba(255, 255, 255, 0.5) !important;
            background-color: rgba(255, 255, 255, 0.1) !important;

            &:hover:not(:disabled) {
              background-color: rgba(255, 255, 255, 0.2) !important;
              border-color: rgba(255, 255, 255, 0.7) !important;
            }

            &:disabled {
              opacity: 0.5;
              color: rgba(255, 255, 255, 0.5) !important;
              border-color: rgba(255, 255, 255, 0.2) !important;
            }

            mat-icon {
              color: inherit !important;
            }
          }
        }
      }

      .live-scoreboard {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 20px;
        backdrop-filter: blur(15px);

        .team-score {
          text-align: center;
          flex: 1;

          .team-name {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1rem;
          }

          .score-display {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;

            .score {
              font-size: 4rem;
              font-weight: 800;
              text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }

            .score-controls {
              display: flex;
              gap: 0.5rem;
            }
          }

          &.home-score .score {
            color: #4caf50;
          }

          &.away-score .score {
            color: #2196f3;
          }
        }

        .match-time {
          text-align: center;
          padding: 0 2rem;

          .period {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }

          .time-display {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }

          .period-btn {
            font-size: 0.85rem;
            background-color: rgba(255, 255, 255, 0.15) !important;
            color: white !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            transition: all 0.3s ease;

            &:hover {
              background-color: rgba(255, 255, 255, 0.25) !important;
              transform: translateY(-1px);
            }
          }
        }
      }

      .quick-events {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        backdrop-filter: blur(10px);

        h3 {
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .scoring-info {
          text-align: center;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          font-style: italic;
        }

        .event-buttons {
          display: flex;
          gap: 2rem;
          margin-bottom: 1rem;

          .team-section {
            flex: 1;

            h4 {
              text-align: center;
              margin-bottom: 1rem;
              font-weight: 600;
            }

            .button-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
              gap: 0.75rem;
            }

            .event-btn {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 1rem;
              border-radius: 12px;
              font-weight: 600;
              color: white;
              min-height: 80px;
              transition: all 0.3s ease;

              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
              }

              .event-icon {
                font-size: 1.5rem;
                margin-bottom: 0.25rem;
              }

              .event-label {
                font-size: 0.85rem;
              }

              .event-points {
                font-size: 0.7rem;
                opacity: 0.8;
              }
            }
          }
        }

        .custom-event-btn {
          width: 100%;
          margin-top: 1rem;
          padding: 1rem;
          font-size: 1rem;
          background-color: rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          transition: all 0.3s ease;

          &:hover {
            background-color: rgba(255, 255, 255, 0.2) !important;
            transform: translateY(-1px);
          }

          mat-icon {
            color: white !important;
          }
        }
      }

      .live-event-feed {
        margin-bottom: 2rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        backdrop-filter: blur(10px);

        .feed-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 1.5rem 1rem;

          h3 {
            margin: 0;
          }
        }

        .event-feed {
          max-height: 400px;
          overflow-y: auto;
          padding: 0 1.5rem 1.5rem;

          .event-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            margin-bottom: 0.75rem;
            background: rgba(255, 255, 255, 0.9);
            color: #333;
            border-radius: 12px;
            border-left: 4px solid #2196f3;

            &.event-try {
              border-left-color: #4caf50;
            }
            &.event-penalty {
              border-left-color: #ff9800;
            }
            &.event-card {
              border-left-color: #f44336;
            }
            &.event-injury {
              border-left-color: #e91e63;
            }

            .event-time-stamp {
              font-weight: 700;
              color: #2196f3;
              min-width: 60px;
            }

            .event-content {
              flex: 1;

              .event-header {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.25rem;

                .event-icon {
                  font-size: 1.2rem;
                }

                .event-type {
                  font-weight: 600;
                }

                .event-team {
                  font-size: 0.85rem;
                  padding: 0.2rem 0.5rem;
                  border-radius: 4px;
                  font-weight: 500;

                  &.home {
                    background: rgba(76, 175, 80, 0.2);
                    color: #4caf50;
                  }
                  &.away {
                    background: rgba(33, 150, 243, 0.2);
                    color: #2196f3;
                  }
                }

                .event-points {
                  background: #4caf50;
                  color: white;
                  padding: 0.2rem 0.4rem;
                  border-radius: 4px;
                  font-size: 0.75rem;
                  font-weight: 600;
                }
              }

              .event-description {
                font-size: 0.9rem;
                margin-bottom: 0.25rem;
              }

              .event-player {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                color: #4caf50;
                font-size: 0.85rem;
                font-weight: 500;
              }
            }

            .event-actions {
              .delete-btn {
                color: #f44336;
              }
            }
          }

          .no-events {
            text-align: center;
            padding: 3rem 1rem;
            color: rgba(255, 255, 255, 0.7);

            mat-icon {
              font-size: 3rem;
              width: 3rem;
              height: 3rem;
              margin-bottom: 1rem;
              opacity: 0.5;
            }
          }
        }
      }

      .match-summary {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        backdrop-filter: blur(10px);

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 1rem;
          margin-top: 1rem;

          .stat-card {
            text-align: center;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;

            .stat-number {
              font-size: 2rem;
              font-weight: 700;
              color: #4caf50;
            }

            .stat-label {
              font-size: 0.85rem;
              opacity: 0.8;
            }
          }
        }
      }

      .action-buttons {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 2rem;

        button {
          padding: 0.75rem 2rem;
          font-weight: 600;

          // Stroked buttons (Export, Exit)
          &[mat-stroked-button] {
            color: white !important;
            border-color: rgba(255, 255, 255, 0.5) !important;
            background-color: rgba(255, 255, 255, 0.1) !important;

            &:hover {
              background-color: rgba(255, 255, 255, 0.2) !important;
              border-color: rgba(255, 255, 255, 0.7) !important;
            }

            mat-icon {
              color: white !important;
            }
          }

          // Regular buttons (Exit)
          &[mat-button] {
            color: white !important;
            background-color: rgba(255, 255, 255, 0.1) !important;

            &:hover {
              background-color: rgba(255, 255, 255, 0.2) !important;
            }

            mat-icon {
              color: white !important;
            }
          }
        }
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        color: white;

        mat-spinner {
          margin-bottom: 1rem;
        }
      }

      // Mobile Responsiveness
      @media (max-width: 768px) {
        .match-header {
          flex-direction: column;
          gap: 1rem;
          text-align: center;
        }

        .live-scoreboard {
          flex-direction: column;
          gap: 1.5rem;

          .match-time {
            order: -1;
          }

          .team-score .score-display .score {
            font-size: 3rem;
          }

          .match-time .time-display {
            font-size: 2rem;
          }
        }

        .quick-events .event-buttons {
          flex-direction: column;
          gap: 1rem;

          .team-section .button-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .action-buttons {
          flex-direction: column;
          gap: 0.5rem;
        }
      }
    `,
  ],
  animations: [
    // Add slide-in animation for events
  ],
})
export class LiveMatchScoringComponent implements OnInit, OnDestroy {
  match: Match | null = null;
  isMatchActive = false;
  matchTime = 0; // in seconds
  currentPeriod: 'first' | 'second' = 'first';
  currentHomeScore = 0;
  currentAwayScore = 0;
  liveEvents: (MatchEvent & { matchTime?: number })[] = [];
  isSaving = false;

  private subscription = new Subscription();
  private matchTimer: Subscription | null = null;

  quickEventButtons: QuickEventButton[] = [
    { type: 'try', label: 'Try', icon: '🏉', points: 5, color: '#4CAF50' },
    {
      type: 'conversion',
      label: 'Conversion',
      icon: '⚽',
      points: 2,
      color: '#2196F3',
    },
    {
      type: 'penalty',
      label: 'Penalty',
      icon: '🎯',
      points: 3,
      color: '#FF9800',
    },
    {
      type: 'drop_goal',
      label: 'Drop Goal',
      icon: '🏈',
      points: 3,
      color: '#9C27B0',
    },
    { type: 'card', label: 'Card', icon: '🟨', color: '#F44336' },
    { type: 'injury', label: 'Injury', icon: '🩹', color: '#E91E63' },
    { type: 'substitution', label: 'Sub', icon: '🔄', color: '#607D8B' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private matchStorage: MatchStorageService,
    private matchApi: MatchApiService
  ) {}

  ngOnInit(): void {
    console.log('🏉 Live Match Scoring component initialized');
    const matchId = this.route.snapshot.paramMap.get('id');
    console.log('🔍 Received match ID from route:', matchId);

    if (matchId) {
      this.loadMatch(matchId);
    } else {
      console.error('❌ No match ID provided in route');
      this.snackBar.open('No match ID provided', 'Close', { duration: 5000 });
      this.router.navigate(['/calendar']);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.matchTimer) {
      this.matchTimer.unsubscribe();
    }
  }

  private loadMatch(matchId: string): void {
    // Try to get match from storage first
    this.match = this.matchStorage.getMatchById(matchId);

    if (this.match) {
      this.initializeMatch();
    } else {
      // Try to load from API
      this.matchApi.getMatchWithEvents(matchId).subscribe({
        next: (match) => {
          this.match = match;
          this.initializeMatch();
        },
        error: (error) => {
          console.error('Error loading match:', error);
          this.snackBar.open('Error loading match', 'Close', {
            duration: 5000,
          });
          this.router.navigate(['/calendar']);
        },
      });
    }
  }

  private initializeMatch(): void {
    if (!this.match) return;

    this.currentHomeScore = this.match.homeScore || 0;
    this.currentAwayScore = this.match.awayScore || 0;
    this.liveEvents = [...(this.match.events || [])];

    // If match is already completed, don't allow live scoring
    if (this.match.status === 'completed') {
      this.snackBar.open('This match has already been completed', 'Close', {
        duration: 5000,
      });
    }
  }

  toggleMatch(): void {
    this.isMatchActive = !this.isMatchActive;

    if (this.isMatchActive) {
      this.startTimer();
      this.snackBar.open('Match started!', 'Close', { duration: 2000 });
    } else {
      this.stopTimer();
      this.snackBar.open('Match paused', 'Close', { duration: 2000 });
    }
  }

  private startTimer(): void {
    this.matchTimer = interval(1000).subscribe(() => {
      this.matchTime++;
    });
  }

  private stopTimer(): void {
    if (this.matchTimer) {
      this.matchTimer.unsubscribe();
      this.matchTimer = null;
    }
  }

  switchPeriod(): void {
    this.currentPeriod = this.currentPeriod === 'first' ? 'second' : 'first';
    this.snackBar.open(`Switched to ${this.currentPeriod} half`, 'Close', {
      duration: 2000,
    });
  }

  private adjustScore(team: 'home' | 'away', change: number): void {
    if (team === 'home') {
      this.currentHomeScore = Math.max(0, this.currentHomeScore + change);
    } else {
      this.currentAwayScore = Math.max(0, this.currentAwayScore + change);
    }

    // Auto-save scores
    this.saveScores();
  }

  quickAddEvent(eventButton: QuickEventButton, team: 'home' | 'away'): void {
    const event: MatchEvent & { matchTime?: number } = {
      _id: Date.now().toString(),
      time: this.formatTimeForEvent(this.matchTime),
      period: this.currentPeriod,
      eventType: eventButton.type,
      team: team,
      description: `${eventButton.label} by ${
        team === 'home' ? this.match!.homeTeam : this.match!.awayTeam
      }`,
      pointsSnapshot: this.currentHomeScore + this.currentAwayScore,
      matchTime: this.matchTime,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.liveEvents.unshift(event); // Add to beginning for newest first

    // Auto-adjust score if it has points
    if (eventButton.points) {
      this.adjustScore(team, eventButton.points);
    }

    this.snackBar.open(`${eventButton.label} added!`, 'Close', {
      duration: 2000,
    });
  }

  openCustomEventDialog(): void {
    // TODO: Open a dialog for custom event creation
    this.snackBar.open('Custom event dialog - Coming soon!', 'Close', {
      duration: 3000,
    });
  }

  editLiveEvent(event: MatchEvent & { matchTime?: number }): void {
    console.log('🎯 Editing event:', event);

    // Create a simple prompt-based edit for now
    const newDescription = prompt(
      'Edit event description:',
      event.description || ''
    );
    const newPlayer = prompt('Edit our player name:', event.ourPlayer || '');
    const newNotes = prompt('Edit notes:', event.notes || '');

    if (newDescription !== null) {
      // User didn't cancel
      // Find and update the event
      const eventIndex = this.liveEvents.findIndex((e) => e._id === event._id);
      if (eventIndex > -1) {
        this.liveEvents[eventIndex] = {
          ...this.liveEvents[eventIndex],
          description:
            newDescription || this.liveEvents[eventIndex].description,
          ourPlayer: newPlayer || this.liveEvents[eventIndex].ourPlayer,
          notes: newNotes || this.liveEvents[eventIndex].notes,
        };

        this.snackBar.open('Event updated!', 'Close', { duration: 2000 });
        console.log('✅ Event updated successfully');
      }
    }
  }

  deleteLiveEvent(event: MatchEvent & { matchTime?: number }): void {
    const index = this.liveEvents.findIndex((e) => e._id === event._id);
    if (index > -1) {
      this.liveEvents.splice(index, 1);
      this.snackBar
        .open('Event deleted', 'Undo', { duration: 3000 })
        .onAction()
        .subscribe(() => {
          this.liveEvents.splice(index, 0, event);
        });
    }
  }

  clearAllEvents(): void {
    if (confirm('Are you sure you want to clear all events?')) {
      this.liveEvents = [];
      this.snackBar.open('All events cleared', 'Close', { duration: 3000 });
    }
  }

  finishMatch(): void {
    if (confirm('Are you sure you want to finish this match?')) {
      this.isMatchActive = false;
      this.stopTimer();

      if (this.match) {
        this.match.status = 'completed';
        this.match.homeScore = this.currentHomeScore;
        this.match.awayScore = this.currentAwayScore;
        this.match.events = this.liveEvents;
      }

      this.saveMatch();
      this.snackBar.open('Match completed!', 'Close', { duration: 3000 });
    }
  }

  saveMatch(): void {
    if (!this.match) return;

    this.isSaving = true;

    // Update match with current data
    this.match.homeScore = this.currentHomeScore;
    this.match.awayScore = this.currentAwayScore;
    this.match.events = this.liveEvents;

    if (this.match._id) {
      // Update via API
      this.matchApi.updateMatch(this.match._id, this.match).subscribe({
        next: () => {
          this.matchStorage.updateMatch(
            this.match!.id || this.match!._id!,
            this.match!
          );
          this.snackBar.open('Match saved successfully!', 'Close', {
            duration: 3000,
          });
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error saving match:', error);
          this.snackBar.open('Error saving match. Saved locally.', 'Close', {
            duration: 5000,
          });
          this.matchStorage.updateMatch(this.match!.id!, this.match!);
          this.isSaving = false;
        },
      });
    } else {
      // Save locally only
      this.matchStorage.updateMatch(this.match.id!, this.match);
      this.snackBar.open('Match saved locally!', 'Close', { duration: 3000 });
      this.isSaving = false;
    }
  }

  private saveScores(): void {
    if (this.match) {
      this.match.homeScore = this.currentHomeScore;
      this.match.awayScore = this.currentAwayScore;
      this.matchStorage.updateMatch(
        this.match.id || this.match._id!,
        this.match
      );
    }
  }

  exportMatch(): void {
    if (!this.match) return;

    const exportData = {
      match: this.match,
      finalScore: `${this.currentHomeScore} - ${this.currentAwayScore}`,
      events: this.liveEvents,
      matchDuration: this.formatTime(this.matchTime),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `match-${this.match.homeTeam}-vs-${this.match.awayTeam}-${
      new Date().toISOString().split('T')[0]
    }.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open('Match data exported!', 'Close', { duration: 3000 });
  }

  exitScoring(): void {
    if (this.isMatchActive) {
      if (confirm('Match is still active. Are you sure you want to exit?')) {
        this.router.navigate(['/calendar']);
      }
    } else {
      this.router.navigate(['/calendar']);
    }
  }

  // Utility methods
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }

  private formatTimeForEvent(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getEventIcon(eventType: string): string {
    const button = this.quickEventButtons.find((b) => b.type === eventType);
    return button ? button.icon : '📝';
  }

  formatEventType(eventType: string): string {
    const button = this.quickEventButtons.find((b) => b.type === eventType);
    return button
      ? button.label
      : eventType.charAt(0).toUpperCase() + eventType.slice(1);
  }

  getEventPoints(eventType: string): number {
    const button = this.quickEventButtons.find((b) => b.type === eventType);
    return button?.points || 0;
  }

  getEventCountByType(eventType: string): number {
    return this.liveEvents.filter((event) => event.eventType === eventType)
      .length;
  }

  trackByEvent(index: number, event: MatchEvent): string {
    return event._id || index.toString();
  }
}
