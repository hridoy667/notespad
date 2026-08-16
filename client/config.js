window.APP_CONFIG = {
  // Automatically points to local server in dev, or your production URL when hosted
  API_BASE: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://your-production-backend.onrender.com/api'
};