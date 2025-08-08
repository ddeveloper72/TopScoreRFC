import { Component } from '@angular/core';
import { AppHeaderComponent } from './navigation/app-header/app-header.component';
import { AppFooterComponent } from './app-footer/app-footer.component';
import { RouterOutlet } from '@angular/router';
import { MaterialModule } from './material/material.module';
import { ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { SidenavListComponent } from './navigation/sidenav-list/sidenav-list.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    AppHeaderComponent,
    AppFooterComponent,
    RouterOutlet,
    MaterialModule,
    SidenavListComponent,
  ],
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'rugby-score-card-app';

  @ViewChild('sidenav')
  sidenav: MatSidenav = new MatSidenav();
}
