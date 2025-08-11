import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatchApiService } from '../services/match-api.service';
import {
  MatchBookingDialogComponent,
  MatchBookingData,
} from './match-booking-dialog/match-booking-dialog.component';
import { MatchStorageService, Match } from '../services/match-storage.service';
import {
  fadeInOut,
  slideInFromBottom,
  staggerAnimation,
} from '../animations/route-animations';

export interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  matches: Match[];
  hasMatches: boolean;
}

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, MaterialModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  animations: [fadeInOut, slideInFromBottom, staggerAnimation],
})
export class CalendarComponent implements OnInit, OnDestroy {
  currentMonth = new Date();
  currentView: 'month' | 'list' = 'list';
  upcomingMatches: Match[] = [];
  pastMatches: Match[] = [];
  calendarDays: CalendarDay[] = [];
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private matchStorageService: MatchStorageService,
    private matchApi: MatchApiService,
    private snackBar: MatSnackBar
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
        this.generateCalendar();
      })
    );
    this.generateCalendar();

    // On startup, try to sync from backend and replace local copy
    this.matchApi.getAllMatches().subscribe({
      next: (serverMatches) => {
        if (serverMatches && serverMatches.length) {
          this.matchStorageService.setAllMatches(serverMatches as any);
          this.snackBar.open('Matches synced from server.', undefined, {
            duration: 2000,
          });
        }
      },
      error: () => {
        // Non-blocking: keep local data if server unavailable
      },
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  addNewMatch() {
    const dialogRef = this.dialog.open(MatchBookingDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      disableClose: true,
      data: { isEdit: false } as MatchBookingData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const id = this.matchStorageService.saveMatch(result);
        this.snackBar.open('Match saved locally.', undefined, {
          duration: 2000,
        });
        this.matchApi.createMatch({ ...result, id }).subscribe({
          next: () =>
            this.snackBar.open('Match synced to server.', undefined, {
              duration: 2000,
            }),
          error: () =>
            this.snackBar.open(
              'Match saved locally. Server sync failed.',
              'Dismiss',
              { duration: 4000 }
            ),
        });
      }
    });
  }

  editMatch(match: Match) {
    const dialogRef = this.dialog.open(MatchBookingDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      disableClose: true,
      data: { match, isEdit: true } as MatchBookingData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.matchStorageService.updateMatch(match.id, result);
        this.snackBar.open('Match updated locally.', undefined, {
          duration: 2000,
        });
        this.matchApi.updateMatch(match.id, result).subscribe({
          next: () =>
            this.snackBar.open('Match update synced to server.', undefined, {
              duration: 2000,
            }),
          error: () =>
            this.snackBar.open(
              'Update saved locally. Server sync failed.',
              'Dismiss',
              { duration: 4000 }
            ),
        });
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
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
    this.generateCalendar();
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

  // Calendar Grid Methods
  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    // Get first day of the month and last day
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get first day to display (previous month's days if needed)
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    // Get last day to display (next month's days if needed)
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    this.calendarDays = [];
    const currentDate = new Date(startDate);
    const today = new Date();

    while (currentDate <= endDate) {
      const dayMatches = this.getMatchesForDate(currentDate);

      this.calendarDays.push({
        date: new Date(currentDate),
        day: currentDate.getDate(),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: this.isSameDay(currentDate, today),
        matches: dayMatches,
        hasMatches: dayMatches.length > 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  getMatchesForDate(date: Date): Match[] {
    const allMatches = [...this.upcomingMatches, ...this.pastMatches];
    return allMatches.filter((match) => this.isSameDay(match.date, date));
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  onDayClick(day: CalendarDay): void {
    if (day.hasMatches) {
      // Show matches for this day in a dialog or expand view
      console.log('Matches for', day.date, ':', day.matches);
    }
  }

  getMatchTypeClass(match: Match): string {
    const now = new Date();
    if (match.date < now) {
      return 'past-match';
    } else {
      return 'upcoming-match';
    }
  }
}
