import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../material/material.module';
import { AboutModalComponent } from './about-modal/about-modal.component';

@Component({
  selector: 'app-footer',
  imports: [MaterialModule],
  templateUrl: './app-footer.component.html',
  styleUrl: './app-footer.component.scss',
})
export class AppFooterComponent {
  constructor(private dialog: MatDialog) {}

  openAboutModal(): void {
    this.dialog.open(AboutModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      panelClass: 'about-modal',
    });
  }
}
