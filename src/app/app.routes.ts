import { Routes } from '@angular/router';
import { CalendarComponent } from './calendar/calendar.component';
import { ScoreTrackerComponent } from './score-tracker/score-tracker.component';
import { SimpleScoreTrackerComponent } from './score-tracker/simple-score-tracker.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GameHistoryComponent } from './game-history/game-history.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'score-tracker', component: SimpleScoreTrackerComponent },
  { path: 'score-tracker-advanced', component: ScoreTrackerComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'games-history', component: GameHistoryComponent },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '404' }, // Wildcard route - must be last!
];
