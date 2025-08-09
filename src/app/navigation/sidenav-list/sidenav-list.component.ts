import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material/material.module';
import { RugbyBallWhiteComponent } from '../../shared/rugby-ball-variants/rugby-ball-variants.component';

@Component({
  selector: 'app-sidenav-list',
  imports: [MaterialModule, RouterModule, RugbyBallWhiteComponent],
  templateUrl: './sidenav-list.component.html',
  styleUrl: './sidenav-list.component.scss',
})
export class SidenavListComponent implements OnInit {
  @Output() sidenavClose = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  public onSidenavClose = () => {
    this.sidenavClose.emit();
  };
}
