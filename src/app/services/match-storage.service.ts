import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: Date;
  venue: string;
  competition?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
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
        date: new Date(2025, 7, 15, 15, 0), // August 15, 2025, 3:00 PM
        venue: 'City Stadium',
        competition: 'League Championship',
        status: 'scheduled',
      },
      {
        id: '2',
        homeTeam: 'Tigers FC',
        awayTeam: 'Sharks RFC',
        date: new Date(2025, 7, 22, 14, 30), // August 22, 2025, 2:30 PM
        venue: 'Home Ground',
        competition: 'Cup Quarter-Final',
        status: 'scheduled',
      },
      {
        id: '3',
        homeTeam: 'Wolves United',
        awayTeam: 'Bears RFC',
        date: new Date(2025, 8, 5, 16, 0), // September 5, 2025, 4:00 PM
        venue: 'Central Park',
        competition: 'Friendly Match',
        status: 'scheduled',
      },
    ];

    // Only set defaults if no matches exist in storage
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.setMatches(defaultMatches);
    }

    return defaultMatches;
  }
}
