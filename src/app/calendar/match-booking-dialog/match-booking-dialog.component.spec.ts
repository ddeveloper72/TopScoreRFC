import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatchBookingDialogComponent } from './match-booking-dialog.component';
import { MaterialModule } from '../../material/material.module';

describe('MatchBookingDialogComponent', () => {
  let component: MatchBookingDialogComponent;
  let fixture: ComponentFixture<MatchBookingDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<MatchBookingDialogComponent>>;

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        MatchBookingDialogComponent,
        ReactiveFormsModule,
        MaterialModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { isEdit: false } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchBookingDialogComponent);
    component = fixture.componentInstance;
    mockDialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<
      MatDialogRef<MatchBookingDialogComponent>
    >;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate time options on initialization', () => {
    expect(component.timeOptions).toBeDefined();
    expect(component.timeOptions.length).toBeGreaterThan(0);
    expect(
      component.timeOptions.some((option) => option.display.includes('Popular'))
    ).toBeTruthy();
  });

  it('should initialize form with empty values for new match', () => {
    expect(component.bookingForm.get('homeTeam')?.value).toBe('');
    expect(component.bookingForm.get('awayTeam')?.value).toBe('');
    expect(component.bookingForm.get('venue')?.value).toBe('');
    expect(component.bookingForm.get('status')?.value).toBe('scheduled');
  });

  it('should validate required fields', () => {
    const form = component.bookingForm;
    expect(form.valid).toBeFalsy();

    form.patchValue({
      homeTeam: 'Home Team',
      awayTeam: 'Away Team',
      date: new Date(),
      time: '15:00',
      venue: 'Test Venue',
      competition: 'Test Competition',
    });

    expect(form.valid).toBeTruthy();
  });

  it('should prevent past dates', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    component.bookingForm.patchValue({ date: pastDate });
    const dateControl = component.bookingForm.get('date');

    expect(dateControl?.errors?.['pastDate']).toBeTruthy();
  });

  it('should prevent dates more than 1 year in advance', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);

    component.bookingForm.patchValue({ date: futureDate });
    const dateControl = component.bookingForm.get('date');

    expect(dateControl?.errors?.['futureDate']).toBeTruthy();
  });

  it('should validate that teams are different', () => {
    component.bookingForm.patchValue({
      homeTeam: 'Same Team',
      awayTeam: 'Same Team',
    });

    component.teamsValidator();
    const awayTeamControl = component.bookingForm.get('awayTeam');

    expect(awayTeamControl?.errors?.['sameTeam']).toBeTruthy();
  });

  it('should close dialog on cancel', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should close dialog with form data on valid submission', () => {
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 7); // 7 days from now

    component.bookingForm.patchValue({
      homeTeam: 'Home Team',
      awayTeam: 'Away Team',
      date: testDate,
      time: '15:00',
      venue: 'Test Venue',
      competition: 'Test Competition',
      status: 'scheduled',
    });

    component.onSubmit();
    expect(mockDialogRef.close).toHaveBeenCalledWith(
      jasmine.objectContaining({
        homeTeam: 'Home Team',
        awayTeam: 'Away Team',
        venue: 'Test Venue',
        competition: 'Test Competition',
        status: 'scheduled',
      })
    );
  });

  it('should not submit form if invalid', () => {
    component.onSubmit();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });
});
