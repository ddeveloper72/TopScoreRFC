import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { animation: 'Dashboard' }
  },
  { 
    path: 'score-tracker', 
    loadComponent: () => import('./score-tracker/simple-score-tracker.component').then(m => m.SimpleScoreTrackerComponent),
    data: { animation: 'ScoreTracker' }
  },
  { 
    path: 'score-tracker-advanced', 
    loadComponent: () => import('./score-tracker/score-tracker.component').then(m => m.ScoreTrackerComponent),
    data: { animation: 'ScoreTrackerAdvanced' }
  },
  { 
    path: 'calendar', 
    loadComponent: () => import('./calendar/calendar.component').then(m => m.CalendarComponent),
    data: { animation: 'Calendar' }
  },
  { 
    path: 'games-history', 
    loadComponent: () => import('./game-history/game-history.component').then(m => m.GameHistoryComponent),
    data: { animation: 'GameHistory' }
  },
  { 
    path: '404', 
    loadComponent: () => import('./not-found/not-found.component').then(m => m.NotFoundComponent),
    data: { animation: 'NotFound' }
  },
  { path: '**', redirectTo: '404' }, // Wildcard route - must be last!
];
