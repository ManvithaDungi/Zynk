const helmet = require('helmet');

// Consolidated security headers configuration
function securityHeaders() {
  return helmet({
    contentSecurityPolicy: false, // keep simple for dev SPA
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });
}

module.exports = { securityHeaders };


