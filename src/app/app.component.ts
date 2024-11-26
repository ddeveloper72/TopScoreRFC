import { Component } from '@angular/core';
import { AppHeaderComponent } from "./app-header/app-header.component";
import { AppFooterComponent } from "./app-footer/app-footer.component";
import { RouterLink, RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  template: `
    <app-header></app-header>
    <section>
      <h1>{{ title }}</h1>
      <p>Welcome to the Rugby Score Card App</p>

      <p>Use the navigation links above to get started</p>

      <p>Click on the 'Home' link to return to this page</p>
      <nav>
        <ul>
          <li><a routerLink="/home">Home</a></li>
          <li><a routerLink="/calendar">Calendar</a></li>
          <li><a routerLink="/score-tracker">Score Tracker</a></li>
        </ul>
      </nav>
      <router-outlet />
    </section>

    <app-footer></app-footer>
  `,
  imports: [AppHeaderComponent, AppFooterComponent, RouterLink, RouterOutlet],
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'rugby-score-card-app';
}
