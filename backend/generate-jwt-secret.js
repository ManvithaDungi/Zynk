const crypto = require('crypto');

// Generate a secure random JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('Generated JWT Secret:');
console.log(jwtSecret);
console.log('\nLength:', jwtSecret.length, 'characters');
console.log('\nThis is a secure 64-byte (128 hex characters) random key suitable for JWT signing.');

// Also generate a base64 version if needed
const jwtSecretBase64 = crypto.randomBytes(64).toString('base64');
console.log('\nBase64 version:');
console.log(jwtSecretBase64);
