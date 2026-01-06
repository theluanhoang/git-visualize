import { DataSource } from 'typeorm';
import { createDataSourceOptions } from '../config/data-source-options';
import { Subscription, ESubscriptionPlanType, ESubscriptionStatus } from '../modules/subscription/subscription.entity';
import { User, EUserSubscriptionStatus } from '../modules/users/user.entity';

async function testSubscription() {
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

    console.log('Subscription table exists:', subscriptionTableExists[0]?.exists);

    // Check if user table has subscription columns
    const userColumns = await dataSource.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user' 
      AND column_name IN ('subscriptionStatus', 'subscriptionExpiresAt');
    `);
    console.log('User subscription columns:', userColumns);

    // Check subscription table columns
    const subscriptionColumns = await dataSource.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'subscription';
    `);
    console.log('Subscription table columns:', subscriptionColumns);

    // Check if enums exist
    const enums = await dataSource.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typname LIKE '%subscription%' OR typname LIKE '%user_subscription%';
    `);
    console.log('Subscription enums:', enums);

    // Try to get a user
    const userRepo = dataSource.getRepository(User);
    const users = await userRepo.find({ take: 1 });
    console.log('Sample user:', users.length > 0 ? { id: users[0].id, email: users[0].email, subscriptionStatus: users[0].subscriptionStatus } : 'No users found');

    if (users.length > 0) {
      const testUserId = users[0].id;
      
      // Try to create a subscription
      console.log('\n🧪 Testing subscription creation...');
      const subscriptionRepo = dataSource.getRepository(Subscription);
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const subscription = subscriptionRepo.create({
        userId: testUserId,
        planType: ESubscriptionPlanType.MONTHLY,
        status: ESubscriptionStatus.ACTIVE,
        startDate,
        endDate,
        autoRenew: true,
      });

      console.log('Subscription object:', subscription);
      
      try {
        const saved = await subscriptionRepo.save(subscription);
        console.log('✅ Subscription created successfully:', saved.id);

        // Try to update user
        console.log('\n🧪 Testing user update...');
        await userRepo.update(testUserId, {
          subscriptionStatus: EUserSubscriptionStatus.PRO,
          subscriptionExpiresAt: endDate,
        });
        console.log('✅ User updated successfully');

        // Clean up
        await subscriptionRepo.delete({ id: saved.id });
        const updateData: any = {
          subscriptionStatus: EUserSubscriptionStatus.FREE,
        };
        updateData.subscriptionExpiresAt = null;
        await userRepo.update(testUserId, updateData);
        console.log('✅ Cleanup completed');
      } catch (error) {
        console.error('❌ Error:', error);
        throw error;
      }
    }

    await dataSource.destroy();
    console.log('\n🎉 Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    try {
      await dataSource.destroy();
    } catch {}
    process.exit(1);
  }
}

void testSubscription();

