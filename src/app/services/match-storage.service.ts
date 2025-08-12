import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Match {
  id: string;
  _id?: string; // MongoDB document ID
  matchType?: string; // 'boys', 'girls', 'mixed'
  homeTeam: string;
  homeTeamCategory?: string; // e.g., 'minis', 'youths-boys', 'girls', 'seniors', 'womens-tag'
  homeTeamAgeLevel?: string; // e.g., 'U12', 'U16', 'Adults'
  awayTeam: string;
  awayTeamAgeLevel?: string; // Same age level options as home team category
  date: Date;
  venue: string; // Keep as string for backward compatibility, but can also store VenueLocation
  venueDetails?: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    placeId?: string;
    formattedAddress?: string;
  };
  competition?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
  createdAt?: Date; // MongoDB created timestamp
  updatedAt?: Date; // MongoDB updated timestamp
  __v?: number; // MongoDB version key
}

@Injectable({
  providedIn: 'root',
})
export class MatchStorageService {
  private readonly STORAGE_KEY = 'rugby-matches';
  private matchesSubject = new BehaviorSubject<Match[]>([]);
  public matches$ = this.matchesSubject.asObservable();

  constructor() {
    this.loadMatches();
  }

  /**
   * Get all matches
   */
  getMatches(): Match[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const matches = JSON.parse(stored);
        // Convert date strings back to Date objects
        return matches.map((match: any) => ({
          ...match,
          date: new Date(match.date),
        }));
      }
      return this.getDefaultMatches();
    } catch (error) {
      console.error('Error loading matches from localStorage:', error);
      return this.getDefaultMatches();
    }
  }

  /**
   * Get all matches (alias for backward compatibility)
   */
  getAllMatches(): Match[] {
    return this.getMatches();
  }

  /**
   * Save a new match
   */
  saveMatch(matchData: Omit<Match, 'id'>): string {
    const matches = this.getMatches();
    const newMatch: Match = {
      ...matchData,
      id: this.generateId(),
    };

    matches.push(newMatch);
    this.setMatches(matches);
    return newMatch.id;
  }

  /**
   * Update an existing match
   */
  updateMatch(id: string, matchData: Partial<Match>): boolean {
    const matches = this.getMatches();
    const matchIndex = matches.findIndex((m) => m.id === id);

    if (matchIndex === -1) {
      return false;
    }

    matches[matchIndex] = { ...matches[matchIndex], ...matchData };
    this.setMatches(matches);
    return true;
  }

  /**
   * Delete a match
   */
  deleteMatch(id: string): boolean {
    const matches = this.getMatches();
    const matchIndex = matches.findIndex((m) => m.id === id);

    if (matchIndex === -1) {
      return false;
    }

    matches.splice(matchIndex, 1);
    this.setMatches(matches);
    return true;
  }

  /**
   * Get a specific match by ID
   */
  getMatchById(id: string): Match | null {
    const matches = this.getMatches();
    return matches.find((m) => m.id === id) || null;
  }

  /**
   * Get upcoming matches (not cancelled or completed)
   */
  getUpcomingMatches(): Match[] {
    const matches = this.getMatches();
    const now = new Date();

    return matches
      .filter((match) => match.status === 'scheduled' && match.date >= now)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Get completed matches
   */
  getCompletedMatches(): Match[] {
    const matches = this.getMatches();

    return matches
      .filter((match) => match.status === 'completed')
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Get all matches sorted by date
   */
  getAllMatchesSorted(): Match[] {
    const matches = this.getMatches();
    return matches.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Clear all matches
   */
  clearAllMatches(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.matchesSubject.next([]);
  }

  /**
   * Replace all matches with a new list (e.g., after syncing from backend)
   */
  setAllMatches(matches: Match[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(matches));
      this.matchesSubject.next(matches);
    } catch (error) {
      console.error('Error setting matches:', error);
    }
  }

  /**
   * Get match statistics
   */
  getMatchStatistics() {
    const matches = this.getMatches();
    const completedMatches = matches.filter((m) => m.status === 'completed');
    const upcomingMatches = matches.filter((m) => m.status === 'scheduled');
    const cancelledMatches = matches.filter((m) => m.status === 'cancelled');

    return {
      totalMatches: matches.length,
      completedMatches: completedMatches.length,
      upcomingMatches: upcomingMatches.length,
      cancelledMatches: cancelledMatches.length,
      nextMatch: upcomingMatches.length > 0 ? upcomingMatches[0] : null,
      lastMatch: completedMatches.length > 0 ? completedMatches[0] : null,
    };
  }

  private setMatches(matches: Match[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(matches));
      this.matchesSubject.next(matches);
    } catch (error) {
      console.error('Error saving matches to localStorage:', error);
    }
  }

  private loadMatches(): void {
    const matches = this.getMatches();
    this.matchesSubject.next(matches);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get default matches if none exist
   */
  private getDefaultMatches(): Match[] {
    const defaultMatches: Match[] = [
      {
        id: '1',
        homeTeam: 'Lions RFC',
        awayTeam: 'Eagles United',
        date: new Date(2024, 11, 15, 15, 0), // December 15, 2024, 3:00 PM (past match)
        venue: 'City Stadium',
        venueDetails: {
          name: 'City Stadium',
          address: '123 Stadium Drive, Sports City',
          coordinates: { lat: -33.8688, lng: 151.2093 },
          formattedAddress: '123 Stadium Drive, Sports City, NSW 2000',
        },
        competition: 'League Championship',
        status: 'completed',
        homeScore: 28,
        awayScore: 21,
      },
      {
        id: '2',
        homeTeam: 'Tigers FC',
        awayTeam: 'Sharks RFC',
        date: new Date(2024, 11, 22, 14, 30), // December 22, 2024, 2:30 PM (past match)
        venue: 'Home Ground',
        venueDetails: {
          name: 'Home Ground',
          address: '456 Rugby Lane, Home Town',
          coordinates: { lat: -33.865, lng: 151.2094 },
          formattedAddress: '456 Rugby Lane, Home Town, NSW 2001',
        },
        competition: 'Cup Quarter-Final',
        status: 'completed',
        homeScore: 35,
        awayScore: 14,
      },
      {
        id: '3',
        homeTeam: 'Wolves United',
        awayTeam: 'Bears RFC',
        date: new Date(2025, 0, 5, 16, 0), // January 5, 2025, 4:00 PM
        venue: 'Central Park',
        venueDetails: {
          name: 'Central Park Rugby Field',
          address: '789 Park Avenue, Central District',
          coordinates: { lat: -33.867, lng: 151.208 },
          formattedAddress: '789 Park Avenue, Central District, NSW 2002',
        },
        competition: 'Friendly Match',
        status: 'scheduled',
      },
      {
        id: '4',
        homeTeam: 'Panthers United',
        awayTeam: 'Warriors RFC',
        date: new Date(2024, 10, 30, 13, 0), // November 30, 2024, 1:00 PM (past match)
        venue: 'Memorial Stadium',
        venueDetails: {
          name: 'Memorial Stadium',
          address: '321 Memorial Way, Victory Heights',
          coordinates: { lat: -33.86, lng: 151.21 },
          formattedAddress: '321 Memorial Way, Victory Heights, NSW 2003',
        },
        competition: 'Derby Match',
        status: 'completed',
        homeScore: 21,
        awayScore: 21,
      },
      {
        id: '5',
        homeTeam: 'Dragons RFC',
        awayTeam: 'Phoenix United',
        date: new Date(2025, 1, 14, 15, 30), // February 14, 2025, 3:30 PM
        venue: 'Fortress Ground',
        venueDetails: {
          name: 'Fortress Ground',
          address: '555 Fortress Street, Stronghold',
          coordinates: { lat: -33.871, lng: 151.207 },
          formattedAddress: '555 Fortress Street, Stronghold, NSW 2004',
        },
        competition: "Valentine's Cup",
        status: 'scheduled',
      },
      {
        id: '6',
        homeTeam: 'Titans RFC',
        awayTeam: 'Giants United',
        date: new Date(2024, 11, 1, 14, 0), // December 1, 2024, 2:00 PM (past match)
        venue: 'Titan Arena',
        venueDetails: {
          name: 'Titan Arena',
          address: '888 Titan Boulevard, Giant Valley',
          coordinates: { lat: -33.875, lng: 151.205 },
          formattedAddress: '888 Titan Boulevard, Giant Valley, NSW 2005',
        },
        competition: 'Grand Final',
        status: 'completed',
        homeScore: 42,
        awayScore: 38,
      },
    ];

    // Only set defaults if no matches exist in storage
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.setMatches(defaultMatches);
    }

    return defaultMatches;
  }
}
