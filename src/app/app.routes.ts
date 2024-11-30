import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CalendarComponent } from './calendar/calendar.component';
import { ScoreTrackerComponent } from './score-tracker/score-tracker.component';

export const routes: Routes = [
  { path: '', redirectTo: 'score-tracker', pathMatch: 'full' },
  { path : 'score-tracker', component: ScoreTrackerComponent },
  { path: 'calendar', component: CalendarComponent },
];

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(routes)],
  exports: [RouterModule],
})

export class AppRoutingModule {}
