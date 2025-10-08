#!/usr/bin/env node

/**
 * Communication Data Seeder
 * Runs the seed script from the backend directory
 * This script seeds the database with sample communication data (users, messages, polls)
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🌱 Starting Communication Data Seeding...\n');

// Change to backend directory and run the seed script
const backendPath = path.join(__dirname, 'backend');
const seedProcess = spawn('npm', ['run', 'seed'], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true
});

seedProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Communication data seeding completed successfully!');
    console.log('🎉 You can now test the communication features in your app.');
  } else {
    console.log(`\n❌ Seeding failed with exit code ${code}`);
    process.exit(code);
  }
});

seedProcess.on('error', (error) => {
  console.error('❌ Error running seed script:', error.message);
  process.exit(1);
});
