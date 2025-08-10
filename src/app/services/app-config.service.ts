import { Injectable } from '@angular/core';

type AnyRecord = Record<string, any>;

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly runtime: AnyRecord;

  constructor() {
    // Read window.__env if present (provided by assets/env.js at runtime)
    const win = window as any;
    this.runtime = (win && win.__env) || {};
  }

  // Generic getter with dot-path support
  get<T = any>(path: string, fallback?: T): T | undefined {
    const source: AnyRecord = this.runtime;
    const parts = path.split('.') as string[];
    let cur: any = source;
    for (const p of parts) {
      if (cur && Object.prototype.hasOwnProperty.call(cur, p)) {
        cur = cur[p];
      } else {
        cur = undefined;
        break;
      }
    }
    return (cur as T) ?? fallback;
  }

  get apiUrl(): string {
    return (this.get<string>('apiUrl') || '').toString();
  }

  get googleMapsApiKey(): string {
    return this.get<string>('googleMaps.apiKey') || '';
  }

  get googleMapId(): string | undefined {
    return this.get<string>('googleMaps.mapId') || undefined;
  }
}
