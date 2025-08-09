import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../services/loading.service';
import { fadeInOut } from '../../animations/route-animations';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-global-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="global-loading-overlay" *ngIf="isLoading$ | async" [@fadeInOut]>
      <div class="loading-content">
        <mat-spinner diameter="50"></mat-spinner>
        <p class="loading-message">Loading...</p>
      </div>
    </div>
  `,
  styles: [`
    .global-loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .loading-content {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      min-width: 200px;
    }

    .loading-message {
      margin: 0;
      color: #333;
      font-size: 16px;
      font-weight: 500;
    }

    mat-spinner {
      --mdc-circular-progress-active-indicator-color: #1976d2;
    }
  `],
  animations: [fadeInOut]
})
export class GlobalLoadingComponent implements OnInit {
  isLoading$: Observable<boolean>;

  constructor(private loadingService: LoadingService) {
    this.isLoading$ = this.loadingService.loading$;
  }

  ngOnInit(): void {}
}
