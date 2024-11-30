import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-sidenav-list',
  imports: [MaterialModule],
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
