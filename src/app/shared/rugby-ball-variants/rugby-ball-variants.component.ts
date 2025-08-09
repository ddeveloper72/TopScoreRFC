import { Component, Input } from '@angular/core';
import { RugbyBallIconComponent } from '../rugby-ball-icon/rugby-ball-icon.component';

@Component({
  selector: 'app-rugby-ball-primary',
  standalone: true,
  imports: [RugbyBallIconComponent],
  template: `
    <app-rugby-ball-icon
      [size]="size"
      color="#8B4513"
      lineColor="#FFFFFF"
      [lineWidth]="lineWidth"
      [rotation]="rotation">
    </app-rugby-ball-icon>
  `
})
export class RugbyBallPrimaryComponent {
  @Input() size: string = '24';
  @Input() lineWidth: string = '1.5';
  @Input() rotation: number = 0;
}

@Component({
  selector: 'app-rugby-ball-white',
  standalone: true,
  imports: [RugbyBallIconComponent],
  template: `
    <app-rugby-ball-icon
      [size]="size"
      color="#FFFFFF"
      strokeColor="#333333"
      strokeWidth="1"
      lineColor="#333333"
      [lineWidth]="lineWidth"
      [rotation]="rotation">
    </app-rugby-ball-icon>
  `
})
export class RugbyBallWhiteComponent {
  @Input() size: string = '24';
  @Input() lineWidth: string = '1.5';
  @Input() rotation: number = 0;
}

@Component({
  selector: 'app-rugby-ball-black',
  standalone: true,
  imports: [RugbyBallIconComponent],
  template: `
    <app-rugby-ball-icon
      [size]="size"
      color="#000000"
      lineColor="#FFFFFF"
      [lineWidth]="lineWidth"
      [rotation]="rotation">
    </app-rugby-ball-icon>
  `
})
export class RugbyBallBlackComponent {
  @Input() size: string = '24';
  @Input() lineWidth: string = '1.5';
  @Input() rotation: number = 0;
}

@Component({
  selector: 'app-rugby-ball-gray',
  standalone: true,
  imports: [RugbyBallIconComponent],
  template: `
    <app-rugby-ball-icon
      [size]="size"
      color="#666666"
      lineColor="#CCCCCC"
      [lineWidth]="lineWidth"
      [rotation]="rotation">
    </app-rugby-ball-icon>
  `
})
export class RugbyBallGrayComponent {
  @Input() size: string = '24';
  @Input() lineWidth: string = '1.5';
  @Input() rotation: number = 0;
}

@Component({
  selector: 'app-rugby-ball-accent',
  standalone: true,
  imports: [RugbyBallIconComponent],
  template: `
    <app-rugby-ball-icon
      [size]="size"
      color="#1976d2"
      lineColor="#FFFFFF"
      [lineWidth]="lineWidth"
      [rotation]="rotation">
    </app-rugby-ball-icon>
  `
})
export class RugbyBallAccentComponent {
  @Input() size: string = '24';
  @Input() lineWidth: string = '1.5';
  @Input() rotation: number = 0;
}
