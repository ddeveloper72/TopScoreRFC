import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AppConfigService } from './app-config.service';
import { Match } from './match-storage.service';

@Injectable({ providedIn: 'root' })
export class MatchApiService {
  private apiUrl: string;
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient, private cfg: AppConfigService) {
    this.apiUrl =
      this.cfg.apiUrl || environment.apiUrl || 'http://localhost:3000/api';
  }

  getAllMatches(): Observable<Match[]> {
    return this.http.get<any[]>(`${this.apiUrl}/matches`).pipe(
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
    return this.http.delete(`${this.apiUrl}/matches/${id}`);
  }
}
