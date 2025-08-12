import { Injectable } from '@angular/core';
import { Match } from './match-storage.service';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

@Injectable({
  providedIn: 'root',
})
export class MatchValidationService {
  validateMatch(match: Partial<Match>): ValidationResult {
    const errors: string[] = [];

    // Required fields validation
    if (!match.homeTeam || match.homeTeam.trim() === '') {
      errors.push('Home team is required');
    }

    if (!match.awayTeam || match.awayTeam.trim() === '') {
      errors.push('Away team is required');
    }

    if (!match.date) {
      errors.push('Match date is required');
    } else {
      // Validate date is not in the past (except for completed matches)
      const matchDate = new Date(match.date);
      const now = new Date();
      if (matchDate < now && match.status === 'scheduled') {
        errors.push('Scheduled matches cannot be in the past');
      }
    }

    if (!match.venue || match.venue.trim() === '') {
      errors.push('Venue is required');
    }

    if (!match.status) {
      errors.push('Match status is required');
    } else if (
      !['scheduled', 'completed', 'cancelled'].includes(match.status)
    ) {
      errors.push('Match status must be scheduled, completed, or cancelled');
    }

    // Validate match type
    if (
      match.matchType &&
      !['boys', 'girls', 'mixed'].includes(match.matchType)
    ) {
      errors.push('Match type must be boys, girls, or mixed');
    }

    // Validate home team category
    if (
      match.homeTeamCategory &&
      !['minis', 'youths-boys', 'girls', 'seniors', 'womens-tag'].includes(
        match.homeTeamCategory
      )
    ) {
      errors.push('Invalid home team category');
    }

    // Validate age levels are consistent
    if (match.homeTeamAgeLevel && match.awayTeamAgeLevel) {
      // For fair competition, age levels should match or be within reasonable range
      if (
        !this.areAgeLevelsCompatible(
          match.homeTeamAgeLevel,
          match.awayTeamAgeLevel
        )
      ) {
        errors.push('Age levels should be compatible for fair competition');
      }
    }

    // Validate scores
    if (match.status === 'completed') {
      if (match.homeScore === undefined || match.awayScore === undefined) {
        errors.push('Completed matches must have scores');
      }
      if (
        (match.homeScore !== undefined && match.homeScore < 0) ||
        (match.awayScore !== undefined && match.awayScore < 0)
      ) {
        errors.push('Scores cannot be negative');
      }
    }

    // Validate venue details if provided
    if (match.venueDetails) {
      if (!match.venueDetails.name || match.venueDetails.name.trim() === '') {
        errors.push('Venue name is required when venue details are provided');
      }
      if (match.venueDetails.coordinates) {
        const { lat, lng } = match.venueDetails.coordinates;
        if (lat < -90 || lat > 90) {
          errors.push('Invalid latitude coordinates');
        }
        if (lng < -180 || lng > 180) {
          errors.push('Invalid longitude coordinates');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private areAgeLevelsCompatible(homeAge: string, awayAge: string): boolean {
    // Define age level hierarchy for compatibility checking
    const ageLevels = [
      'U7',
      'U8',
      'U9',
      'U10',
      'U11',
      'U12', // Minis
      'U13',
      'U14',
      'U15',
      'U16',
      'U17',
      'U18', // Youths
      'Adults',
      'Seniors', // Adults
    ];

    const homeIndex = ageLevels.indexOf(homeAge);
    const awayIndex = ageLevels.indexOf(awayAge);

    // If either age level is not found, allow it (custom ages)
    if (homeIndex === -1 || awayIndex === -1) {
      return true;
    }

    // Allow matches within 1 age level difference for youth teams
    // Adults can play against any adult category
    if (
      homeAge === 'Adults' ||
      homeAge === 'Seniors' ||
      awayAge === 'Adults' ||
      awayAge === 'Seniors'
    ) {
      return (
        awayAge === 'Adults' || awayAge === 'Seniors' || homeAge === awayAge
      );
    }

    // For youth levels, allow 1 level difference
    return Math.abs(homeIndex - awayIndex) <= 1;
  }

  // Validate before saving
  validateBeforeSave(match: Match): ValidationResult {
    const result = this.validateMatch(match);

    // Additional save-specific validations
    if (!match.id || match.id.trim() === '') {
      result.errors.push('Match ID is required for saving');
      result.isValid = false;
    }

    return result;
  }
}
