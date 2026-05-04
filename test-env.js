const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];

console.log('Testing backend environment loading:');
console.log('====================================');
console.log('DB_HOST:', process.env.DB_HOST || 'NOT LOADED');
console.log('DB_PORT:', process.env.DB_PORT || '3306');
console.log('DB_USER:', process.env.DB_USER ? 'Loaded' : 'NOT LOADED');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'Loaded (hidden)' : 'Loaded (empty)');
console.log('DB_NAME:', process.env.DB_NAME || 'NOT LOADED');
console.log('DB_SSL:', process.env.DB_SSL || 'false');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded (hidden)' : 'NOT LOADED');
console.log('PORT:', process.env.PORT || '5001');
console.log('====================================');

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.log(`\nERROR: Missing required env vars: ${missing.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log('\nEnvironment file loaded successfully.');
}
