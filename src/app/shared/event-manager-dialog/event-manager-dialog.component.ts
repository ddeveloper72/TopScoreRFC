import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Match, MatchEvent } from '../../services/match-storage.service';
import { MatchApiService } from '../../services/match-api.service';
import { MatchStorageService } from '../../services/match-storage.service';

export interface EventManagerDialogData {
  match: Match;
}

@Component({
  selector: 'app-event-manager-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatListModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="event-manager-container">
      <h2 mat-dialog-title>
        <mat-icon>sports_rugby</mat-icon>
        Match Events Manager
      </h2>
      
      <div class="match-info">
        <strong>{{ data.match.homeTeam }} vs {{ data.match.awayTeam }}</strong>
        <span class="match-date">{{ data.match.date | date:'MMM dd, yyyy' }}</span>
      </div>

      <mat-dialog-content class="dialog-content">
        <!-- Add New Event Form -->
        <mat-card class="add-event-card">
          <mat-card-header>
            <mat-card-title>Add New Event</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <form [formGroup]="eventForm" class="event-form">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Game Time</mat-label>
                  <input matInput formControlName="time" placeholder="15:30" 
                         [pattern]="timePattern" required>
                  <mat-hint>Format: MM:SS (e.g., 15:30)</mat-hint>
                  <mat-error *ngIf="eventForm.get('time')?.invalid">
                    Please enter time in MM:SS format
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Period</mat-label>
                  <mat-select formControlName="period" required>
                    <mat-option value="first">First Half</mat-option>
                    <mat-option value="second">Second Half</mat-option>
                    <mat-option value="extra">Extra Time</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Event Type</mat-label>
                  <mat-select formControlName="eventType" required>
                    <mat-option value="try">
                      <span class="event-option">🏉 Try (5 points)</span>
                    </mat-option>
                    <mat-option value="conversion">
                      <span class="event-option">⚽ Conversion (2 points)</span>
                    </mat-option>
                    <mat-option value="penalty">
                      <span class="event-option">🎯 Penalty (3 points)</span>
                    </mat-option>
                    <mat-option value="drop_goal">
                      <span class="event-option">🏈 Drop Goal (3 points)</span>
                    </mat-option>
                    <mat-option value="card">
                      <span class="event-option">🟨 Card</span>
                    </mat-option>
                    <mat-option value="injury">
                      <span class="event-option">🩹 Injury</span>
                    </mat-option>
                    <mat-option value="substitution">
                      <span class="event-option">🔄 Substitution</span>
                    </mat-option>
                    <mat-option value="other">
                      <span class="event-option">📝 Other</span>
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Team</mat-label>
                  <mat-select formControlName="team" required>
                    <mat-option value="home">{{ data.match.homeTeam }} (Home)</mat-option>
                    <mat-option value="away">{{ data.match.awayTeam }} (Away)</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Our Player (if applicable)</mat-label>
                <input matInput formControlName="ourPlayer" 
                       placeholder="Player name (for home team events)">
                <mat-hint>Focus on tracking your own team's player performance</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Event Description</mat-label>
                <textarea matInput formControlName="description" 
                          placeholder="Describe what happened..." 
                          rows="2" required></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Additional Notes</mat-label>
                <textarea matInput formControlName="notes" 
                          placeholder="Any additional context or observations..." 
                          rows="2"></textarea>
                <mat-hint>Editable notes for careful wording</mat-hint>
              </mat-form-field>

              <div class="form-actions">
                <button mat-raised-button color="primary" type="button" 
                        (click)="addEvent()" [disabled]="eventForm.invalid || isLoading">
                  <mat-icon>add</mat-icon>
                  Add Event
                </button>
                <button mat-button type="button" (click)="resetForm()">
                  <mat-icon>clear</mat-icon>
                  Clear
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Existing Events List -->
        <mat-card class="events-list-card" *ngIf="events && events.length > 0">
          <mat-card-header>
            <mat-card-title>Match Events ({{ events.length }})</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div class="events-list">
              <div class="event-item" *ngFor="let event of sortedEvents; let i = index"
                   [class]="'event-' + event.eventType">
                <div class="event-summary">
                  <div class="event-time-type">
                    <span class="event-time">{{ event.time }}</span>
                    <span class="event-icon">{{ getEventIcon(event.eventType) }}</span>
                    <span class="event-type">{{ formatEventType(event.eventType) }}</span>
                  </div>
                  <div class="event-team" [class]="event.team">
                    {{ event.team === 'home' ? data.match.homeTeam : data.match.awayTeam }}
                  </div>
                </div>
                
                <div class="event-details">
                  <div class="event-description">{{ event.description }}</div>
                  <div class="event-player" *ngIf="event.ourPlayer">
                    <mat-icon>person</mat-icon>
                    {{ event.ourPlayer }}
                  </div>
                  <div class="event-notes" *ngIf="event.notes">
                    <em>{{ event.notes }}</em>
                  </div>
                </div>

                <div class="event-actions">
                  <button mat-icon-button (click)="editEvent(event)" 
                          matTooltip="Edit Event">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button (click)="deleteEvent(event)" 
                          matTooltip="Delete Event" class="delete-btn">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- No Events State -->
        <div class="no-events" *ngIf="!events || events.length === 0">
          <mat-icon>event_note</mat-icon>
          <h3>No events recorded yet</h3>
          <p>Add your first match event using the form above</p>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Close</button>
        <button mat-raised-button color="primary" (click)="saveAndClose()">
          Save & Close
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .event-manager-container {
      width: 100%;
      max-width: 800px;
    }

    .match-info {
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    .event-form {
      .form-row {
        display: flex;
        gap: 1rem;
        
        mat-form-field {
          flex: 1;
        }
      }

      .full-width {
        width: 100%;
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
      }
    }

    .events-list {
      .event-item {
        display: flex;
        align-items: center;
        padding: 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        margin-bottom: 1rem;
        
        &.event-try { border-left: 4px solid #4caf50; }
        &.event-penalty { border-left: 4px solid #ff9800; }
        &.event-card { border-left: 4px solid #f44336; }
      }

      .event-summary {
        flex: 1;
        
        .event-time-type {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .event-team {
          font-size: 0.9rem;
          margin-top: 0.25rem;
          
          &.home { color: #4caf50; }
          &.away { color: #2196f3; }
        }
      }

      .event-details {
        flex: 2;
        margin: 0 1rem;
        
        .event-description {
          margin-bottom: 0.5rem;
        }

        .event-player {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #4caf50;
          font-size: 0.9rem;
        }

        .event-notes {
          color: #666;
          font-size: 0.85rem;
          margin-top: 0.25rem;
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
      color: #666;
      
      mat-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
      }
    }

    @media (max-width: 600px) {
      .event-form .form-row {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .event-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }
  `]
})
export class EventManagerDialogComponent implements OnInit {
  eventForm: FormGroup;
  events: MatchEvent[] = [];
  isLoading = false;
  timePattern = /^[0-9]{1,2}:[0-5][0-9]$/;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EventManagerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EventManagerDialogData,
    private matchApi: MatchApiService,
    private matchStorage: MatchStorageService,
    private snackBar: MatSnackBar
  ) {
    this.eventForm = this.fb.group({
      time: ['', [Validators.required, Validators.pattern(this.timePattern)]],
      period: ['first', Validators.required],
      eventType: ['', Validators.required],
      team: ['home', Validators.required],
      ourPlayer: [''],
      description: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  get sortedEvents(): MatchEvent[] {
    return this.events.sort((a, b) => {
      const timeA = this.convertTimeToMinutes(a.time);
      const timeB = this.convertTimeToMinutes(b.time);
      return timeA - timeB;
    });
  }

  private convertTimeToMinutes(timeStr: string): number {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes + (seconds / 60);
  }

  private loadEvents(): void {
    this.events = this.data.match.events || [];
  }

  addEvent(): void {
    if (this.eventForm.valid && !this.isLoading) {
      this.isLoading = true;
      const eventData = this.eventForm.value;

      // Add current score snapshot
      eventData.pointsSnapshot = (this.data.match.homeScore || 0) + (this.data.match.awayScore || 0);

      if (this.data.match._id) {
        // Save to API
        this.matchApi.addMatchEvent(this.data.match._id, eventData).subscribe({
          next: (response) => {
            this.events.push(response.event);
            this.matchStorage.addEventToMatch(this.data.match.id || this.data.match._id!, response.event);
            this.snackBar.open('Event added successfully!', 'Close', { duration: 3000 });
            this.resetForm();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error adding event:', error);
            this.snackBar.open('Error adding event. Please try again.', 'Close', { duration: 5000 });
            this.isLoading = false;
          }
        });
      } else {
        // Save locally only
        const localEvent: MatchEvent = {
          ...eventData,
          _id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.events.push(localEvent);
        this.matchStorage.addEventToMatch(this.data.match.id!, localEvent);
        this.snackBar.open('Event added locally!', 'Close', { duration: 3000 });
        this.resetForm();
        this.isLoading = false;
      }
    }
  }

  editEvent(event: MatchEvent): void {
    // Populate form with event data for editing
    this.eventForm.patchValue({
      time: event.time,
      period: event.period,
      eventType: event.eventType,
      team: event.team,
      ourPlayer: event.ourPlayer || '',
      description: event.description,
      notes: event.notes || ''
    });

    // Remove the event temporarily for editing
    this.deleteEvent(event, false);
  }

  deleteEvent(event: MatchEvent, showConfirmation: boolean = true): void {
    if (showConfirmation && !confirm('Are you sure you want to delete this event?')) {
      return;
    }

    const eventIndex = this.events.findIndex(e => e._id === event._id);
    if (eventIndex > -1) {
      this.events.splice(eventIndex, 1);

      if (this.data.match._id && event._id) {
        this.matchApi.deleteMatchEvent(this.data.match._id, event._id).subscribe({
          next: () => {
            this.matchStorage.deleteEventFromMatch(this.data.match.id || this.data.match._id!, event._id!);
            if (showConfirmation) {
              this.snackBar.open('Event deleted successfully!', 'Close', { duration: 3000 });
            }
          },
          error: (error) => {
            console.error('Error deleting event:', error);
            if (showConfirmation) {
              this.snackBar.open('Error deleting event. Please try again.', 'Close', { duration: 5000 });
            }
          }
        });
      } else {
        this.matchStorage.deleteEventFromMatch(this.data.match.id!, event._id!);
        if (showConfirmation) {
          this.snackBar.open('Event deleted locally!', 'Close', { duration: 3000 });
        }
      }
    }
  }

  resetForm(): void {
    this.eventForm.reset({
      period: 'first',
      team: 'home'
    });
  }

  getEventIcon(eventType: string): string {
    switch (eventType) {
      case 'try': return '🏉';
      case 'conversion': return '⚽';
      case 'penalty': return '🎯';
      case 'drop_goal': return '🏈';
      case 'card': return '🟨';
      case 'injury': return '🩹';
      case 'substitution': return '🔄';
      default: return '📝';
    }
  }

  formatEventType(eventType: string): string {
    switch (eventType) {
      case 'try': return 'Try';
      case 'conversion': return 'Conversion';
      case 'penalty': return 'Penalty';
      case 'drop_goal': return 'Drop Goal';
      case 'card': return 'Card';
      case 'injury': return 'Injury';
      case 'substitution': return 'Substitution';
      default: return eventType.charAt(0).toUpperCase() + eventType.slice(1);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  saveAndClose(): void {
    // Update the match with current events
    this.data.match.events = this.events;
    this.dialogRef.close(this.data.match);
  }
}
