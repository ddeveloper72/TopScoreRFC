import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDatepickerModule, MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-score-tracker',
  providers: [provideNativeDateAdapter()],
  templateUrl: './score-tracker.component.html',
  styleUrl: './score-tracker.component.scss',
  imports: [
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class ScoreTrackerComponent {
  matchName: string = '';
  matchDate: Date | Date[] = new Date();
  isHomeGame: boolean = true;
  ourTeamScore = {
    tries: 0,
    conversions: 0,
    penalties: 0,
    scorers: {
      firstHalf: [] as string[],
      secondHalf: [] as string[],
    },
  };
  opponentTeamScore = {
    tries: 0,
    conversions: 0,
    penalties: 0,
  };


  get totalOurTeamPoints(): number {
    return (
      this.ourTeamScore.tries * 5 +
      this.ourTeamScore.conversions * 2 +
      this.ourTeamScore.penalties * 3
    );
  }

  get totalOpponentTeamPoints(): number {
    return (
      this.opponentTeamScore.tries * 5 +
      this.opponentTeamScore.conversions * 2 +
      this.opponentTeamScore.penalties * 3
    );
  }


  generatePointsReport(): string {
    return `
      Match: ${this.matchName}
      Date: ${this.matchDate instanceof Date ? this.matchDate.toLocaleDateString() : ''}
      Home Game: ${this.isHomeGame ? 'Yes' : 'No'}
      Our Team Points: ${this.totalOurTeamPoints}
      Opponent Team Points: ${this.totalOpponentTeamPoints}
    `;
  }
}
