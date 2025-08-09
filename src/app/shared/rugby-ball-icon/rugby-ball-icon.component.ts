import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rugby-ball-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      [attr.viewBox]="viewBox"
      [style.transform]="'rotate(' + rotation + 'deg)'"
      [style.fill]="color"
      [style.stroke]="strokeColor"
      [style.stroke-width]="strokeWidth"
      class="rugby-ball-icon"
    >
      <!-- Rugby Ball Shape -->
      <ellipse
        cx="24"
        cy="12"
        rx="20"
        ry="10"
        [attr.fill]="color"
        [attr.stroke]="strokeColor"
        [attr.stroke-width]="strokeWidth"
      />

      <!-- Rugby Ball Seam Lines -->
      <path
        d="M 8 12 Q 24 8 40 12 Q 24 16 8 12"
        fill="none"
        [attr.stroke]="lineColor"
        [attr.stroke-width]="lineWidth"
      />

      <path
        d="M 12 12 Q 24 10 36 12"
        fill="none"
        [attr.stroke]="lineColor"
        [attr.stroke-width]="lineWidth"
      />

      <path
        d="M 12 12 Q 24 14 36 12"
        fill="none"
        [attr.stroke]="lineColor"
        [attr.stroke-width]="lineWidth"
      />

      <!-- Center Line -->
      <line
        x1="24"
        y1="4"
        x2="24"
        y2="20"
        [attr.stroke]="lineColor"
        [attr.stroke-width]="lineWidth"
      />
    </svg>
  `,
  styles: [
    `
      .rugby-ball-icon {
        display: inline-block;
        vertical-align: middle;
        transition: all 0.3s ease;
      }

      .rugby-ball-icon:hover {
        transform: scale(1.1);
      }
    `,
  ],
})
export class RugbyBallIconComponent {
  @Input() size: string = '24';
  @Input() color: string = 'currentColor';
  @Input() strokeColor: string = 'none';
  @Input() strokeWidth: string = '0';
  @Input() lineColor: string = '#ffffff';
  @Input() lineWidth: string = '1.5';
  @Input() rotation: number = 0;
  @Input() viewBox: string = '0 0 48 24';
}
