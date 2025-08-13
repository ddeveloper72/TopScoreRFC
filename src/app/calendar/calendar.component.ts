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
import {
  DayMatchesDialogComponent,
  DayMatchesDialogData,
} from './day-matches-dialog/day-matches-dialog.component';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from '../shared/confirmation-dialog/confirmation-dialog.component';
import {
  EventManagerDialogComponent,
  EventManagerDialogData,
} from '../shared/event-manager-dialog/event-manager-dialog.component';
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
    this.addNewMatchForDate(new Date());
  }

  addNewMatchForDate(selectedDate: Date) {
    const dialogRef = this.dialog.open(MatchBookingDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      disableClose: true,
      data: {
        isEdit: false,
        selectedDate: selectedDate,
      } as MatchBookingData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('=== MATCH DIALOG RESULT ===');
        console.log('Raw result from dialog:', result);
        console.log('Match fields check:', {
          matchType: result.matchType,
          homeTeamCategory: result.homeTeamCategory,
          homeTeamAgeLevel: result.homeTeamAgeLevel,
          awayTeamAgeLevel: result.awayTeamAgeLevel,
        });

        const id = this.matchStorageService.saveMatch(result);
        this.snackBar.open('Match saved locally.', undefined, {
          duration: 2000,
        });

        const matchToSend = { ...result, id };
        console.log('Sending to server:', matchToSend);

        this.matchApi.createMatch(matchToSend).subscribe({
          next: (response) => {
            console.log('Server response:', response);
            this.snackBar.open('Match synced to server.', undefined, {
              duration: 2000,
            });
          },
          error: (error) => {
            console.error('Server sync error:', error);
            this.snackBar.open(
              'Match saved locally. Server sync failed.',
              'Dismiss',
              { duration: 4000 }
            );
          },
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
    const confirmData = {
      title: 'Delete Match',
      message: `Are you sure you want to delete the match between ${match.homeTeam} and ${match.awayTeam}?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    };

    const confirmDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: confirmData,
    });

    confirmDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        // Delete from both API (database) and local storage
        const matchId = match._id || match.id; // Use MongoDB ID if available
        const localId = match.id; // Local storage ID

        console.log('🗑️ Deleting match:', { matchId, localId, match });

        this.matchApi.deleteMatch(matchId).subscribe({
          next: (response) => {
            console.log('✅ API deletion successful:', response);

            // Remove from local storage using both possible IDs
            this.matchStorageService.deleteMatch(localId);
            if (matchId !== localId) {
              this.matchStorageService.deleteMatch(matchId);
            }

            // Force refresh from API to ensure consistency
            this.refreshMatchesFromAPI();

            this.snackBar.open('Match deleted successfully.', undefined, {
              duration: 2000,
            });
          },
          error: (error) => {
            console.error('❌ Failed to delete match from API:', error);

            // Still try to remove from local storage for UI consistency
            this.matchStorageService.deleteMatch(localId);
            if (matchId !== localId) {
              this.matchStorageService.deleteMatch(matchId);
            }

            this.snackBar.open(
              'Match deleted locally (API error).',
              undefined,
              {
                duration: 3000,
              }
            );
          },
        });
      }
    });
  }

  // Force refresh matches from API after deletion
  private refreshMatchesFromAPI(): void {
    console.log('🔄 Refreshing matches from API...');
    this.matchApi.getAllMatches().subscribe({
      next: (apiMatches) => {
        console.log('📥 Received matches from API:', apiMatches.length);
        // Update local storage with fresh API data
        this.matchStorageService.clearAllMatches();
        apiMatches.forEach((match) => {
          this.matchStorageService.saveMatch(match);
        });
      },
      error: (error) => {
        console.error('❌ Failed to refresh from API:', error);
      },
    });
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
      // Show matches for this day in a dialog
      const dialogData: DayMatchesDialogData = {
        date: day.date,
        matches: day.matches,
      };

      const dialogRef = this.dialog.open(DayMatchesDialogComponent, {
        width: '600px',
        maxWidth: '90vw',
        data: dialogData,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          switch (result.action) {
            case 'edit':
              this.editMatch(result.match);
              break;
            case 'start':
              this.startMatch(result.match);
              break;
            case 'delete':
              this.deleteMatch(result.match);
              break;
            case 'add':
              this.addNewMatchForDate(result.date);
              break;
          }
        }
      });
    } else {
      // No matches on this day, offer to add one
      this.addNewMatchForDate(day.date);
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

  getMatchTooltip(match: Match): string {
    const timeStr = match.date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${match.homeTeam} vs ${match.awayTeam} at ${timeStr}`;
  }

  openMatchDetails(match: Match, event: Event): void {
    event.stopPropagation(); // Prevent day click event

    const dialogData: DayMatchesDialogData = {
      date: match.date,
      matches: [match], // Show just this specific match
    };

    const dialogRef = this.dialog.open(DayMatchesDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        switch (result.action) {
          case 'edit':
            this.editMatch(result.match);
            break;
          case 'start':
            this.startMatch(result.match);
            break;
          case 'delete':
            this.deleteMatch(result.match);
            break;
        }
      }
    });
  }

  // Match type and team formatting methods (shared with dashboard)
  formatMatchType(matchType: string | undefined): string {
    if (!matchType) return '';

    switch (matchType) {
      case 'boys':
        return "Boys' Teams";
      case 'girls':
        return "Girls' Teams";
      case 'mixed':
        return 'Mixed/Adults';
      default:
        return matchType;
    }
  }

  formatTeamCategory(category: string | undefined): string {
    if (!category) return '';

    switch (category) {
      case 'minis':
        return 'Minis';
      case 'youths-boys':
        return 'Youths';
      case 'girls':
        return 'Girls';
      case 'seniors':
        return 'Seniors';
      case 'womens-tag':
        return "Women's Tag";
      default:
        return category;
    }
  }

  getMatchTypeColor(matchType: string | undefined): string {
    switch (matchType) {
      case 'boys':
        return '#2196f3'; // Blue
      case 'girls':
        return '#e91e63'; // Pink
      case 'mixed':
        return '#4caf50'; // Green
      default:
        return '#757575'; // Grey
    }
  }

  getMatchTypeClass(matchType: string | undefined): string {
    switch (matchType) {
      case 'boys':
        return 'boys-teams';
      case 'girls':
        return 'girls-teams';
      case 'mixed':
        return 'mixed-adults';
      default:
        return '';
    }
  }

  getMatchTypeIcon(matchType: string | undefined): string {
    switch (matchType) {
      case 'boys':
        return 'sports_rugby';
      case 'girls':
        return 'sports_handball';
      case 'mixed':
        return 'groups';
      default:
        return 'sports';
    }
  }

  // ===============================================
  // ENHANCED MATCH EVENTS METHODS
  // ===============================================

  /**
   * Sort events by time for timeline display
   */
  getSortedEvents(events: any[]): any[] {
    if (!events) return [];
    return events.sort((a, b) => {
      const timeA = this.convertTimeToMinutes(a.time);
      const timeB = this.convertTimeToMinutes(b.time);
      return timeA - timeB;
    });
  }

  /**
   * Convert time string (e.g., "15:30") to minutes for sorting
   */
  private convertTimeToMinutes(timeStr: string): number {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes + seconds / 60;
  }

  /**
   * Get icon for event type
   */
  getEventIcon(eventType: string): string {
    switch (eventType) {
      case 'try':
        return '🏉';
      case 'conversion':
        return '⚽';
      case 'penalty':
        return '🎯';
      case 'drop_goal':
        return '🏈';
      case 'card':
        return '🟨';
      case 'injury':
        return '🩹';
      case 'substitution':
        return '🔄';
      default:
        return '📝';
    }
  }

  /**
   * Format event type for display
   */
  formatEventType(eventType: string): string {
    switch (eventType) {
      case 'try':
        return 'Try';
      case 'conversion':
        return 'Conversion';
      case 'penalty':
        return 'Penalty';
      case 'drop_goal':
        return 'Drop Goal';
      case 'card':
        return 'Card';
      case 'injury':
        return 'Injury';
      case 'substitution':
        return 'Substitution';
      default:
        return eventType.charAt(0).toUpperCase() + eventType.slice(1);
    }
  }

  /**
   * Count events of specific type
   */
  getEventCount(events: any[], eventType: string): number {
    if (!events) return 0;
    return events.filter((event) => event.eventType === eventType).length;
  }

  /**
   * Open event manager dialog
   */
  openEventManager(match: Match): void {
    const dialogRef = this.dialog.open(EventManagerDialogComponent, {
      width: '90vw',
      maxWidth: '800px',
      maxHeight: '90vh',
      data: { match } as EventManagerDialogData,
      panelClass: 'event-manager-dialog',
    });

    dialogRef.afterClosed().subscribe((updatedMatch) => {
      if (updatedMatch) {
        console.log('Match updated with events:', updatedMatch);
        // Refresh matches to show updated events
        this.refreshMatchesFromAPI();
      }
    });
  }

  /**
   * View full match report
   */
  viewMatchReport(match: Match): void {
    // TODO: Create MatchReportDialogComponent
    console.log('Viewing match report for:', match);
    this.snackBar.open('Match Report - Coming Soon!', 'Close', {
      duration: 3000,
    });
  }

  /**
   * Duplicate match for rescheduling
   */
  duplicateMatch(match: Match): void {
    const duplicatedMatch = {
      ...match,
      id: undefined,
      _id: undefined,
      date: new Date(match.date.getTime() + 7 * 24 * 60 * 60 * 1000), // Add 1 week
      status: 'scheduled' as const,
      homeScore: 0,
      awayScore: 0,
      events: [], // Clear events for new match
    };

    // Open booking dialog with duplicated match data
    const dialogRef = this.dialog.open(MatchBookingDialogComponent, {
      width: '90vw',
      maxWidth: '800px',
      data: {
        match: duplicatedMatch,
        isEdit: false,
      } as MatchBookingData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Match duplicated successfully!', 'Close', {
          duration: 3000,
        });
      }
    });
  }
}
