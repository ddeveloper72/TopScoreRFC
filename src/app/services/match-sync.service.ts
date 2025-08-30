import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { MatchApiService } from './match-api.service';
import { MatchStorageService } from './match-storage.service';
import { Match } from './match-storage.service';

export interface SyncResult {
  success: boolean;
  syncedMatches: number;
  failedMatches: number;
  errors: string[];
  details: SyncDetail[];
}

export interface SyncDetail {
  localId: string;
  homeTeam: string;
  awayTeam: string;
  status: 'synced' | 'failed' | 'skipped';
  mongoId?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MatchSyncService {
  constructor(
    private matchApi: MatchApiService,
    private matchStorage: MatchStorageService
  ) {}

  /**
   * Check if a match ID is a local (browser-generated) ID
   * Local IDs are typically short alphanumeric strings like "meydwxtx2fvkaswl8kv"
   * MongoDB IDs are 24-character hex strings like "64f1a2b3c4d5e6f7g8h9i0j1"
   */
  private isLocalId(id: string): boolean {
    // MongoDB ObjectIds are exactly 24 characters and hex
    const mongoIdPattern = /^[0-9a-fA-F]{24}$/;
    return !mongoIdPattern.test(id) && !id.startsWith('6'); // Most MongoDB IDs start with 6
  }

  /**
   * Get all local matches that haven't been synced to the database
   */
  getUnsyncedMatches(): Match[] {
    const allMatches = this.matchStorage.getAllMatches();

    return allMatches.filter((match) => {
      // If match has no _id (MongoDB ID) or has a local-style ID, it needs syncing
      return !match._id || this.isLocalId(match.id);
    });
  }

  /**
   * Sync a single local match to the database
   */
  syncSingleMatch(localMatch: Match): Observable<SyncDetail> {
    return this.matchApi.syncLocalMatch(localMatch).pipe(
      map((response) => {
        // Update local storage with MongoDB ID
        const updatedMatch = {
          ...localMatch,
          _id: response._id,
        };
        this.matchStorage.updateMatch(localMatch.id, updatedMatch);

        return {
          localId: localMatch.id,
          homeTeam: localMatch.homeTeam,
          awayTeam: localMatch.awayTeam,
          status: 'synced' as const,
          mongoId: response._id,
        };
      }),
      catchError((error) => {
        return of({
          localId: localMatch.id,
          homeTeam: localMatch.homeTeam,
          awayTeam: localMatch.awayTeam,
          status: 'failed' as const,
          error: error.message || 'Unknown error',
        });
      })
    );
  }

  /**
   * Sync all unsynced matches to the database
   */
  syncAllUnsyncedMatches(): Observable<SyncResult> {
    const unsyncedMatches = this.getUnsyncedMatches();

    if (unsyncedMatches.length === 0) {
      return of({
        success: true,
        syncedMatches: 0,
        failedMatches: 0,
        errors: [],
        details: [],
      });
    }

    const syncOperations = unsyncedMatches.map((match) =>
      this.syncSingleMatch(match)
    );

    return forkJoin(syncOperations).pipe(
      map((results) => {
        const syncedMatches = results.filter(
          (r) => r.status === 'synced'
        ).length;
        const failedMatches = results.filter(
          (r) => r.status === 'failed'
        ).length;
        const errors = results
          .filter((r) => r.status === 'failed' && r.error)
          .map((r) => r.error!);

        return {
          success: failedMatches === 0,
          syncedMatches,
          failedMatches,
          errors,
          details: results,
        };
      }),
      catchError((error) => {
        return of({
          success: false,
          syncedMatches: 0,
          failedMatches: unsyncedMatches.length,
          errors: [error.message || 'Sync operation failed'],
          details: [],
        });
      })
    );
  }

  /**
   * Check if there are any unsynced matches
   */
  hasUnsyncedMatches(): boolean {
    return this.getUnsyncedMatches().length > 0;
  }

  /**
   * Get count of unsynced matches
   */
  getUnsyncedCount(): number {
    return this.getUnsyncedMatches().length;
  }
}
