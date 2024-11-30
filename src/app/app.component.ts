import { Component } from '@angular/core';
import { AppHeaderComponent } from "./app-header/app-header.component";
import { AppFooterComponent } from "./app-footer/app-footer.component";
import { RouterLink, RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [AppHeaderComponent, AppFooterComponent, RouterLink, RouterOutlet],
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'rugby-score-card-app';
}
