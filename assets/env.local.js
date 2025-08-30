(function (window) {
  // Local development overrides (DO NOT COMMIT). This file is gitignored.
  // Point dev frontend to Heroku API instead of localhost.
  window.__env = window.__env || {};
  window.__env.apiUrl = 'https://rugbyappbackend-4014b68ac4bb.herokuapp.com/api';
  // Set your local Google Maps browser key for dev:
  window.__env.googleMaps = { apiKey: 'AIzaSyC-Kp2v6t3NlEh7AvzdxFSj-JLRf-UMyGg', mapId: '' };
})(this);
