import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../material/material.module';
import { Match } from '../../services/match-storage.service';

export interface MatchBookingData {
  match?: Match;
  isEdit: boolean;
}

@Component({
  selector: 'app-match-booking-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './match-booking-dialog.component.html',
  styleUrls: ['./match-booking-dialog.component.scss'],
})
export class MatchBookingDialogComponent implements OnInit {
  bookingForm: FormGroup;
  minDate: Date;
  maxDate: Date;
  timeOptions: { value: string; display: string }[] = [];
  competitions = [
    'League Championship',
    'Cup Quarter-Final',
    'Cup Semi-Final',
    'Cup Final',
    'Friendly Match',
    'Pre-Season',
    'Tournament',
    'Other',
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MatchBookingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MatchBookingData
  ) {
    // Set date range: today to 1 year from now
    this.minDate = new Date();
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() + 1);

    // Generate time options
    this.generateTimeOptions();

    this.bookingForm = this.fb.group({
      homeTeam: ['', [Validators.required, Validators.minLength(2)]],
      awayTeam: ['', [Validators.required, Validators.minLength(2)]],
      date: ['', [Validators.required, this.dateRangeValidator.bind(this)]],
      time: ['', [Validators.required]],
      venue: ['', [Validators.required, Validators.minLength(2)]],
      competition: ['', Validators.required],
      status: ['scheduled', Validators.required],
    });
  }

  /**
   * Generate time options for the time picker (every 15 minutes from 8 AM to 10 PM)
   */
  private generateTimeOptions(): void {
    this.timeOptions = [];

    // Add common rugby match times first (highlighted options)
    const popularTimes = [
      { value: '14:00', display: '2:00 PM (Popular)' },
      { value: '15:00', display: '3:00 PM (Popular)' },
      { value: '15:30', display: '3:30 PM (Popular)' },
      { value: '16:00', display: '4:00 PM (Popular)' },
      { value: '10:30', display: '10:30 AM (Popular)' },
      { value: '11:00', display: '11:00 AM (Popular)' },
    ];

    // Add popular times
    popularTimes.forEach((time) => {
      this.timeOptions.push(time);
    });

    // Add separator
    this.timeOptions.push({ value: '', display: '────────────' });

    // Generate all time options (every 15 minutes from 8 AM to 10 PM)
    for (let hour = 8; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeValue = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;

        // Skip if already in popular times
        if (!popularTimes.some((popular) => popular.value === timeValue)) {
          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayTime = `${displayHour}:${minute
            .toString()
            .padStart(2, '0')} ${ampm}`;

          this.timeOptions.push({
            value: timeValue,
            display: displayTime,
          });
        }
      }
    }
  }

  ngOnInit(): void {
    // If editing an existing match, populate the form
    if (this.data?.isEdit && this.data.match) {
      const match = this.data.match;
      const matchDate = new Date(match.date);

      this.bookingForm.patchValue({
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        date: matchDate,
        time: this.formatTimeForInput(matchDate),
        venue: match.venue,
        competition: match.competition || '',
        status: match.status,
      });
    }
  }

  /**
   * Custom validator to ensure date is within allowed range
   */
  dateRangeValidator(control: any) {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return { pastDate: true };
    }

    if (selectedDate > this.maxDate) {
      return { futureDate: true };
    }

    return null;
  }

  /**
   * Custom validator to ensure teams are different
   */
  teamsValidator() {
    const homeTeam = this.bookingForm.get('homeTeam')?.value;
    const awayTeam = this.bookingForm.get('awayTeam')?.value;

    if (
      homeTeam &&
      awayTeam &&
      homeTeam.toLowerCase() === awayTeam.toLowerCase()
    ) {
      this.bookingForm.get('awayTeam')?.setErrors({ sameTeam: true });
    }
  }

  /**
   * Format time for the select dropdown (returns HH:mm format)
   */
  private formatTimeForInput(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = Math.round(date.getMinutes() / 15) * 15; // Round to nearest 15 minutes
    const roundedMinutes = minutes === 60 ? 0 : minutes;
    const adjustedHours =
      minutes === 60 ? date.getHours() + 1 : date.getHours();

    return `${adjustedHours.toString().padStart(2, '0')}:${roundedMinutes
      .toString()
      .padStart(2, '0')}`;
  }

  /**
   * Combine date and time into a single Date object
   */
  private combineDateTime(): Date {
    const date = new Date(this.bookingForm.get('date')?.value);
    const timeString = this.bookingForm.get('time')?.value;
    const [hours, minutes] = timeString.split(':');

    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date;
  }

  /**
   * Get error messages for form fields
   */
  getErrorMessage(fieldName: string): string {
    const field = this.bookingForm.get(fieldName);

    if (!field || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }

    if (field.errors['minlength']) {
      return `${this.getFieldDisplayName(fieldName)} must be at least ${
        field.errors['minlength'].requiredLength
      } characters`;
    }

    if (field.errors['pastDate']) {
      return 'Cannot book matches in the past';
    }

    if (field.errors['futureDate']) {
      return 'Cannot book matches more than 1 year in advance';
    }

    if (field.errors['sameTeam']) {
      return 'Home and away teams must be different';
    }

    return 'Invalid input';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      homeTeam: 'Home team',
      awayTeam: 'Away team',
      date: 'Date',
      time: 'Time',
      venue: 'Venue',
      competition: 'Competition',
    };

    return displayNames[fieldName] || fieldName;
  }

  /**
   * Check if form field has errors
   */
  hasError(fieldName: string): boolean {
    const field = this.bookingForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.bookingForm.valid) {
      // Validate that teams are different
      this.teamsValidator();

      if (this.bookingForm.valid) {
        const formValue = this.bookingForm.value;
        const matchData: Partial<Match> = {
          homeTeam: formValue.homeTeam,
          awayTeam: formValue.awayTeam,
          date: this.combineDateTime(),
          venue: formValue.venue,
          competition: formValue.competition,
          status: formValue.status,
        };

        // If editing, include the ID
        if (this.data?.isEdit && this.data.match?.id) {
          matchData.id = this.data.match.id;
        }

        this.dialogRef.close(matchData);
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.bookingForm.controls).forEach((key) => {
        this.bookingForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Cancel and close dialog
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Open the time picker when the schedule icon is clicked
   */
  openTimePicker(): void {
    // Find the mat-select trigger element and click it
    const matSelectTrigger = document.querySelector(
      '.time-field .mat-mdc-select-trigger'
    ) as HTMLElement;
    if (matSelectTrigger) {
      matSelectTrigger.click();
    } else {
      // Fallback: try to find the select element directly
      const timeSelect = document.querySelector(
        '.time-field mat-select'
      ) as HTMLElement;
      if (timeSelect) {
        timeSelect.click();
      }
    }
  }
}
