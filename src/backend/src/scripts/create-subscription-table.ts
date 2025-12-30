import { DataSource } from 'typeorm';
import { createDataSourceOptions } from '../config/data-source-options';

async function createSubscriptionTable() {
  const dataSource = new DataSource(createDataSourceOptions());
  
  try {
    console.log('🔄 Initializing database connection...');
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Check if subscription table exists
    const subscriptionTableExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subscription'
      );
    `);

    if (subscriptionTableExists[0]?.exists) {
      console.log('ℹ️  Subscription table already exists');
      await dataSource.destroy();
      process.exit(0);
    }

    console.log('📦 Creating subscription table...');

    // Create enum types if they don't exist
    await dataSource.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."subscription_plantype_enum" AS ENUM('MONTHLY', 'YEARLY');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await dataSource.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."subscription_status_enum" AS ENUM('ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create subscription table
    await dataSource.query(`
      CREATE TABLE "subscription" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "planType" "public"."subscription_plantype_enum" NOT NULL,
        "status" "public"."subscription_status_enum" NOT NULL DEFAULT 'PENDING',
        "startDate" timestamp NOT NULL,
        "endDate" timestamp NOT NULL,
        "autoRenew" boolean NOT NULL DEFAULT true,
        "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp,
        CONSTRAINT "PK_subscription" PRIMARY KEY ("id")
      );
    `);

    // Create foreign key
    await dataSource.query(`
      ALTER TABLE "subscription" 
      ADD CONSTRAINT "FK_subscription_userId" 
      FOREIGN KEY ("userId") 
      REFERENCES "user"("id") 
      ON DELETE CASCADE;
    `);

    // Create indexes
    await dataSource.query(`CREATE INDEX "IDX_subscription_userId" ON "subscription" ("userId");`);
    await dataSource.query(`CREATE INDEX "IDX_subscription_status" ON "subscription" ("status");`);
    await dataSource.query(`CREATE INDEX "IDX_subscription_planType" ON "subscription" ("planType");`);
    await dataSource.query(`CREATE INDEX "IDX_subscription_endDate" ON "subscription" ("endDate");`);

    console.log('✅ Subscription table created successfully!');
    
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create subscription table:', error);
    try {
      await dataSource.destroy();
    } catch {}
    process.exit(1);
  }
}

void createSubscriptionTable();










