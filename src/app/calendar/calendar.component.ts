import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import {
  MatchBookingDialogComponent,
  MatchBookingData,
} from './match-booking-dialog/match-booking-dialog.component';
import { MatchStorageService, Match } from '../services/match-storage.service';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, MaterialModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit, OnDestroy {
  currentMonth = new Date();
  currentView: 'month' | 'list' = 'list';
  upcomingMatches: Match[] = [];
  pastMatches: Match[] = [];
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private matchStorageService: MatchStorageService
  ) {}

  ngOnInit(): void {
    // Subscribe to matches changes
    this.subscription.add(
      this.matchStorageService.matches$.subscribe((matches) => {
        const now = new Date();
        const sortedMatches = matches.sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        );

        // Separate into upcoming and past matches
        this.upcomingMatches = sortedMatches.filter(
          (match) => match.date >= now
        );
        this.pastMatches = sortedMatches.filter((match) => match.date < now);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  addNewMatch() {
    const dialogRef = this.dialog.open(MatchBookingDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      disableClose: false,
      data: { isEdit: false } as MatchBookingData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.matchStorageService.saveMatch(result);
      }
    });
  }

  editMatch(match: Match) {
    const dialogRef = this.dialog.open(MatchBookingDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      disableClose: false,
      data: { match, isEdit: true } as MatchBookingData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.matchStorageService.updateMatch(match.id, result);
      }
    });
  }

  startMatch(match: Match) {
    // Navigate to score tracker with pre-filled team names
    this.router.navigate(['/score-tracker'], {
      queryParams: {
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        matchId: match.id,
      },
    });
  }

  deleteMatch(match: Match) {
    if (
      confirm(
        `Are you sure you want to delete the match between ${match.homeTeam} and ${match.awayTeam}?`
      )
    ) {
      this.matchStorageService.deleteMatch(match.id);
    }
  }

  previousMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
  }

  nextMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
  }

  getDaysUntil(date: Date): number {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getMatchResult(match: Match): string {
    if (
      match.status !== 'completed' ||
      match.homeScore === undefined ||
      match.awayScore === undefined
    ) {
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
}
