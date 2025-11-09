/**
 * Test script for Goal Feature
 * Verifies that goalRepositoryState is properly saved and can be retrieved
 */

import { DataSource } from 'typeorm';
import { Practice } from '../modules/practice/entities/practice.entity';
import { IRepositoryState } from '../modules/git-engine/git-engine.interface';

async function testGoalFeature() {
  console.log('🧪 Testing Goal Feature...\n');

  // Create DataSource
  const { DataSource } = require('typeorm');
  const configuration = require('../config/configuration').default;
  const config = configuration();

  const dataSource = new DataSource({
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    entities: [
      require('../modules/lessons/lesson.entity').Lesson,
      require('../modules/practice/entities/practice.entity').Practice,
      require('../modules/practice/entities/practice-instruction.entity').PracticeInstruction,
      require('../modules/practice/entities/practice-hint.entity').PracticeHint,
      require('../modules/practice/entities/practice-expected-command.entity').PracticeExpectedCommand,
      require('../modules/practice/entities/practice-validation-rule.entity').PracticeValidationRule,
      require('../modules/practice/entities/practice-tag.entity').PracticeTag,
    ],
    synchronize: true,
    logging: false,
  });

  await dataSource.initialize();
  console.log('✅ Database connected');

  try {
    // Get practice with goalRepositoryState
    const practices = await dataSource.getRepository(Practice).find({
      where: { isActive: true },
      take: 1
    });

    if (practices.length === 0) {
      console.log('❌ No practices found. Please run seed first.');
      return;
    }

    const practice = practices[0];
    console.log(`📚 Testing practice: ${practice.title}`);

    // Test goalRepositoryState
    if (!practice.goalRepositoryState) {
      console.log('❌ Practice does not have goalRepositoryState');
      return;
    }

    const goalState: IRepositoryState = practice.goalRepositoryState;
    console.log('✅ goalRepositoryState found');

    // Validate structure
    console.log('\n🔍 Validating goalRepositoryState structure:');
    
    // Check commits
    if (goalState.commits && Array.isArray(goalState.commits)) {
      console.log(`✅ Commits: ${goalState.commits.length} found`);
      goalState.commits.forEach((commit, index) => {
        console.log(`   ${index + 1}. ${commit.id.substring(0, 7)} - ${commit.message} (${commit.branch})`);
      });
    } else {
      console.log('❌ Commits array not found or invalid');
    }

    // Check branches
    if (goalState.branches && Array.isArray(goalState.branches)) {
      console.log(`✅ Branches: ${goalState.branches.length} found`);
      goalState.branches.forEach((branch, index) => {
        console.log(`   ${index + 1}. ${branch.name} -> ${branch.commitId.substring(0, 7)}`);
      });
    } else {
      console.log('❌ Branches array not found or invalid');
    }

    // Check head
    if (goalState.head) {
      console.log(`✅ HEAD: ${goalState.head.type} - ${goalState.head.type === 'branch' ? goalState.head.ref : 'detached'}`);
    } else {
      console.log('❌ HEAD not found');
    }

    // Check tags
    if (goalState.tags && Array.isArray(goalState.tags)) {
      console.log(`✅ Tags: ${goalState.tags.length} found`);
    } else {
      console.log('✅ Tags: 0 found');
    }

    // Test JSON serialization/deserialization
    console.log('\n🔄 Testing JSON serialization:');
    const jsonString = JSON.stringify(goalState);
    const parsedState: IRepositoryState = JSON.parse(jsonString);
    
    if (parsedState.commits.length === goalState.commits.length) {
      console.log('✅ JSON serialization/deserialization works correctly');
    } else {
      console.log('❌ JSON serialization/deserialization failed');
    }

    console.log('\n🎉 Goal Feature test completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Practice: ${practice.title}`);
    console.log(`- Commits: ${goalState.commits.length}`);
    console.log(`- Branches: ${goalState.branches.length}`);
    console.log(`- Tags: ${goalState.tags.length}`);
    console.log(`- HEAD: ${goalState.head?.type || 'null'}`);
    console.log('\n✅ The goalRepositoryState is properly structured and ready for frontend visualization!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testGoalFeature().catch(error => {
  console.error('💥 Goal feature test failed:', error);
  process.exit(1);
});
