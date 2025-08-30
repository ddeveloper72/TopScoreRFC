import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import {
  MatchStorageService,
  Match,
  MatchEvent,
} from '../services/match-storage.service';
import { MatchApiService } from '../services/match-api.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recent-matches',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule, RouterModule],
  template: `
    <div class="recent-matches-container">
      <div class="page-header">
        <h1>
          <mat-icon>history</mat-icon>
          Recent Matches
        </h1>
        <p>Review your past game results and statistics</p>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <mat-form-field class="search-field" appearance="outline">
          <mat-icon matPrefix>search</mat-icon>
          <mat-label>Search matches...</mat-label>
          <input
            matInput
            [(ngModel)]="searchTerm"
            (input)="applyFilters()"
            placeholder="Team name, competition..."
          />
        </mat-form-field>

        <div class="filter-buttons">
          <button
            mat-raised-button
            [class.active]="filterType === 'all'"
            (click)="setFilter('all')"
          >
            All
          </button>
          <button
            mat-raised-button
            [class.active]="filterType === 'wins'"
            (click)="setFilter('wins')"
          >
            Wins
          </button>
          <button
            mat-raised-button
            [class.active]="filterType === 'losses'"
            (click)="setFilter('losses')"
          >
            Losses
          </button>
          <button
            mat-raised-button
            [class.active]="filterType === 'draws'"
            (click)="setFilter('draws')"
          >
            Draws
          </button>
        </div>
      </div>

      <!-- Matches Grid -->
      <div
        class="matches-grid"
        *ngIf="!isLoading && filteredMatches.length > 0"
      >
        <div
          class="match-card"
          *ngFor="let match of filteredMatches"
          [attr.data-result]="getMatchResult(match)"
        >
          <!-- Always Visible Top Section -->
          <div class="match-top-section">
            <!-- Teams and Scores -->
            <div class="match-teams-header">
              <div class="team home-team">
                <span class="team-name">{{ match.homeTeam }}</span>
                <div class="team-score">{{ match.homeScore || 0 }}</div>
              </div>

              <div class="score-separator">
                <span class="vs-text">vs</span>
                <div
                  class="result-badge"
                  [ngClass]="getMatchResult(match).toLowerCase()"
                >
                  {{ getResultText(match) }}
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
                {{ formatDate(match.date) }}
              </div>
              <button
                mat-button
                class="match-action-btn"
                (click)="viewMatchDetails(match)"
              >
                <mat-icon>visibility</mat-icon>
                Details
              </button>
            </div>
          </div>

          <!-- Expandable Events Section (Accordion) -->
          <div class="match-events-accordion">
            <mat-expansion-panel
              class="match-events-panel"
              [expanded]="isAccordionExpanded(match.id)"
              (opened)="onAccordionOpened(match.id)"
              (closed)="onAccordionClosed(match.id)"
            >
              <mat-expansion-panel-header class="events-header">
                <mat-panel-title>
                  <mat-icon>sports</mat-icon>
                  Match Events ({{ getEventCount(match.events || [], 'all') }})
                </mat-panel-title>
              </mat-expansion-panel-header>

              <div class="match-events-content">
                <div
                  class="events-timeline"
                  *ngIf="match.events && match.events.length > 0"
                >
                  <div class="timeline">
                    <div
                      class="timeline-event"
                      *ngFor="let event of match.events"
                      [ngClass]="'event-' + event.eventType"
                    >
                      <div class="event-time">{{ event.time }}</div>

                      <div
                        class="event-icon"
                        [ngClass]="event.eventType + '-icon'"
                      >
                        <span class="rugby-icon">{{
                          getEventIcon(event.eventType)
                        }}</span>
                      </div>

                      <div class="event-details">
                        <div class="event-primary">
                          <span class="event-type">{{
                            formatEventType(event.eventType)
                          }}</span>
                          <span class="event-team-name" *ngIf="event.team">{{
                            event.team
                          }}</span>
                        </div>
                        <div
                          class="event-description"
                          *ngIf="event.description"
                        >
                          {{ event.description }}
                        </div>
                        <div class="event-player" *ngIf="event.ourPlayer">
                          {{ event.ourPlayer }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  class="no-events"
                  *ngIf="!match.events || match.events.length === 0"
                >
                  <mat-icon>event_busy</mat-icon>
                  <p>No events recorded for this match</p>
                </div>

                <!-- Match Statistics -->
                <div
                  class="match-stats"
                  *ngIf="match.events && match.events.length > 0"
                >
                  <div class="stat-item">
                    <div class="stat-label">Tries</div>
                    <div class="stat-value">
                      {{ getEventCount(match.events, 'try') }}
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">Penalties</div>
                    <div class="stat-value">
                      {{ getEventCount(match.events, 'penalty') }}
                    </div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-label">Cards</div>
                    <div class="stat-value">
                      {{ getEventCount(match.events, 'card') }}
                    </div>
                  </div>
                </div>

                <!-- Event Actions -->
                <div class="event-actions">
                  <button
                    mat-raised-button
                    color="primary"
                    (click)="addEvent(match)"
                  >
                    <mat-icon>add</mat-icon>
                    Add Event
                  </button>
                </div>
              </div>
            </mat-expansion-panel>
          </div>
        </div>
      </div>

      <!-- No Matches State -->
      <div
        class="no-matches"
        *ngIf="!isLoading && filteredMatches.length === 0"
      >
        <mat-icon>sports_rugby</mat-icon>
        <h3>No Recent Matches</h3>
        <p>
          {{
            searchTerm || filterType !== 'all'
              ? 'No matches found with your current filters'
              : "You haven't played any matches yet"
          }}
        </p>
        <button
          mat-raised-button
          color="primary"
          (click)="startNewMatch()"
          *ngIf="!searchTerm && filterType === 'all'"
        >
          Start Your First Match
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
        color: white;
        margin-bottom: 3rem;
      }

      .page-header h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
      }

      .page-header h1 mat-icon {
        font-size: 2.5rem;
        width: 2.5rem;
        height: 2.5rem;
        color: #ffd700;
      }

      .page-header p {
        font-size: 1.2rem;
        opacity: 0.9;
        margin: 0;
      }

      .filters-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        gap: 1rem;
      }

      .search-field {
        min-width: 350px;
        margin-bottom: 1rem;
      }

      /* Modern Material Form Field Styling */
      .search-field.mat-mdc-form-field {
        /* Remove default subscript spacing */
        .mat-mdc-form-field-subscript-wrapper {
          display: none !important;
        }

        /* Style the main wrapper */
        .mat-mdc-text-field-wrapper {
          background: white;
          border-radius: 25px;
          height: 56px;
          padding: 0 1.25rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #ff9800;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }

        /* Hover effect */
        &:hover .mat-mdc-text-field-wrapper {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          border-left: 4px solid #ffd700;
        }

        /* Remove all outline elements */
        .mdc-notched-outline,
        .mdc-notched-outline__leading,
        .mdc-notched-outline__notch,
        .mdc-notched-outline__trailing {
          display: none !important;
          border: none !important;
        }

        /* Remove focus indicators */
        .mdc-line-ripple,
        .mat-mdc-form-field-focus-overlay,
        .mat-mdc-form-field-ripple {
          display: none !important;
        }

        /* Style the input field */
        .mat-mdc-form-field-infix {
          padding: 0 !important;
          border: none !important;
          min-height: auto !important;

          .mdc-text-field__input {
            color: #2c3e50 !important;
            font-size: 1rem;
            font-weight: 500;
            background: transparent;
            border: none;
            outline: none;
            padding: 0;
            height: auto;

            &::placeholder {
              color: rgba(44, 62, 80, 0.6);
              font-weight: 400;
            }

            &:focus {
              outline: none;
              box-shadow: none;
            }
          }
        }

        /* Style the floating label */
        .mat-mdc-form-field-label-wrapper {
          overflow: visible;

          .mat-mdc-form-field-label {
            color: rgba(44, 62, 80, 0.7);
            font-weight: 500;
            transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);

            /* Focused state */
            &.mdc-floating-label--float-above {
              transform: translateY(-150%) scale(0.85);
              color: #ff9800;
              background: white;
              padding: 0 0.5rem;
              border-radius: 4px;
              z-index: 10;
            }
          }
        }

        /* Style the prefix icon */
        .mat-mdc-form-field-icon-prefix {
          padding-right: 0.75rem;
          display: flex;
          align-items: center;

          mat-icon {
            color: #ff9800;
            font-size: 1.25rem;
            width: 1.25rem;
            height: 1.25rem;
            transition: color 0.3s ease;
          }
        }

        /* Focused state for the entire field */
        &.mat-focused {
          .mat-mdc-text-field-wrapper {
            box-shadow: 0 8px 25px rgba(255, 152, 0, 0.2);
            border-left: 4px solid #ff9800;
          }

          .mat-mdc-form-field-icon-prefix mat-icon {
            color: #ff9800;
          }
        }

        /* Error state styling */
        &.mat-form-field-invalid {
          .mat-mdc-text-field-wrapper {
            border-left: 4px solid #f44336;
            box-shadow: 0 4px 15px rgba(244, 67, 54, 0.15);
          }

          .mat-mdc-form-field-label.mdc-floating-label--float-above {
            color: #f44336;
          }
        }

        /* Disabled state */
        &.mat-form-field-disabled {
          .mat-mdc-text-field-wrapper {
            background: #f5f5f5;
            border-left: 4px solid #e0e0e0;
            box-shadow: none;

            .mdc-text-field__input {
              color: rgba(0, 0, 0, 0.38);
            }
          }

          .mat-mdc-form-field-icon-prefix mat-icon {
            color: rgba(0, 0, 0, 0.38);
          }
        }
      }

      .filter-buttons {
        display: flex;
        gap: 0.5rem;
      }

      .filter-buttons button {
        border-radius: 20px;
        font-weight: 600;
        min-width: 80px;
      }

      .filter-buttons button.active {
        background-color: #ffd700;
        color: #2c3e50;
      }

      .matches-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .match-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
      }

      .match-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
      }

      .match-card[data-result='W'] {
        border-left: 5px solid #27ae60;
      }

      .match-card[data-result='L'] {
        border-left: 5px solid #e74c3c;
      }

      .match-card[data-result='D'] {
        border-left: 5px solid #ff9800;
      }

      .match-top-section {
        padding: 1.5rem;
        background: white;
        border-bottom: 2px solid #f5f5f5;
      }

      .match-teams-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
      }

      .match-teams-header .team {
        flex: 1;
        text-align: center;
      }

      .match-teams-header .team.home-team {
        text-align: left;
      }

      .match-teams-header .team.away-team {
        text-align: right;
      }

      .match-teams-header .team-name {
        display: block;
        font-size: 1.1rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 0.25rem;
      }

      .match-teams-header .team-score {
        font-size: 2rem;
        font-weight: 700;
        color: #3498db;
      }

      .score-separator {
        margin: 0 1rem;
        text-align: center;
      }

      .score-separator .vs-text {
        font-size: 1.2rem;
        color: #7f8c8d;
        font-weight: 500;
        display: block;
      }

      .score-separator .result-badge {
        margin-top: 0.25rem;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.8rem;
      }

      .score-separator .result-badge.win {
        background: #e8f5e8;
        color: #27ae60;
      }

      .score-separator .result-badge.loss {
        background: #ffebee;
        color: #e74c3c;
      }

      .score-separator .result-badge.draw {
        background: #fff3cd;
        color: #f39c12;
      }

      .match-info-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
      }

      .match-type-info,
      .competition-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #2c3e50;
        font-size: 0.9rem;
      }

      .match-type-info mat-icon,
      .competition-info mat-icon {
        font-size: 1.2rem;
        width: 1.2rem;
        height: 1.2rem;
      }

      .match-date-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .match-date-actions .match-date {
        color: #2c3e50;
        font-weight: 500;
      }

      .match-date-actions .match-action-btn {
        color: #3498db;
        font-size: 0.9rem;
      }

      .match-date-actions .match-action-btn mat-icon {
        margin-right: 0.5rem;
      }

      .match-date-actions .match-action-btn:hover {
        background-color: rgba(52, 152, 219, 0.1);
      }

      .match-events-accordion .match-events-panel {
        box-shadow: none;
        border: none;
      }

      .match-events-accordion .events-header {
        background-color: #f8f9fa;
        border-top: 1px solid #e9ecef;
      }

      .match-events-accordion .events-header mat-panel-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #2c3e50;
        font-weight: 500;
      }

      .match-events-accordion .events-header mat-panel-title mat-icon {
        color: #3498db;
      }

      .match-events-content {
        padding: 1rem;
        background: white;
      }

      .events-timeline {
        margin-bottom: 1rem;
      }

      .timeline-event {
        display: flex;
        align-items: flex-start;
        padding: 1rem 0;
        border-bottom: 1px solid #f0f0f0;
        position: relative;
      }

      .timeline-event:last-child {
        border-bottom: none;
      }

      .timeline-event.event-try {
        border-left: 4px solid #4caf50;
        padding-left: 1rem;
      }

      .timeline-event.event-conversion {
        border-left: 4px solid #2196f3;
        padding-left: 1rem;
      }

      .timeline-event.event-penalty {
        border-left: 4px solid #ff9800;
        padding-left: 1rem;
      }

      .timeline-event.event-drop_goal {
        border-left: 4px solid #9c27b0;
        padding-left: 1rem;
      }

      .timeline-event.event-card {
        border-left: 4px solid #f44336;
        padding-left: 1rem;
      }

      .timeline-event.event-substitution {
        border-left: 4px solid #607d8b;
        padding-left: 1rem;
      }

      .timeline-event.event-injury {
        border-left: 4px solid #795548;
        padding-left: 1rem;
      }

      .event-time {
        position: absolute;
        top: 1rem;
        right: 0;
        font-weight: 600;
        color: #2c3e50;
        font-size: 0.9rem;
      }

      .event-icon {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 1rem;
        flex-shrink: 0;
      }

      .event-icon .rugby-icon {
        font-size: 1.2rem;
      }

      .event-icon.try-icon {
        background-color: rgba(76, 175, 80, 0.15);
      }

      .event-icon.conversion-icon {
        background-color: rgba(33, 150, 243, 0.15);
      }

      .event-icon.penalty-icon {
        background-color: rgba(255, 152, 0, 0.15);
      }

      .event-icon.drop_goal-icon {
        background-color: rgba(156, 39, 176, 0.15);
      }

      .event-icon.card-icon {
        background-color: rgba(244, 67, 54, 0.15);
      }

      .event-icon.substitution-icon {
        background-color: rgba(96, 125, 139, 0.15);
      }

      .event-icon.injury-icon {
        background-color: rgba(121, 85, 72, 0.15);
      }

      .event-details {
        flex: 1;
        padding-right: 4rem;
      }

      .event-primary {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
      }

      .event-type {
        font-weight: 600;
        color: #2c3e50;
        font-size: 0.95rem;
      }

      .event-team-name {
        color: #4caf50;
        font-weight: 500;
        font-size: 0.9rem;
      }

      .event-description {
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 0.25rem;
        line-height: 1.4;
      }

      .event-player {
        font-size: 0.85rem;
        color: #7f8c8d;
      }

      .no-events {
        text-align: center;
        padding: 2rem;
        color: #7f8c8d;
      }

      .no-events mat-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        margin-bottom: 1rem;
      }

      .match-stats {
        display: flex;
        justify-content: space-around;
        margin: 1rem 0;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .stat-item {
        text-align: center;
      }

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

      .event-actions {
        text-align: center;
        margin-top: 1rem;
      }

      .event-actions button mat-icon {
        margin-right: 0.5rem;
      }

      .floating-action-btn {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 1000;
      }

      .no-matches {
        text-align: center;
        color: white;
        padding: 4rem 2rem;
      }

      .no-matches mat-icon {
        font-size: 5rem;
        width: 5rem;
        height: 5rem;
        margin-bottom: 2rem;
        opacity: 0.7;
      }

      .no-matches h3 {
        font-size: 1.8rem;
        margin-bottom: 1rem;
      }

      .no-matches p {
        opacity: 0.8;
        margin-bottom: 2rem;
        font-size: 1.1rem;
      }

      .no-matches button {
        border-radius: 25px;
        font-weight: 600;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 50vh;
        color: white;
      }

      .loading-container mat-spinner {
        margin-bottom: 1rem;
      }

      .loading-container p {
        font-size: 1.1rem;
        opacity: 0.8;
      }

      @media (max-width: 768px) {
        .recent-matches-container {
          padding: 1rem;
        }

        .page-header h1 {
          font-size: 2rem;
        }

        .page-header h1 mat-icon {
          font-size: 2rem;
          width: 2rem;
          height: 2rem;
        }

        .filters-section {
          flex-direction: column;
          gap: 1rem;
        }

        .search-field {
          min-width: 250px;
        }

        .matches-grid {
          grid-template-columns: 1fr;
        }

        .match-top-section {
          padding: 1rem;
        }

        .match-teams-header .team-name {
          font-size: 1rem;
        }

        .match-teams-header .team-score {
          font-size: 1.5rem;
        }

        .match-info-row {
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-start;
        }

        .match-events-content .timeline-event {
          gap: 0.75rem;
        }

        .event-time {
          min-width: 2.5rem;
          font-size: 0.9rem;
        }

        .event-icon {
          width: 1.75rem;
          height: 1.75rem;
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

    // Optional: Try to sync with API in background
    this.syncWithAPI();
  }

  private syncWithAPI(): void {
    this.subscription.add(
      this.matchApi.getAllMatches().subscribe({
        next: (apiMatches: Match[]) => {
          // Merge API matches with local matches
          const mergedMatches = this.mergeMatches(this.matches, apiMatches);
          this.matches = mergedMatches.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          this.applyFilters();
        },
        error: (error: any) => {
          console.warn('Failed to sync with API:', error);
          // Continue with local data
        },
      })
    );
  }

  private mergeMatches(localMatches: Match[], apiMatches: Match[]): Match[] {
    const merged = [...localMatches];

    apiMatches.forEach((apiMatch) => {
      const existingIndex = merged.findIndex((m) => m.id === apiMatch.id);
      if (existingIndex >= 0) {
        // Update existing match
        merged[existingIndex] = { ...merged[existingIndex], ...apiMatch };
      } else {
        // Add new match from API
        merged.push(apiMatch);
      }
    });

    return merged;
  }

  setFilter(filter: 'all' | 'wins' | 'losses' | 'draws'): void {
    this.filterType = filter;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.matches];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (match) =>
          match.homeTeam.toLowerCase().includes(searchLower) ||
          match.awayTeam.toLowerCase().includes(searchLower) ||
          match.competition?.toLowerCase().includes(searchLower) ||
          match.venue?.toLowerCase().includes(searchLower)
      );
    }

    // Apply result filter
    if (this.filterType !== 'all') {
      filtered = filtered.filter((match) => {
        const result = this.getMatchResult(match);
        switch (this.filterType) {
          case 'wins':
            return result === 'W';
          case 'losses':
            return result === 'L';
          case 'draws':
            return result === 'D';
          default:
            return true;
        }
      });
    }

    this.filteredMatches = filtered;
  }

  getMatchResult(match: Match): 'W' | 'L' | 'D' {
    if (
      match.homeScore === undefined ||
      match.awayScore === undefined ||
      match.homeScore === null ||
      match.awayScore === null
    ) {
      return 'D'; // Default for incomplete matches
    }

    if (match.homeScore > match.awayScore) {
      return 'W';
    } else if (match.homeScore < match.awayScore) {
      return 'L';
    } else {
      return 'D';
    }
  }

  getResultText(match: Match): string {
    const result = this.getMatchResult(match);
    switch (result) {
      case 'W':
        return 'WIN';
      case 'L':
        return 'LOSS';
      case 'D':
        return 'DRAW';
      default:
        return 'TBD';
    }
  }

  formatDate(dateString: string | Date): string {
    const date =
      typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatMatchType(matchType: string): string {
    const typeMap: { [key: string]: string } = {
      friendly: 'Friendly Match',
      league: 'League Game',
      tournament: 'Tournament',
      playoff: 'Playoff',
      championship: 'Championship',
      boys: "Boys' Team",
      girls: "Girls' Team",
      mixed: 'Mixed Team',
    };
    return typeMap[matchType] || matchType;
  }

  getMatchTypeColor(matchType: string): string {
    const colorMap: { [key: string]: string } = {
      friendly: '#3498db',
      league: '#e74c3c',
      tournament: '#f39c12',
      playoff: '#9b59b6',
      championship: '#f1c40f',
      boys: '#3498db',
      girls: '#e91e63',
      mixed: '#4caf50',
    };
    return colorMap[matchType] || '#95a5a6';
  }

  getMatchTypeIcon(matchType: string): string {
    const iconMap: { [key: string]: string } = {
      friendly: 'handshake',
      league: 'emoji_events',
      tournament: 'military_tech',
      playoff: 'workspace_premium',
      championship: 'stars',
      boys: 'sports_rugby',
      girls: 'sports_handball',
      mixed: 'groups',
    };
    return iconMap[matchType] || 'sports';
  }

  getEventIcon(eventType: string): string {
    const iconMap: { [key: string]: string } = {
      try: '🏈',
      conversion: '🥅',
      penalty: '⚽',
      drop_goal: '🎯',
      card: '🟨',
      substitution: '🔄',
      injury: '🩹',
    };
    return iconMap[eventType] || '⚽';
  }

  formatEventType(eventType: string): string {
    const typeMap: { [key: string]: string } = {
      try: 'Try',
      conversion: 'Conversion',
      penalty: 'Penalty',
      drop_goal: 'Drop Goal',
      card: 'Card',
      substitution: 'Substitution',
      injury: 'Injury',
    };
    return typeMap[eventType] || eventType;
  }

  getEventCount(events: MatchEvent[], eventType: string): number {
    if (eventType === 'all') {
      return events.length;
    }
    return events.filter((event) => event.eventType === eventType).length;
  }

  viewMatchDetails(match: Match): void {
    this.router.navigate(['/match-details', match.id]);
  }

  addEvent(match: Match): void {
    // TODO: Implement add event dialog
    console.log('Add event for match:', match.id);
  }

  startNewMatch(): void {
    this.router.navigate(['/score-tracker']);
  }

  exportMatchData(match: Match): void {
    const matchData = JSON.stringify(match, null, 2);
    const blob = new Blob([matchData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `match-${match.homeTeam}-vs-${match.awayTeam}-${match.date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.snackBar.open('Match data exported successfully!', 'Close', {
      duration: 3000,
    });
  }

  deleteMatch(match: Match): void {
    if (
      confirm(
        `Are you sure you want to delete the match between ${match.homeTeam} and ${match.awayTeam}?`
      )
    ) {
      this.matchStorageService.deleteMatch(match.id);
      this.loadRecentMatches();
      this.snackBar.open('Match deleted successfully!', 'Close', {
        duration: 3000,
      });
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
