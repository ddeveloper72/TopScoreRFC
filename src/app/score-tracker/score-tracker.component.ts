import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-score-tracker',
  imports: [FormsModule],
  templateUrl: './score-tracker.component.html',
  styleUrl: './score-tracker.component.scss'
})

export class ScoreTrackerComponent {
  matchName: string = '';
  matchDate: Date | null = null;
  isHomeGame: boolean = true;
  ourTeamScore = {
    tries: 0,
    conversions: 0,
    penalties: 0,
    scorers: {
      firstHalf: [] as string[],
      secondHalf: [] as string[]
    }
  };
  opponentTeamScore = {
    tries: 0,
    conversions: 0,
    penalties: 0
  };

  get totalOurTeamPoints(): number {
    return (this.ourTeamScore.tries * 5) + (this.ourTeamScore.conversions * 2) + (this.ourTeamScore.penalties * 3);
  }

  get totalOpponentTeamPoints(): number {
    return (this.opponentTeamScore.tries * 5) + (this.opponentTeamScore.conversions * 2) + (this.opponentTeamScore.penalties * 3);
  }

  generatePointsReport(): string {
    return `
      Match: ${this.matchName}
      Date: ${this.matchDate?.toLocaleDateString()}
      Home Game: ${this.isHomeGame ? 'Yes' : 'No'}
      Our Team Points: ${this.totalOurTeamPoints}
      Opponent Team Points: ${this.totalOpponentTeamPoints}
      Our Team Scorers (First Half): ${this.ourTeamScore.scorers.firstHalf.join(', ')}
      Our Team Scorers (Second Half): ${this.ourTeamScore.scorers.secondHalf.join(', ')}
    `;
  }
}
