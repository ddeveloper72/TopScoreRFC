import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScoreTrackerComponent } from './score-tracker/score-tracker.component';
import { CalendarComponent } from './calendar/calendar.component';

const routes: Routes = [
  { path: '', redirectTo: 'score-tracker', pathMatch: 'full' },
  { path : 'score-tracker', component: ScoreTrackerComponent },
  { path: 'calendar', component: CalendarComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
