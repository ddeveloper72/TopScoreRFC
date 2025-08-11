(function (window) {
  // Runtime config injected at deploy time (GH Actions) or set manually for local dev.
  // Note: There is no compile-time fallback for Google Maps keys; set them here to enable search/map features.
  window.__env = window.__env || {};
  // Examples:
  // window.__env.apiUrl = 'https://your-backend.example.com/api';
  // window.__env.googleMaps = { apiKey: 'YOUR_KEY', mapId: '' };
})(this);
