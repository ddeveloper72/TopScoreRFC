import { Injectable } from '@angular/core';
import { environment as ngEnvironment } from '../../environments/environment';

type AnyRecord = Record<string, any>;

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly runtime: AnyRecord;
  private readonly env = ngEnvironment as AnyRecord;

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
    // Prefer runtime (env.js) first, then fall back to Angular environment for local dev
    const runtimeVal = (this.get<string>('apiUrl') || '').toString().trim();
    const raw =
      runtimeVal || ((this.env && this.env['apiUrl']) || '').toString().trim();
    if (!raw) return '';
    let url = raw.replace(/\s+$/, '');
    try {
      const u = new URL(url);
      if (!u.pathname || u.pathname === '/' || u.pathname === '') {
        u.pathname = '/api';
      }
      url = u.toString();
    } catch {
      // Not an absolute URL; just ensure it includes '/api'
      if (!/\/api(\/|$)/i.test(url)) {
        url = url.replace(/\/+$/, '') + '/api';
      }
    }
    // Trim any trailing slash for stable concatenation
    return url.replace(/\/+$/, '');
  }

  get googleMapsApiKey(): string {
    return (
      this.get<string>('googleMaps.apiKey') ||
      ((this.env &&
        this.env['googleMaps'] &&
        this.env['googleMaps']['apiKey']) as string) ||
      ''
    );
  }

  get googleMapId(): string | undefined {
    const rt = this.get<string>('googleMaps.mapId');
    if (rt) return rt;
    if (this.env && this.env['googleMaps']) {
      return this.env['googleMaps']['mapId'] as string;
    }
    return undefined;
  }
}
