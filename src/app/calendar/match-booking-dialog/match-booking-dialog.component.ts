import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MaterialModule } from '../../material/material.module';
import { Match } from '../../services/match-storage.service';
import {
  GoogleMapsService,
  VenueLocation,
} from '../../services/google-maps.service';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from '../../shared/confirmation-dialog/confirmation-dialog.component';

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
export class MatchBookingDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('mapElement', { static: false })
  mapElement!: ElementRef<HTMLDivElement>;

  bookingForm: FormGroup;
  minDate: Date;
  maxDate: Date;
  timeOptions: { value: string; display: string }[] = [];

  // Google Maps related properties
  venueSearchResults: VenueLocation[] = [];
  selectedVenue: VenueLocation | null = null;
  map: google.maps.Map | null = null;
  marker: google.maps.Marker | null = null;
  private searchSubject = new Subject<string>();
  isSearching = false;
  mapLoading = false;
  mapsConfigured = false;

  // Display function for mat-autocomplete
  displayVenue = (venue?: VenueLocation | string): string => {
    if (!venue) return '';
    if (typeof venue === 'string') return venue;
    return venue.name || venue.formattedAddress || '';
  };

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
    private googleMapsService: GoogleMapsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
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

    // Set up venue search with debouncing
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => {
        if (searchTerm && searchTerm.length >= 2) {
          this.searchVenues(searchTerm);
        } else {
          this.venueSearchResults = [];
        }
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
    // Detect Maps configuration
    this.mapsConfigured = this.googleMapsService.hasApiKey;
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

  ngAfterViewInit(): void {
    // Initialize map if a venue is already selected
    if (this.selectedVenue && this.mapElement) {
      setTimeout(() => {
        this.initializeMap();
      }, 100);
    }
  }

  // Google Maps and Venue Search Methods
  onVenueSearch(event: Event): void {
    if (!this.mapsConfigured) return;
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value;
    this.searchSubject.next(searchTerm);
  }

  async searchVenues(searchTerm: string): Promise<void> {
    if (!this.mapsConfigured) return;
    try {
      this.isSearching = true;
      this.venueSearchResults = await this.googleMapsService.searchPlaces(
        searchTerm
      );

      // If this is an Eircode and we got exactly one precise result, auto-select it
      if (
        this.googleMapsService.isEircode(searchTerm) &&
        this.venueSearchResults.length === 1
      ) {
        this.selectVenue(this.venueSearchResults[0]);
      }
    } catch (error) {
      console.error('Error searching venues:', error);
      this.venueSearchResults = [];
      this.snackBar.open(
        'Error searching venues. Please try again.',
        'Dismiss',
        { duration: 3000 }
      );
    } finally {
      this.isSearching = false;
    }
  }

  onVenueSelected(event: MatAutocompleteSelectedEvent): void {
    const venue: VenueLocation = event.option.value as VenueLocation;
    this.selectVenue(venue);
  }

  // Helper to select a venue programmatically or from autocomplete
  private selectVenue(venue: VenueLocation): void {
    this.selectedVenue = venue;
    this.bookingForm.patchValue({ venue: venue.name });
    setTimeout(() => this.initializeMap(), 50);
  }

  private async initializeMap(): Promise<void> {
    if (!this.selectedVenue || !this.mapElement) return;
    if (!this.mapsConfigured) return;

    try {
      this.mapLoading = true;
      // Create the map
      this.map = (await this.googleMapsService.createMap(
        this.mapElement.nativeElement,
        this.selectedVenue.coordinates
      )) as any;
      if (!this.map) return;

      // Add marker
      this.marker = (await this.googleMapsService.addMarker(
        this.map as any,
        this.selectedVenue
      )) as any;

      // Add click listener to marker
      if (this.marker && this.map) {
        this.marker.addListener('click', () => {
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 8px 0; color: #8b4513;">${this.selectedVenue?.name}</h3>
                <p style="margin: 0; color: #666;">${this.selectedVenue?.address}</p>
              </div>
            `,
          });
          infoWindow.open(this.map as any, this.marker as any);
        });
      }

      // Fit map to show the venue
      if (this.map) {
        this.map.setCenter(this.selectedVenue.coordinates);
        this.map.setZoom(15);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      this.snackBar.open('Error loading map preview.', 'Dismiss', {
        duration: 3000,
      });
    } finally {
      this.mapLoading = false;
    }
  }

  clearVenue(): void {
    this.selectedVenue = null;
    this.bookingForm.patchValue({ venue: '' });
    this.venueSearchResults = [];
    this.snackBar.open('Venue cleared.', undefined, { duration: 2000 });
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

        // Add venueDetails if a venue was selected from Google Maps
        if (this.selectedVenue) {
          matchData.venueDetails = {
            name: this.selectedVenue.name,
            address: this.selectedVenue.address,
            coordinates: this.selectedVenue.coordinates,
            placeId: this.selectedVenue.placeId,
            formattedAddress: this.selectedVenue.formattedAddress,
          };
        }

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
   * Handle ESC key press to close dialog with confirmation
   */
  @HostListener('keydown.escape', ['$event'])
  async onEscapeKey(event: KeyboardEvent): Promise<void> {
    event.preventDefault();
    await this.onCancel();
  }

  /**
   * Confirm if user wants to close the dialog with unsaved changes
   */
  private async confirmClose(): Promise<boolean> {
    const confirmData: ConfirmationDialogData = {
      title: 'Unsaved Changes',
      message:
        'You have unsaved changes. Are you sure you want to close without saving?',
      confirmText: 'Discard Changes',
      cancelText: 'Continue Editing',
    };

    const confirmDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      disableClose: true,
      data: confirmData,
    });

    return confirmDialogRef.afterClosed().toPromise();
  }

  /**
   * Cancel and close dialog
   */
  async onCancel(): Promise<void> {
    // If the form has been touched/modified, show confirmation
    if (this.bookingForm.dirty) {
      const shouldClose = await this.confirmClose();
      if (shouldClose) {
        this.dialogRef.close();
      }
    } else {
      // No changes, close directly
      this.dialogRef.close();
    }
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
