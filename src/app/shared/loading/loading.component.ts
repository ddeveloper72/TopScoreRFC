import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { fadeInOut } from '../../animations/route-animations';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-container" [@fadeInOut]>
      <div class="loading-content">
        <mat-spinner diameter="40"></mat-spinner>
        <p class="loading-text">Loading...</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      width: 100%;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .loading-text {
      margin: 0;
      color: var(--mdc-theme-on-surface, #333);
      font-size: 14px;
      opacity: 0.8;
    }

    mat-spinner {
      --mdc-circular-progress-active-indicator-color: var(--mdc-theme-primary, #1976d2);
    }
  `],
  animations: [fadeInOut]
})
export class LoadingComponent { }
