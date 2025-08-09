import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import {
  RugbyBallGrayComponent,
  RugbyBallWhiteComponent,
} from '../shared/rugby-ball-variants/rugby-ball-variants.component';

@Component({
  selector: 'app-not-found',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    RouterModule,
    RugbyBallGrayComponent,
    RugbyBallWhiteComponent,
  ],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent implements OnInit, OnDestroy {
  countdown = 5;
  private countdownInterval?: number;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private startCountdown(): void {
    this.countdownInterval = window.setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.goToDashboard();
      }
    }, 1000);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToScoreTracker(): void {
    this.router.navigate(['/score-tracker']);
  }
}
