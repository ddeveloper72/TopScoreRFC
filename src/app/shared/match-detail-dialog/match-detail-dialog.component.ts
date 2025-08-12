import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { Match } from '../../services/match-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface MatchDetailDialogData {
  match: Match;
  canEdit?: boolean;
}

export interface MatchNote {
  id: string;
  content: string;
  timestamp: Date;
  author: string;
}

export interface MatchPhoto {
  id: string;
  url: string;
  caption?: string;
  timestamp: Date;
}

@Component({
  selector: 'app-match-detail-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  template: `
    <div class="match-detail-dialog">
      <h2 mat-dialog-title>
        <i class="fa-solid fa-football"></i>
        Match Details
      </h2>

      <mat-dialog-content class="match-content">
        <div class="match-tabs">
          <mat-tab-group [(selectedIndex)]="selectedTab">
            <!-- Match Information Tab -->
            <mat-tab label="Match Info">
              <div class="tab-content">
                <div class="match-header-info">
                  <div class="teams-display">
                    <div class="team home-team">
                      <h3>{{ match.homeTeam }}</h3>
                      <span class="team-label">Home</span>
                      <div class="score" *ngIf="match.homeScore !== undefined">
                        {{ match.homeScore }}
                      </div>
                    </div>

                    <div class="vs-section">
                      <div class="vs-badge">VS</div>
                      <div class="match-status">
                        <span class="status-chip" [ngClass]="match.status">
                          {{ match.status | titlecase }}
                        </span>
                      </div>
                    </div>

                    <div class="team away-team">
                      <h3>{{ match.awayTeam }}</h3>
                      <span class="team-label">Away</span>
                      <div class="score" *ngIf="match.awayScore !== undefined">
                        {{ match.awayScore }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="match-details-grid">
                  <div class="detail-card">
                    <mat-icon>schedule</mat-icon>
                    <div class="detail-content">
                      <h4>Date & Time</h4>
                      <p>{{ match.date | date : 'EEEE, MMMM dd, yyyy' }}</p>
                      <p>{{ match.date | date : 'HH:mm' }}</p>
                    </div>
                  </div>

                  <div class="detail-card">
                    <mat-icon>location_on</mat-icon>
                    <div class="detail-content">
                      <h4>Venue</h4>
                      <p>{{ match.venue }}</p>
                      <p
                        *ngIf="match.venueDetails?.formattedAddress"
                        class="venue-address"
                      >
                        {{ match.venueDetails?.formattedAddress }}
                      </p>
                    </div>
                  </div>

                  <div class="detail-card" *ngIf="match.competition">
                    <mat-icon>emoji_events</mat-icon>
                    <div class="detail-content">
                      <h4>Competition</h4>
                      <p>{{ match.competition }}</p>
                    </div>
                  </div>

                  <div class="detail-card" *ngIf="getMatchResult()">
                    <mat-icon>analytics</mat-icon>
                    <div class="detail-content">
                      <h4>Result</h4>
                      <p>{{ getMatchResult() }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Match Notes Tab -->
            <mat-tab label="Notes">
              <div class="tab-content">
                <div class="notes-section">
                  <!-- Add New Note -->
                  <mat-card class="add-note-card">
                    <mat-card-content>
                      <form [formGroup]="noteForm" (ngSubmit)="addNote()">
                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Add a note about this match</mat-label>
                          <textarea
                            matInput
                            formControlName="content"
                            rows="3"
                            placeholder="Match highlights, key moments, observations..."
                          >
                          </textarea>
                        </mat-form-field>

                        <div class="note-actions">
                          <button
                            mat-raised-button
                            color="primary"
                            type="submit"
                            [disabled]="noteForm.invalid"
                          >
                            <mat-icon>add</mat-icon>
                            Add Note
                          </button>
                        </div>
                      </form>
                    </mat-card-content>
                  </mat-card>

                  <!-- Existing Notes -->
                  <div class="notes-list">
                    <mat-card class="note-card" *ngFor="let note of matchNotes">
                      <mat-card-content>
                        <div class="note-header">
                          <span class="note-author">{{ note.author }}</span>
                          <span class="note-date">{{
                            note.timestamp | date : 'MMM dd, yyyy HH:mm'
                          }}</span>
                        </div>
                        <div class="note-content">{{ note.content }}</div>
                        <div class="note-actions">
                          <button
                            mat-icon-button
                            (click)="deleteNote(note.id)"
                            color="warn"
                          >
                            <mat-icon>delete</mat-icon>
                          </button>
                        </div>
                      </mat-card-content>
                    </mat-card>

                    <div class="no-notes" *ngIf="matchNotes.length === 0">
                      <mat-icon>note_add</mat-icon>
                      <p>No notes added yet. Add your first note above!</p>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Photos Tab -->
            <mat-tab label="Photos">
              <div class="tab-content">
                <div class="photos-section">
                  <!-- Photo Upload -->
                  <mat-card class="upload-card">
                    <mat-card-content>
                      <div class="upload-area" (click)="fileInput.click()">
                        <mat-icon>cloud_upload</mat-icon>
                        <h4>Upload Match Photos</h4>
                        <p>Click to select photos or drag and drop</p>
                        <input
                          #fileInput
                          type="file"
                          hidden
                          multiple
                          accept="image/*"
                          (change)="onPhotosSelected($event)"
                        />
                      </div>

                      <div class="upload-progress" *ngIf="uploadProgress > 0">
                        <mat-progress-bar
                          mode="determinate"
                          [value]="uploadProgress"
                        ></mat-progress-bar>
                        <span>{{ uploadProgress }}% uploaded</span>
                      </div>
                    </mat-card-content>
                  </mat-card>

                  <!-- Photo Gallery -->
                  <div class="photo-gallery" *ngIf="matchPhotos.length > 0">
                    <div class="photo-item" *ngFor="let photo of matchPhotos">
                      <div class="photo-container">
                        <img
                          [src]="photo.url"
                          [alt]="photo.caption || 'Match photo'"
                          (click)="openPhotoViewer(photo)"
                        />
                        <div class="photo-overlay">
                          <button
                            mat-icon-button
                            (click)="deletePhoto(photo.id)"
                            class="delete-btn"
                          >
                            <mat-icon>delete</mat-icon>
                          </button>
                        </div>
                      </div>
                      <div class="photo-caption" *ngIf="photo.caption">
                        {{ photo.caption }}
                      </div>
                      <div class="photo-date">
                        {{ photo.timestamp | date : 'MMM dd, yyyy' }}
                      </div>
                    </div>
                  </div>

                  <div class="no-photos" *ngIf="matchPhotos.length === 0">
                    <mat-icon>photo_library</mat-icon>
                    <p>No photos uploaded yet. Share your match memories!</p>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Statistics Tab (for completed matches) -->
            <mat-tab label="Statistics" *ngIf="match.status === 'completed'">
              <div class="tab-content">
                <div class="stats-section">
                  <div class="stats-grid">
                    <div class="stat-card">
                      <h4>Final Score</h4>
                      <div class="score-display">
                        {{ match.homeTeam }} {{ match.homeScore || 0 }} -
                        {{ match.awayScore || 0 }} {{ match.awayTeam }}
                      </div>
                    </div>

                    <div class="stat-card">
                      <h4>Margin</h4>
                      <div class="margin-display">
                        {{ getScoreMargin() }} points
                      </div>
                    </div>

                    <div class="stat-card">
                      <h4>Total Points</h4>
                      <div class="total-display">
                        {{
                          (match.homeScore || 0) + (match.awayScore || 0)
                        }}
                        points
                      </div>
                    </div>
                  </div>

                  <!-- Placeholder for future detailed statistics -->
                  <mat-card class="future-stats">
                    <mat-card-content>
                      <h4>Detailed Statistics</h4>
                      <p>
                        This section will display detailed match statistics such
                        as:
                      </p>
                      <ul>
                        <li>Tries, conversions, penalties breakdown</li>
                        <li>Possession statistics</li>
                        <li>Territory statistics</li>
                        <li>Individual player performance</li>
                      </ul>
                      <p><small>Coming in future updates...</small></p>
                    </mat-card-content>
                  </mat-card>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Close</button>
        <button
          mat-raised-button
          color="primary"
          *ngIf="data.canEdit"
          (click)="editMatch()"
        >
          <mat-icon>edit</mat-icon>
          Edit Match
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .match-detail-dialog {
        width: 800px;
        max-width: 95vw;
        max-height: 90vh;
      }

      .match-content {
        padding: 0 !important;
        max-height: 70vh;
        overflow: hidden;
      }

      .match-tabs {
        height: 100%;
      }

      .tab-content {
        padding: 24px;
        max-height: 60vh;
        overflow-y: auto;
      }

      /* Match Header */
      .match-header-info {
        margin-bottom: 24px;
      }

      .teams-display {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 24px;
      }

      .team {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
      }

      .team h3 {
        margin: 0 0 8px 0;
        font-size: 1.5em;
        font-weight: 600;
        color: #1976d2;
      }

      .team-label {
        font-size: 0.8em;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .score {
        font-size: 2.5em;
        font-weight: bold;
        color: #1976d2;
        margin-top: 12px;
      }

      .vs-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 24px;
      }

      .vs-badge {
        background: #1976d2;
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        font-weight: bold;
        font-size: 1.2em;
      }

      .match-status {
        margin-top: 12px;
      }

      .status-chip {
        padding: 6px 16px;
        border-radius: 16px;
        font-size: 0.8em;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .status-chip.scheduled {
        background: #e3f2fd;
        color: #1976d2;
      }

      .status-chip.completed {
        background: #e8f5e8;
        color: #388e3c;
      }

      .status-chip.cancelled {
        background: #ffebee;
        color: #d32f2f;
      }

      /* Detail Cards */
      .match-details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }

      .detail-card {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 16px;
        transition: box-shadow 0.2s ease;
      }

      .detail-card:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .detail-card mat-icon {
        color: #1976d2;
        margin-top: 2px;
      }

      .detail-content h4 {
        margin: 0 0 8px 0;
        font-size: 1em;
        font-weight: 600;
        color: #333;
      }

      .detail-content p {
        margin: 0 0 4px 0;
        color: #666;
      }

      .venue-address {
        font-size: 0.9em;
        font-style: italic;
      }

      /* Notes Section */
      .notes-section {
        max-width: 100%;
      }

      .add-note-card {
        margin-bottom: 24px;
      }

      .full-width {
        width: 100%;
      }

      .note-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 16px;
      }

      .notes-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .note-card {
        border-left: 4px solid #1976d2;
      }

      .note-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .note-author {
        font-weight: 600;
        color: #1976d2;
      }

      .note-date {
        font-size: 0.8em;
        color: #666;
      }

      .note-content {
        margin-bottom: 12px;
        line-height: 1.6;
      }

      .no-notes {
        text-align: center;
        padding: 48px 24px;
        color: #666;
      }

      .no-notes mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        color: #ccc;
      }

      /* Photos Section */
      .photos-section {
        max-width: 100%;
      }

      .upload-card {
        margin-bottom: 24px;
      }

      .upload-area {
        border: 2px dashed #ccc;
        border-radius: 8px;
        padding: 48px 24px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .upload-area:hover {
        border-color: #1976d2;
        background-color: #f5f5f5;
      }

      .upload-area mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #1976d2;
        margin-bottom: 16px;
      }

      .upload-area h4 {
        margin: 0 0 8px 0;
        color: #333;
      }

      .upload-area p {
        margin: 0;
        color: #666;
      }

      .upload-progress {
        margin-top: 16px;
      }

      .photo-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
      }

      .photo-item {
        display: flex;
        flex-direction: column;
      }

      .photo-container {
        position: relative;
        aspect-ratio: 16/9;
        overflow: hidden;
        border-radius: 8px;
        cursor: pointer;
      }

      .photo-container img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.2s ease;
      }

      .photo-container:hover img {
        transform: scale(1.05);
      }

      .photo-overlay {
        position: absolute;
        top: 8px;
        right: 8px;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .photo-container:hover .photo-overlay {
        opacity: 1;
      }

      .delete-btn {
        background: rgba(244, 67, 54, 0.8);
        color: white;
      }

      .photo-caption {
        margin-top: 8px;
        font-size: 0.9em;
        font-weight: 500;
      }

      .photo-date {
        font-size: 0.8em;
        color: #666;
        margin-top: 4px;
      }

      .no-photos {
        text-align: center;
        padding: 48px 24px;
        color: #666;
      }

      .no-photos mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        color: #ccc;
      }

      /* Statistics Section */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .stat-card {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 24px;
        text-align: center;
      }

      .stat-card h4 {
        margin: 0 0 16px 0;
        color: #666;
        font-size: 0.9em;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .score-display,
      .margin-display,
      .total-display {
        font-size: 1.5em;
        font-weight: bold;
        color: #1976d2;
      }

      .future-stats {
        margin-top: 24px;
      }

      .future-stats ul {
        text-align: left;
        max-width: 400px;
        margin: 16px auto;
      }

      .future-stats li {
        margin-bottom: 8px;
      }

      /* Mobile Responsiveness */
      @media (max-width: 768px) {
        .match-detail-dialog {
          width: 100vw;
          height: 100vh;
          max-width: none;
          max-height: none;
        }

        .teams-display {
          flex-direction: column;
          gap: 16px;
          text-align: center;
        }

        .vs-section {
          margin: 0;
        }

        .match-details-grid {
          grid-template-columns: 1fr;
        }

        .photo-gallery {
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }

        .stats-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class MatchDetailDialogComponent implements OnInit {
  match: Match;
  selectedTab = 0;
  noteForm: FormGroup;
  matchNotes: MatchNote[] = [];
  matchPhotos: MatchPhoto[] = [];
  uploadProgress = 0;

  constructor(
    public dialogRef: MatDialogRef<MatchDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MatchDetailDialogData,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.match = data.match;

    this.noteForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  ngOnInit(): void {
    this.loadMatchNotes();
    this.loadMatchPhotos();
  }

  getMatchResult(): string {
    if (
      this.match.status !== 'completed' ||
      this.match.homeScore === undefined ||
      this.match.awayScore === undefined
    ) {
      return '';
    }

    const homeScore = this.match.homeScore;
    const awayScore = this.match.awayScore;

    if (homeScore === awayScore) {
      return 'Draw';
    } else if (homeScore > awayScore) {
      return `${this.match.homeTeam} won by ${homeScore - awayScore} points`;
    } else {
      return `${this.match.awayTeam} won by ${awayScore - homeScore} points`;
    }
  }

  getScoreMargin(): number {
    if (
      this.match.homeScore === undefined ||
      this.match.awayScore === undefined
    ) {
      return 0;
    }
    return Math.abs(this.match.homeScore - this.match.awayScore);
  }

  addNote(): void {
    if (this.noteForm.valid) {
      const newNote: MatchNote = {
        id: this.generateId(),
        content: this.noteForm.get('content')?.value,
        timestamp: new Date(),
        author: 'Current User', // In a real app, this would be the logged-in user
      };

      this.matchNotes.unshift(newNote);
      this.saveMatchNotes();
      this.noteForm.reset();

      this.snackBar.open('Note added successfully', 'Close', {
        duration: 3000,
      });
    }
  }

  deleteNote(noteId: string): void {
    this.matchNotes = this.matchNotes.filter((note) => note.id !== noteId);
    this.saveMatchNotes();
    this.snackBar.open('Note deleted', 'Close', { duration: 2000 });
  }

  onPhotosSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.uploadPhotos(files);
    }
  }

  uploadPhotos(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        this.processPhoto(file);
      }
    }
  }

  processPhoto(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newPhoto: MatchPhoto = {
        id: this.generateId(),
        url: e.target?.result as string,
        timestamp: new Date(),
        caption: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      };

      this.matchPhotos.push(newPhoto);
      this.saveMatchPhotos();
      this.snackBar.open('Photo uploaded successfully', 'Close', {
        duration: 3000,
      });
    };
    reader.readAsDataURL(file);
  }

  deletePhoto(photoId: string): void {
    this.matchPhotos = this.matchPhotos.filter((photo) => photo.id !== photoId);
    this.saveMatchPhotos();
    this.snackBar.open('Photo deleted', 'Close', { duration: 2000 });
  }

  openPhotoViewer(photo: MatchPhoto): void {
    // In a real implementation, you might open a lightbox or full-screen viewer
    window.open(photo.url, '_blank');
  }

  private loadMatchNotes(): void {
    const storedNotes = localStorage.getItem(`match-notes-${this.match.id}`);
    if (storedNotes) {
      this.matchNotes = JSON.parse(storedNotes).map((note: any) => ({
        ...note,
        timestamp: new Date(note.timestamp),
      }));
    }
  }

  private saveMatchNotes(): void {
    localStorage.setItem(
      `match-notes-${this.match.id}`,
      JSON.stringify(this.matchNotes)
    );
  }

  private loadMatchPhotos(): void {
    const storedPhotos = localStorage.getItem(`match-photos-${this.match.id}`);
    if (storedPhotos) {
      this.matchPhotos = JSON.parse(storedPhotos).map((photo: any) => ({
        ...photo,
        timestamp: new Date(photo.timestamp),
      }));
    }
  }

  private saveMatchPhotos(): void {
    localStorage.setItem(
      `match-photos-${this.match.id}`,
      JSON.stringify(this.matchPhotos)
    );
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  editMatch(): void {
    this.dialogRef.close({ action: 'edit', match: this.match });
  }

  close(): void {
    this.dialogRef.close();
  }
}
