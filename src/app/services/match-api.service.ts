import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfigService } from './app-config.service';
import { Match, MatchEvent } from './match-storage.service';

@Injectable({ providedIn: 'root' })
export class MatchApiService {
  private apiUrl: string;
  private apiKey = 'ClaneRFC2025SecureKey!'; // TODO: Move to environment config
  private httpOptions: { headers: HttpHeaders };

  constructor(private http: HttpClient, private cfg: AppConfigService) {
    const base = this.cfg.apiUrl || 'http://localhost:3000/api';
    this.apiUrl = base.replace(/\/$/, '');

    // Set up headers with API key authentication
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'X-API-Key': this.apiKey,
      }),
    };
  }

  getAllMatches(): Observable<Match[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/matches`, this.httpOptions)
      .pipe(
        map((items) =>
          (items || []).map((m) => ({
            ...m,
            id: m._id || m.id,
            date: m.date ? new Date(m.date) : new Date(),
          }))
        )
      );
  }

  createMatch(match: Partial<Match>): Observable<any> {
    return this.http.post(`${this.apiUrl}/matches`, match, this.httpOptions);
  }

  updateMatch(id: string, match: Partial<Match>): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/matches/${id}`,
      match,
      this.httpOptions
    );
  }

  deleteMatch(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/matches/${id}`, this.httpOptions);
  }

  // ===============================================
  // MATCH EVENTS CRUD OPERATIONS
  // ===============================================

  /**
   * Add a new event to a match
   */
  addMatchEvent(matchId: string, event: Partial<MatchEvent>): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/matches/${matchId}/events`,
      event,
      this.httpOptions
    );
  }

  /**
   * Get all events for a specific match
   */
  getMatchEvents(matchId: string): Observable<MatchEvent[]> {
    return this.http
      .get<{ events: MatchEvent[] }>(
        `${this.apiUrl}/matches/${matchId}/events`,
        this.httpOptions
      )
      .pipe(map((response) => response.events || []));
  }

  /**
   * Update a specific event in a match
   */
  updateMatchEvent(
    matchId: string,
    eventId: string,
    event: Partial<MatchEvent>
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/matches/${matchId}/events/${eventId}`,
      event,
      this.httpOptions
    );
  }

  /**
   * Delete a specific event from a match
   */
  deleteMatchEvent(matchId: string, eventId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/matches/${matchId}/events/${eventId}`,
      this.httpOptions
    );
  }

  /**
   * Get a match with all its events (convenience method)
   */
  getMatchWithEvents(matchId: string): Observable<Match> {
    return this.http
      .get<any>(`${this.apiUrl}/matches/${matchId}`, this.httpOptions)
      .pipe(
        map((match) => ({
          ...match,
          id: match._id || match.id,
          date: match.date ? new Date(match.date) : new Date(),
          events: match.events || [],
        }))
      );
  }
}
