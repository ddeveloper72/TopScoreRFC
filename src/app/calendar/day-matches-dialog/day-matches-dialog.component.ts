import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { Match } from '../../services/match-storage.service';
import { Router } from '@angular/router';

export interface DayMatchesDialogData {
  date: Date;
  matches: Match[];
}

@Component({
  selector: 'app-day-matches-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="day-matches-dialog">
      <h2 mat-dialog-title>
        <i class="fa-solid fa-calendar-day"></i>
        Matches for {{ data.date | date : 'EEEE, MMMM dd, yyyy' }}
      </h2>

      <mat-dialog-content>
        <div class="matches-container">
          <div class="match-item" *ngFor="let match of data.matches">
            <mat-card class="match-card">
              <mat-card-content>
                <div class="match-header">
                  <div class="match-time">
                    <i class="fa-solid fa-clock"></i>
                    {{ match.date | date : 'HH:mm' }}
                  </div>
                  <div class="match-status">
                    <span class="status-badge" [ngClass]="match.status">
                      {{ match.status | titlecase }}
                    </span>
                  </div>
                </div>

                <div class="match-teams">
                  <div class="team home-team">
                    <span class="team-name">{{ match.homeTeam }}</span>
                    <small class="team-type">Home</small>
                  </div>
                  <div class="vs-section">
                    <span class="vs">VS</span>
                  </div>
                  <div class="team away-team">
                    <span class="team-name">{{ match.awayTeam }}</span>
                    <small class="team-type">Away</small>
                  </div>
                </div>

                <div class="match-details">
                  <div class="detail-item">
                    <i class="fa-solid fa-location-dot"></i>
                    {{ match.venue }}
                  </div>
                  <div class="detail-item" *ngIf="match.competition">
                    <i class="fa-solid fa-trophy"></i>
                    {{ match.competition }}
                  </div>
                </div>

                <div class="match-actions">
                  <button mat-button color="primary" (click)="editMatch(match)">
                    <i class="fa-solid fa-pen"></i>
                    Edit
                  </button>
                  <button
                    mat-button
                    color="accent"
                    (click)="startMatch(match)"
                    *ngIf="match.status === 'scheduled'"
                  >
                    <i class="fa-solid fa-play"></i>
                    Start Game
                  </button>
                  <button mat-button color="warn" (click)="deleteMatch(match)">
                    <i class="fa-solid fa-trash"></i>
                    Delete
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Close</button>
        <button mat-raised-button color="primary" (click)="addNewMatch()">
          <i class="fa-solid fa-plus"></i>
          Add Match
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .day-matches-dialog {
        min-width: 500px;
        max-width: 600px;
      }

      .matches-container {
        max-height: 500px;
        overflow-y: auto;
        padding: 8px 0;
      }

      .match-item {
        margin-bottom: 16px;
      }

      .match-item:last-child {
        margin-bottom: 0;
      }

      .match-card {
        border-left: 4px solid #1976d2;
      }

      .match-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .match-time {
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(0, 0, 0, 0.7);
        font-weight: 500;
      }

      .status-badge {
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .status-badge.scheduled {
        background-color: #e3f2fd;
        color: #1976d2;
      }

      .status-badge.completed {
        background-color: #e8f5e8;
        color: #388e3c;
      }

      .status-badge.cancelled {
        background-color: #ffebee;
        color: #d32f2f;
      }

      .match-teams {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding: 12px 0;
        border-top: 1px solid #e0e0e0;
        border-bottom: 1px solid #e0e0e0;
      }

      .team {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
      }

      .team-name {
        font-weight: 600;
        font-size: 16px;
        margin-bottom: 4px;
      }

      .team-type {
        color: rgba(0, 0, 0, 0.6);
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .vs-section {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 20px;
      }

      .vs {
        background-color: #1976d2;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 14px;
      }

      .match-details {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
      }

      .detail-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: rgba(0, 0, 0, 0.7);
        font-size: 14px;
      }

      .match-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        padding-top: 8px;
        border-top: 1px solid #e0e0e0;
      }

      mat-dialog-content {
        padding: 16px 24px !important;
      }

      mat-dialog-actions {
        padding: 16px 24px 24px 24px !important;
      }

      h2[mat-dialog-title] {
        margin-bottom: 0 !important;
        display: flex;
        align-items: center;
        gap: 12px;
      }
    `,
  ],
})
export class DayMatchesDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DayMatchesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DayMatchesDialogData,
    private router: Router
  ) {}

  editMatch(match: Match): void {
    this.dialogRef.close({ action: 'edit', match });
  }

  startMatch(match: Match): void {
    this.dialogRef.close({ action: 'start', match });
  }

  deleteMatch(match: Match): void {
    this.dialogRef.close({ action: 'delete', match });
  }

  addNewMatch(): void {
    this.dialogRef.close({ action: 'add', date: this.data.date });
  }

  close(): void {
    this.dialogRef.close();
  }
}
