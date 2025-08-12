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
  selectedDate?: Date;
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

  // Match types (boys vs boys, girls vs girls)
  matchTypes = [
    { value: 'boys', label: "Boys' Teams" },
    { value: 'girls', label: "Girls' Teams" },
    { value: 'mixed', label: 'Mixed/Adults' },
  ];

  // Cached team categories for the current match type
  currentTeamCategories: { value: string; label: string }[] = [];

  // Cached age levels for the current team categories
  currentHomeAgelevels: string[] = [];
  currentAwayAgeLevels: string[] = [];

  // Team categories based on match type
  getTeamCategoriesForMatchType(matchType: string) {
    switch (matchType) {
      case 'boys':
        return [
          { value: 'minis', label: 'Minis (Boys)' },
          { value: 'youths-boys', label: 'Youths (Boys)' },
          { value: 'seniors', label: 'Seniors' },
        ];
      case 'girls':
        return [
          { value: 'minis', label: 'Minis (Girls)' },
          { value: 'girls', label: 'Girls (Wolves Amalgamation)' },
          { value: 'womens-tag', label: "Women's Tag Rugby" },
        ];
      case 'mixed':
        return [
          { value: 'seniors', label: 'Seniors' },
          { value: 'womens-tag', label: "Women's Tag Rugby" },
        ];
      default:
        return [];
    }
  }

  // Team categories and age levels based on Clane RFC structure
  teamCategories = [
    { value: 'minis', label: 'Minis (Boys & Girls)' },
    { value: 'youths-boys', label: 'Youths (Boys)' },
    { value: 'girls', label: 'Girls (Wolves Amalgamation)' },
    { value: 'seniors', label: 'Seniors' },
    { value: 'womens-tag', label: "Women's Tag Rugby" },
  ];

  ageLevels = {
    minis: ['U7', 'U8', 'U9', 'U10', 'U11', 'U12'],
    'youths-boys': ['U13', 'U14', 'U15', 'U16', 'U17', 'U18'],
    girls: ['U14', 'U16', 'U18'],
    seniors: ['Adults'],
    'womens-tag': ['Adults'],
  };

  // Get available age levels based on selected category
  getAgeLevelsForCategory(category: string): string[] {
    return this.ageLevels[category as keyof typeof this.ageLevels] || [];
  }

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
      matchType: ['', Validators.required],
      homeTeam: ['', [Validators.required, Validators.minLength(2)]],
      homeTeamCategory: ['', Validators.required],
      homeTeamAgeLevel: ['', Validators.required],
      awayTeam: ['', [Validators.required, Validators.minLength(2)]],
      awayTeamCategory: ['', Validators.required],
      awayTeamAgeLevel: ['', Validators.required],
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

      // Set default match type if not present (for backward compatibility)
      let matchType = match.matchType;
      if (!matchType) {
        // Default to 'mixed' for existing matches without match type
        matchType = 'mixed';
      }

      this.bookingForm.patchValue({
        matchType: matchType,
        homeTeam: match.homeTeam,
        homeTeamCategory: match.homeTeamCategory || '',
        homeTeamAgeLevel: match.homeTeamAgeLevel || '',
        awayTeam: match.awayTeam,
        awayTeamCategory: match.awayTeamCategory || '',
        awayTeamAgeLevel: match.awayTeamAgeLevel || '',
        date: matchDate,
        time: this.formatTimeForInput(matchDate),
        venue: match.venue,
        competition: match.competition || '',
        status: match.status,
      });

      // Initialize cached data for edit mode
      this.currentTeamCategories =
        this.getTeamCategoriesForMatchType(matchType);

      // Set default team categories if not present (for backward compatibility)
      let homeTeamCategory = match.homeTeamCategory;
      let awayTeamCategory = match.awayTeamCategory;

      if (!homeTeamCategory && matchType === 'mixed') {
        homeTeamCategory = 'seniors'; // Default category for mixed matches
      }
      if (!awayTeamCategory && matchType === 'mixed') {
        awayTeamCategory = 'seniors'; // Default category for mixed matches
      }

      if (homeTeamCategory) {
        this.currentHomeAgelevels =
          this.getAgeLevelsForCategory(homeTeamCategory);
        // Update form if we set a default
        if (!match.homeTeamCategory) {
          this.bookingForm.patchValue({ homeTeamCategory: homeTeamCategory });
        }
      }
      if (awayTeamCategory) {
        this.currentAwayAgeLevels =
          this.getAgeLevelsForCategory(awayTeamCategory);
        // Update form if we set a default
        if (!match.awayTeamCategory) {
          this.bookingForm.patchValue({ awayTeamCategory: awayTeamCategory });
        }
      }

      // Set default age levels if not present
      if (!match.homeTeamAgeLevel && homeTeamCategory) {
        const defaultAgeLevel =
          this.getAgeLevelsForCategory(homeTeamCategory)[0] || 'Adults';
        this.bookingForm.patchValue({ homeTeamAgeLevel: defaultAgeLevel });
      }
      if (!match.awayTeamAgeLevel && awayTeamCategory) {
        const defaultAgeLevel =
          this.getAgeLevelsForCategory(awayTeamCategory)[0] || 'Adults';
        this.bookingForm.patchValue({ awayTeamAgeLevel: defaultAgeLevel });
      }

      // Mark the form as pristine after populating it with existing data
      this.bookingForm.markAsPristine();
      this.bookingForm.markAsUntouched();
    } else if (this.data?.selectedDate) {
      // Pre-populate date when creating a new match for a specific date
      this.bookingForm.patchValue({
        date: this.data.selectedDate,
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

  // Handle match type changes and reset team categories and age levels
  onMatchTypeChange(): void {
    const matchType = this.bookingForm.get('matchType')?.value;

    // Update cached team categories
    this.currentTeamCategories = this.getTeamCategoriesForMatchType(matchType);

    // Reset age levels cache
    this.currentHomeAgelevels = [];
    this.currentAwayAgeLevels = [];

    // Reset both teams' category and age level selections when match type changes
    this.bookingForm.patchValue({
      homeTeamCategory: '',
      homeTeamAgeLevel: '',
      awayTeamCategory: '',
      awayTeamAgeLevel: '',
    });
  }

  // Handle team category changes and reset age level
  onTeamCategoryChange(teamType: 'home' | 'away'): void {
    const categoryField =
      teamType === 'home' ? 'homeTeamCategory' : 'awayTeamCategory';
    const ageLevelField =
      teamType === 'home' ? 'homeTeamAgeLevel' : 'awayTeamAgeLevel';

    // Get the selected category
    const selectedCategory = this.bookingForm.get(categoryField)?.value;

    // Update cached age levels
    if (teamType === 'home') {
      this.currentHomeAgelevels =
        this.getAgeLevelsForCategory(selectedCategory);
    } else {
      this.currentAwayAgeLevels =
        this.getAgeLevelsForCategory(selectedCategory);
    }

    // Reset age level when category changes
    this.bookingForm.patchValue({
      [ageLevelField]: '',
    });
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

    // In edit mode, allow past dates (for historical matches)
    if (!this.data?.isEdit && selectedDate < today) {
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
    const awayTeamControl = this.bookingForm.get('awayTeam');

    if (
      homeTeam &&
      awayTeam &&
      homeTeam.toLowerCase() === awayTeam.toLowerCase()
    ) {
      awayTeamControl?.setErrors({ sameTeam: true });
    } else {
      // Clear the sameTeam error if teams are different
      const currentErrors = awayTeamControl?.errors;
      if (currentErrors && currentErrors['sameTeam']) {
        delete currentErrors['sameTeam'];
        // If no other errors exist, set errors to null
        const hasOtherErrors = Object.keys(currentErrors).length > 0;
        awayTeamControl?.setErrors(hasOtherErrors ? currentErrors : null);
      }
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
    try {
      const date = new Date(this.bookingForm.get('date')?.value);
      const timeString = this.bookingForm.get('time')?.value;

      if (!timeString) {
        console.error('No time string provided');
        return date;
      }

      const [hours, minutes] = timeString.split(':');

      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      date.setSeconds(0);
      date.setMilliseconds(0);

      console.log('Combined date/time:', date);
      return date;
    } catch (error) {
      console.error('Error combining date/time:', error);
      return new Date();
    }
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
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Button clicked! Form submission triggered.');
    console.log('Initial form valid:', this.bookingForm.valid);

    if (this.bookingForm.valid) {
      console.log('Form passed initial validation, running teams validator...');

      // Validate that teams are different
      this.teamsValidator();

      console.log('Form valid after teams validator:', this.bookingForm.valid);

      if (this.bookingForm.valid) {
        console.log('Form is valid, proceeding with submission...');
        console.log('Raw form value:', this.bookingForm.value);

        const formValue = this.bookingForm.value;
        const matchData: Partial<Match> = {
          matchType: formValue.matchType,
          homeTeam: formValue.homeTeam,
          homeTeamCategory: formValue.homeTeamCategory,
          homeTeamAgeLevel: formValue.homeTeamAgeLevel,
          awayTeam: formValue.awayTeam,
          awayTeamCategory: formValue.awayTeamCategory,
          awayTeamAgeLevel: formValue.awayTeamAgeLevel,
          date: this.combineDateTime(),
          venue: formValue.venue,
          competition: formValue.competition,
          status: formValue.status,
        };

        console.log('Processed match data:', matchData);

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

        console.log('Closing dialog with match data:', matchData);
        this.dialogRef.close(matchData);
      } else {
        console.log('Form validation failed after teams validator');
        // Show which fields are now invalid
        Object.keys(this.bookingForm.controls).forEach((key) => {
          const control = this.bookingForm.get(key);
          if (control && control.invalid) {
            console.log(`${key} is invalid:`, control.errors);
          }
        });
      }
    } else {
      console.log('Form is invalid, marking all fields as touched');
      // Show which fields are invalid
      Object.keys(this.bookingForm.controls).forEach((key) => {
        const control = this.bookingForm.get(key);
        if (control && control.invalid) {
          console.log(`${key} is invalid:`, control.errors);
        }
      });

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
   * Check if the submit button should be enabled
   */
  isSubmitButtonEnabled(): boolean {
    // For edit mode, enable if form is valid (ignore dirty state)
    if (this.data?.isEdit) {
      return this.bookingForm.valid;
    }
    // For new matches, enable if form is valid
    return this.bookingForm.valid;
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
