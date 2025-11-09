import { DataSource } from 'typeorm';
import { Practice } from '../modules/practice/entities/practice.entity';
import { GitEngineService } from '../modules/git-engine/git-engine.service';
import { IRepositoryState, ETypeGitObject } from '../modules/git-engine/git-engine.interface';

async function testValidationApi() {
    console.log('🧪 Testing Practice Validation API...\n');

    // Initialize DataSource
    const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'git_visualize_engine',
        entities: [Practice],
        synchronize: false,
        logging: false,
    });

    try {
        await dataSource.initialize();
        console.log('✅ Database connected successfully');

        // Get practice repository
        const practiceRepository = dataSource.getRepository(Practice);
        
        // Find a practice with goal repository state
        const practice = await practiceRepository.findOne({
            where: { title: 'Git Engine: Complete Workflow Practice' },
            select: ['id', 'title', 'goalRepositoryState']
        });

        if (!practice) {
            console.log('❌ No practice found with goal repository state');
            return;
        }

        console.log(`📝 Found practice: ${practice.title}`);
        console.log(`🎯 Goal repository state:`, JSON.stringify(practice.goalRepositoryState, null, 2));

        // Create GitEngineService instance
        const gitEngineService = new GitEngineService(practiceRepository);

        // Test 1: Perfect match
        console.log('\n🧪 Test 1: Perfect match');
        const perfectMatchResult = await gitEngineService.validatePractice(
            practice.id,
            practice.goalRepositoryState as IRepositoryState
        );
        console.log('Result:', JSON.stringify(perfectMatchResult, null, 2));

        // Test 2: Missing commits
        console.log('\n🧪 Test 2: Missing commits');
        const missingCommitsState: IRepositoryState = {
            ...practice.goalRepositoryState as IRepositoryState,
            commits: (practice.goalRepositoryState as IRepositoryState).commits.slice(0, 1) // Only first commit
        };
        const missingCommitsResult = await gitEngineService.validatePractice(
            practice.id,
            missingCommitsState
        );
        console.log('Result:', JSON.stringify(missingCommitsResult, null, 2));

        // Test 3: Wrong branch
        console.log('\n🧪 Test 3: Wrong branch');
        const goalState = practice.goalRepositoryState as IRepositoryState;
        let currentCommitId = '';
        if (goalState.head && goalState.head.type === 'branch') {
            currentCommitId = goalState.head.commitId;
        }
        const wrongBranchState: IRepositoryState = {
            ...goalState,
            head: {
                type: 'branch',
                ref: 'wrong-branch',
                commitId: currentCommitId
            }
        };
        const wrongBranchResult = await gitEngineService.validatePractice(
            practice.id,
            wrongBranchState
        );
        console.log('Result:', JSON.stringify(wrongBranchResult, null, 2));

        // Test 4: Extra commits
        console.log('\n🧪 Test 4: Extra commits');
        const extraCommitsState: IRepositoryState = {
            ...practice.goalRepositoryState as IRepositoryState,
            commits: [
                ...(practice.goalRepositoryState as IRepositoryState).commits,
                {
                    id: 'extra-commit-id',
                    type: ETypeGitObject.COMMIT,
                    message: 'Extra commit',
                    author: {
                        name: 'You',
                        email: '<you@example.com>',
                        date: new Date()
                    },
                    committer: {
                        name: 'You',
                        email: '<you@example.com>',
                        date: new Date()
                    },
                    parents: [],
                    branch: 'main'
                }
            ]
        };
        const extraCommitsResult = await gitEngineService.validatePractice(
            practice.id,
            extraCommitsState
        );
        console.log('Result:', JSON.stringify(extraCommitsResult, null, 2));

        // Test 5: Non-existent practice
        console.log('\n🧪 Test 5: Non-existent practice');
        const nonExistentResult = await gitEngineService.validatePractice(
            'non-existent-id',
            practice.goalRepositoryState as IRepositoryState
        );
        console.log('Result:', JSON.stringify(nonExistentResult, null, 2));

        console.log('\n✅ All tests completed successfully!');

    } catch (error) {
        console.error('❌ Error during testing:', error);
    } finally {
        await dataSource.destroy();
        console.log('🔌 Database connection closed');
    }
}

// Run the test
testValidationApi().catch(console.error);
