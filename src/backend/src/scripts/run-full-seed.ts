/**
 * Script to run full data seeding
 * This will create comprehensive test data for both lessons and practices
 */

import { seedFullData } from './seed-full-data';

async function runFullSeed() {
  console.log('🚀 Starting full data seeding process...\n');

  try {
    await seedFullData();
    console.log('\n🎊 Full data seeding completed successfully!');
    console.log('\n📋 What was created:');
    console.log('   📚 3 comprehensive lessons');
    console.log('   🎯 5 detailed practices with full relationships');
    console.log('   🏷️  Multiple tags and categories');
    console.log('   ✅ Complete validation rules and hints');
    console.log('   📝 Step-by-step instructions');
    console.log('\n🔗 All data is properly linked and ready for testing!');
  } catch (error) {
    console.error('💥 Full seeding failed:', error);
    process.exit(1);
  }
}

// Run the script
runFullSeed();
