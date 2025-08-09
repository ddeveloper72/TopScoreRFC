import { Component } from '@angular/core';
import { AppHeaderComponent } from './navigation/app-header/app-header.component';
import { AppFooterComponent } from './app-footer/app-footer.component';
import { RouterOutlet, ChildrenOutletContexts } from '@angular/router';
import { MaterialModule } from './material/material.module';
import { ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { SidenavListComponent } from './navigation/sidenav-list/sidenav-list.component';
import { GlobalLoadingComponent } from './shared/global-loading/global-loading.component';
import { routeAnimations } from './animations/route-animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    AppHeaderComponent,
    AppFooterComponent,
    RouterOutlet,
    MaterialModule,
    SidenavListComponent,
    GlobalLoadingComponent,
  ],
  styleUrl: './app.component.scss',
  animations: [routeAnimations]
})
export class AppComponent {
  title = 'rugby-score-card-app';

  @ViewChild('sidenav')
  sidenav: MatSidenav = new MatSidenav();

  constructor(private contexts: ChildrenOutletContexts) {}

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
