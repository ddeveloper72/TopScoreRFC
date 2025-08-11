import { Injectable } from '@angular/core';
import { AppConfigService } from './app-config.service';

export interface VenueLocation {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  formattedAddress?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GoogleMapsService {
  private googleGlobal: any | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private geocoder: google.maps.Geocoder | null = null;
  // Small in-memory caches to reduce API calls
  private predictionCache = new Map<string, VenueLocation[]>();
  private detailsCache = new Map<string, VenueLocation>();

  constructor(private cfg: AppConfigService) {}

  async loadGoogleMaps(): Promise<any> {
    if (this.googleGlobal) {
      return this.googleGlobal;
    }

    // Load Google Maps JS API via script tag if not already present
    const existing = document.querySelector(
      'script[data-google-maps-loader="true"]'
    ) as HTMLScriptElement | null;

    if (!existing) {
      // Guard: if no API key configured, surface a clear warning and fail fast
      if (!this.cfg.googleMapsApiKey) {
        console.warn('[GoogleMapsService] Missing GOOGLE_MAPS_API_KEY. Set it as a GitHub Actions secret so env.js can populate at runtime. Search and map features will be disabled.');
        throw new Error('Missing Google Maps API key');
      }
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.defer = true;
        script.setAttribute('data-google-maps-loader', 'true');
        const libs = ['places', 'geometry', 'marker'];
        const params = new URLSearchParams({
          key: this.cfg.googleMapsApiKey || '',
          libraries: libs.join(','),
          v: 'weekly',
        });
        script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error('Failed to load Google Maps JS API'));
        document.head.appendChild(script);
      });
    }

    this.googleGlobal = (window as any).google;
    if (!this.googleGlobal?.maps) {
      throw new Error('Google Maps failed to initialize');
    }
    return this.googleGlobal;
  }

  async initializePlacesService(map: google.maps.Map): Promise<any> {
    await this.loadGoogleMaps();
    this.placesService = new google.maps.places.PlacesService(map);
    return this.placesService;
  }

  async initializeGeocoder(): Promise<any> {
    await this.loadGoogleMaps();
    if (!this.geocoder) {
      this.geocoder = new google.maps.Geocoder();
    }
    return this.geocoder;
  }

  // Search for places with Irish bias and Eircode support
  async searchPlaces(query: string): Promise<VenueLocation[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const google = await this.loadGoogleMaps();
        const normalized = (query || '').trim();

        // Serve from cache when possible
        const cacheKey = normalized.toLowerCase();
        const cached = this.predictionCache.get(cacheKey);
        if (cached) {
          resolve(cached);
          return;
        }

        // If this looks like an Irish Eircode, geocode it first for a precise match
        if (this.isEircode(normalized)) {
          try {
            const geo = await this.geocodeLocation(normalized);
            if (geo) {
              resolve([geo]);
              return;
            }
          } catch {
            // fall through to Places text search
          }
        }

        // Prefer the modern Autocomplete + Place flow when available
        if ((google as any).maps?.places?.AutocompleteService) {
          try {
            const svc = new (google as any).maps.places.AutocompleteService();
            const predictions: any[] = await new Promise((res) =>
              svc.getPlacePredictions(
                {
                  input: normalized,
                  componentRestrictions: { country: 'ie' },
                },
                (p: any[]) => res(p || [])
              )
            );

            // Fetch details for each prediction to get coordinates
            const venues = await Promise.all(
              predictions.slice(0, 8).map(async (p) => {
                const fromCache = this.detailsCache.get(p.place_id);
                const details =
                  fromCache || (await this.getPlaceDetailsFlexible(p.place_id));
                if (details) return details;
                // Fallback minimal if details fail
                return {
                  name: p.description || 'Unknown Venue',
                  address: p.description || '',
                  coordinates: { lat: 0, lng: 0 },
                  placeId: p.place_id,
                  formattedAddress: p.description || '',
                } as VenueLocation;
              })
            );
            const filtered = venues.filter(Boolean) as VenueLocation[];
            this.predictionCache.set(cacheKey, filtered);
            resolve(filtered);
            return;
          } catch (e) {
            // fall back to legacy TextSearch below
          }
        }

        // Legacy PlacesService TextSearch fallback (attach temp div to DOM to satisfy observers)
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.width = '1px';
        tempDiv.style.height = '1px';
        tempDiv.style.overflow = 'hidden';
        tempDiv.style.top = '-10000px';
        document.body.appendChild(tempDiv);
        try {
          const tempMap = new google.maps.Map(tempDiv);
          const placesService = new (google as any).maps.places.PlacesService(
            tempMap
          );
          const request: any = { query: query, region: 'IE' };
          placesService.textSearch(
            request,
            (results: any[] | null, status: any) => {
              document.body.removeChild(tempDiv);
              if (
                status ===
                  (google as any).maps?.places?.PlacesServiceStatus?.OK &&
                results
              ) {
                const venues: VenueLocation[] = results.map((place: any) => ({
                  name: place.name || 'Unknown Venue',
                  address: place.formatted_address || '',
                  coordinates: {
                    lat: place.geometry?.location?.lat() || 0,
                    lng: place.geometry?.location?.lng() || 0,
                  },
                  placeId: place.place_id,
                  formattedAddress: place.formatted_address,
                }));
                resolve(venues);
              } else {
                // Fallback to geocoding
                this.geocodeLocation(query)
                  .then((location) => resolve(location ? [location] : []))
                  .catch(() => resolve([]));
              }
            }
          );
        } catch (e) {
          try {
            document.body.contains(tempDiv) &&
              document.body.removeChild(tempDiv);
          } catch {}
          // Last resort: geocode the free text
          this.geocodeLocation(query)
            .then((location) => resolve(location ? [location] : []))
            .catch(() => resolve([]));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  // Try modern Place details first, then fall back to legacy PlacesService.getDetails
  private async getPlaceDetailsFlexible(
    placeId: string
  ): Promise<VenueLocation | null> {
    const google = await this.loadGoogleMaps();
    try {
      if ((google as any).maps?.places?.Place) {
        const PlaceCtor = (google as any).maps.places.Place;
        const place = new PlaceCtor({ id: placeId });
        const data = await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location'],
        });
        const name =
          (data?.displayName && (data.displayName.text || data.displayName)) ||
          'Unknown Venue';
        const address = data?.formattedAddress || '';
        const loc = data?.location;
        const lat = typeof loc?.lat === 'function' ? loc.lat() : loc?.lat;
        const lng = typeof loc?.lng === 'function' ? loc.lng() : loc?.lng;
        if (lat != null && lng != null) {
          const result: VenueLocation = {
            name,
            address,
            coordinates: { lat, lng },
            placeId,
            formattedAddress: address,
          };
          this.detailsCache.set(placeId, result);
          return result;
        }
      }
    } catch {
      // ignore and try legacy path
    }
    const legacy = await this.getPlaceDetails(placeId);
    if (legacy) this.detailsCache.set(placeId, legacy);
    return legacy;
  }

  // Geocode Eircodes and addresses
  async geocodeLocation(address: string): Promise<VenueLocation | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const geocoder = await this.initializeGeocoder();

        const request: any = {
          address: address,
          region: 'IE', // Bias to Ireland for Eircode support
          componentRestrictions: {
            country: 'IE', // Restrict to Ireland only
          },
        };

        geocoder.geocode(request, (results: any[] | null, status: any) => {
          if ((status === 'OK' || status === 200) && results && results[0]) {
            const result = results[0];
            const location: VenueLocation = {
              name: this.extractVenueName(result.formatted_address || address),
              address: result.formatted_address || address,
              coordinates: {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng(),
              },
              formattedAddress: result.formatted_address,
            };
            resolve(location);
          } else {
            resolve(null);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Get place details by place ID
  async getPlaceDetails(placeId: string): Promise<VenueLocation | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const google = await this.loadGoogleMaps();
        // Attach a hidden container to the DOM to avoid IntersectionObserver errors
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.width = '1px';
        tempDiv.style.height = '1px';
        tempDiv.style.overflow = 'hidden';
        tempDiv.style.top = '-10000px';
        document.body.appendChild(tempDiv);
        const tempMap = new google.maps.Map(tempDiv);
        const placesService = new (google as any).maps.places.PlacesService(
          tempMap
        );

        const request: any = {
          placeId: placeId,
          fields: ['name', 'formatted_address', 'geometry'],
        };

        placesService.getDetails(request, (place: any | null, status: any) => {
          try {
            document.body.contains(tempDiv) &&
              document.body.removeChild(tempDiv);
          } catch {}
          if (
            status === (google as any).maps?.places?.PlacesServiceStatus?.OK &&
            place
          ) {
            const location: VenueLocation = {
              name: place.name || 'Unknown Venue',
              address: place.formatted_address || '',
              coordinates: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0,
              },
              placeId: placeId,
              formattedAddress: place.formatted_address,
            };
            resolve(location);
          } else {
            resolve(null);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Create a map instance
  async createMap(
    mapElement: HTMLElement,
    center?: { lat: number; lng: number }
  ): Promise<any> {
    const google = await this.loadGoogleMaps();

    const defaultCenter = center || { lat: 53.3498, lng: -6.2603 }; // Dublin, Ireland

    const options: any = {
      zoom: 10,
      center: defaultCenter,
      mapTypeId: 'roadmap',
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    };

    // If a Map ID is configured, include it to enable Advanced Markers and vector maps
    const mapId = this.cfg.googleMapId;
    if (mapId) {
      options.mapId = mapId;
    }

    return new google.maps.Map(mapElement, options);
  }

  // Add a marker to the map
  async addMarker(map: google.maps.Map, location: VenueLocation): Promise<any> {
    const google = await this.loadGoogleMaps();

    // Prefer AdvancedMarkerElement if available and a Map ID is configured
    const advanced = (google as any).maps?.marker?.AdvancedMarkerElement;
    const mapId = this.cfg.googleMapId;
    if (advanced && mapId) {
      const img = document.createElement('img');
      img.src = 'assets/images/irish-rugby-ball.png';
      img.alt = location.name;
      img.style.width = '32px';
      img.style.height = '24px';
      return new advanced({
        map,
        position: location.coordinates,
        title: location.name,
        content: img,
      });
    }

    // Fallback to classic Marker
    return new google.maps.Marker({
      position: location.coordinates,
      map: map,
      title: location.name,
      icon: {
        url: 'assets/images/irish-rugby-ball.png',
        scaledSize: new google.maps.Size(32, 24),
      },
    });
  }

  // Helper method to extract venue name from address
  private extractVenueName(address: string): string {
    const parts = address.split(',');
    return parts[0].trim();
  }

  // Check if a string looks like an Eircode
  isEircode(text: string): boolean {
    // Irish Eircode format: Letter-Number-Number Letter-Number-Letter-Letter-Letter
    const eircodePattern = /^[A-Z]\d{2}\s?[A-Z0-9]{4}$/i;
    return eircodePattern.test(text.replace(/\s/g, ''));
  }
}
