// Minimal ambient declarations to satisfy TypeScript when google types aren't installed
// This is a lightweight shim and does not replace official @types/google.maps

declare global {
  namespace google {
    namespace maps {
      class Map {
        constructor(el: HTMLElement, options?: any);
        setCenter(latLng: { lat: number; lng: number }): void;
        setZoom(zoom: number): void;
      }
      class Marker {
        constructor(opts: any);
        addListener(event: string, handler: (...args: any[]) => void): void;
      }
      class Size {
        constructor(width: number, height: number);
      }
      class InfoWindow {
        constructor(opts?: any);
        open(map?: Map, marker?: Marker): void;
      }
      class Geocoder {
        geocode(
          request: any,
          callback: (results: any[] | null, status: any) => void
        ): void;
      }
      namespace places {
        class PlacesService {
          constructor(map: Map | HTMLElement);
          textSearch(
            request: any,
            callback: (results: any[] | null, status: any) => void
          ): void;
          getDetails(
            request: any,
            callback: (place: any | null, status: any) => void
          ): void;
        }
      }
    }
  }
}

export {};
