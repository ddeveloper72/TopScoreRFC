import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-header',
  imports: [MaterialModule],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
})
export class AppHeaderComponent implements OnInit {
  @Output() public sidenavToggle = new EventEmitter();

  title = 'TopScore';

  constructor() {}

  ngOnInit() {}

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  };
}
