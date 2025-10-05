const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Zynk Database Seeding - Multiple Methods\n');

// List of seeding scripts to try in order
const seedingScripts = [
  { name: 'Direct MongoDB (Recommended)', file: 'seed-direct.js' },
  { name: 'Simple Mongoose', file: 'seed-simple.js' },
  { name: 'Full Mongoose', file: 'seed-all-data.js' }
];

// Function to run a seeding script
const runSeedingScript = (scriptName, scriptFile) => {
  return new Promise((resolve, reject) => {
    console.log(`\n🔄 Trying: ${scriptName}`);
    console.log(`📄 Script: ${scriptFile}`);
    console.log('─'.repeat(50));
    
    const startTime = Date.now();
    
    exec(`node ${scriptFile}`, (error, stdout, stderr) => {
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      if (error) {
        console.log(`❌ ${scriptName} failed after ${duration}s`);
        console.log(`Error: ${error.message}`);
        if (stderr) {
          console.log(`Stderr: ${stderr}`);
        }
        resolve({ success: false, error: error.message, duration });
      } else {
        console.log(`✅ ${scriptName} succeeded in ${duration}s`);
        console.log(stdout);
        resolve({ success: true, output: stdout, duration });
      }
    });
  });
};

// Main function to try all seeding methods
const tryAllSeedingMethods = async () => {
  console.log('🎯 Attempting to seed database with multiple methods...\n');
  
  for (let i = 0; i < seedingScripts.length; i++) {
    const script = seedingScripts[i];
    const result = await runSeedingScript(script.name, script.file);
    
    if (result.success) {
      console.log(`\n🎉 SUCCESS! Database seeded using: ${script.name}`);
      console.log(`⏱️  Time taken: ${result.duration}s`);
      console.log('\n📋 Next Steps:');
      console.log('1. Start your backend server: cd backend && npm start');
      console.log('2. Start your frontend: cd frontend && npm start');
      console.log('3. Login with: john@example.com / password123');
      console.log('\n✨ Your database is ready for testing!');
      return;
    } else {
      console.log(`\n⚠️  ${script.name} failed. Trying next method...`);
      if (i < seedingScripts.length - 1) {
        console.log('⏳ Waiting 2 seconds before trying next method...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  // If all methods failed
  console.log('\n❌ ALL SEEDING METHODS FAILED');
  console.log('\n🔧 Troubleshooting Steps:');
  console.log('1. Make sure MongoDB is running:');
  console.log('   Windows: net start MongoDB');
  console.log('   macOS/Linux: sudo systemctl start mongod');
  console.log('2. Check MongoDB connection:');
  console.log('   mongosh mongodb://127.0.0.1:27017/zynk');
  console.log('3. Verify your .env file has correct MONGODB_URI');
  console.log('4. Try restarting MongoDB service');
  console.log('\n📞 If issues persist, check the MongoDB logs for more details.');
};

// Check if MongoDB is accessible first
const checkMongoDB = () => {
  return new Promise((resolve) => {
    console.log('🔍 Checking MongoDB connection...');
    exec('mongosh --eval "db.runCommand({ping: 1})" --quiet', (error, stdout, stderr) => {
      if (error) {
        console.log('⚠️  MongoDB connection check failed');
        console.log('   This might be normal if MongoDB is not in PATH');
        console.log('   Proceeding with seeding attempts...\n');
      } else {
        console.log('✅ MongoDB appears to be accessible\n');
      }
      resolve();
    });
  });
};

// Main execution
const main = async () => {
  try {
    await checkMongoDB();
    await tryAllSeedingMethods();
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
};

main();
