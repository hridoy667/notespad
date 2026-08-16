console.log("config.js loaded successfully!");

window.APP_CONFIG = {
  API_BASE: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://notespad-production.up.railway.app/api'
};