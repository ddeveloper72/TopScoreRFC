import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreTrackerComponent } from './score-tracker.component';

describe('ScoreTrackerComponent', () => {
  let component: ScoreTrackerComponent;
  let fixture: ComponentFixture<ScoreTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreTrackerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
