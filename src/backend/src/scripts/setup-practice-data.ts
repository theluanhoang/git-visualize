import { DataSource } from 'typeorm';
import { seedPracticeData } from './seed-practice-data';

export async function setupPracticeData(dataSource: DataSource) {
  console.log('🚀 Setting up practice data...');
  
  try {
    // Run migrations
    console.log('📦 Running migrations...');
    await dataSource.runMigrations();
    console.log('✅ Migrations completed');

    // Seed practice data
    console.log('🌱 Seeding practice data...');
    await seedPracticeData(dataSource);
    console.log('✅ Practice data seeded successfully');

    console.log('🎉 Setup completed successfully!');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

// If this script is run directly
if (require.main === module) {
  const ormconfig = require('../../ormconfig.js');
  const dataSource = ormconfig.default;
  
  dataSource.initialize()
    .then(() => setupPracticeData(dataSource))
    .then(() => {
      console.log('✅ Database setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    });
}
