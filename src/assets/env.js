(function (window) {
  // Runtime config injected at deploy time (GH Actions) or set manually for local dev.
  // Note: There is no compile-time fallback for Google Maps keys; set them here to enable search/map features.
  window.__env = window.__env || {};

  // Local development configuration with proxy
  // Frontend runs on http://localhost:4200 with proxy to backend
  // All /api/* requests will be proxied to http://localhost:3000
  window.__env.apiUrl = '/api';

  // Google Maps configuration (set your keys here)
  // window.__env.googleMaps = {
  //   apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
  //   mapId: 'YOUR_MAP_ID'
  // };

  console.log('Environment configured with proxy:', window.__env);
})(this);
