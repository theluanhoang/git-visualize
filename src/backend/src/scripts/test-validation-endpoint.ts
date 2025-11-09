import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

async function testValidationEndpoint() {
    console.log('🧪 Testing Practice Validation Endpoint...\n');

    try {
        // First, get a practice to test with
        console.log('📝 Getting practice data...');
        const practicesResponse = await axios.get(`${API_BASE_URL}/practices`);
        const practices = practicesResponse.data;
        
        if (!practices || practices.length === 0) {
            console.log('❌ No practices found');
            return;
        }

        const practice = practices.find((p: any) => p.title === 'Git Engine: Complete Workflow Practice');
        if (!practice) {
            console.log('❌ Practice not found');
            return;
        }

        console.log(`✅ Found practice: ${practice.title}`);
        console.log(`🎯 Practice ID: ${practice.id}`);

        // Test 1: Perfect match
        console.log('\n🧪 Test 1: Perfect match');
        const perfectMatchRequest = {
            practiceId: practice.id,
            userRepositoryState: practice.goalRepositoryState
        };

        try {
            const perfectMatchResponse = await axios.post(
                `${API_BASE_URL}/git/validate-practice`,
                perfectMatchRequest
            );
            console.log('✅ Perfect match result:', JSON.stringify(perfectMatchResponse.data, null, 2));
        } catch (error: any) {
            console.log('❌ Perfect match error:', error.response?.data || error.message);
        }

        // Test 2: Missing commits
        console.log('\n🧪 Test 2: Missing commits');
        const missingCommitsRequest = {
            practiceId: practice.id,
            userRepositoryState: {
                ...practice.goalRepositoryState,
                commits: practice.goalRepositoryState.commits.slice(0, 1) // Only first commit
            }
        };

        try {
            const missingCommitsResponse = await axios.post(
                `${API_BASE_URL}/git/validate-practice`,
                missingCommitsRequest
            );
            console.log('✅ Missing commits result:', JSON.stringify(missingCommitsResponse.data, null, 2));
        } catch (error: any) {
            console.log('❌ Missing commits error:', error.response?.data || error.message);
        }

        // Test 3: Wrong branch
        console.log('\n🧪 Test 3: Wrong branch');
        const wrongBranchRequest = {
            practiceId: practice.id,
            userRepositoryState: {
                ...practice.goalRepositoryState,
                head: {
                    type: 'branch',
                    ref: 'wrong-branch',
                    commitId: practice.goalRepositoryState.head?.commitId || ''
                }
            }
        };

        try {
            const wrongBranchResponse = await axios.post(
                `${API_BASE_URL}/git/validate-practice`,
                wrongBranchRequest
            );
            console.log('✅ Wrong branch result:', JSON.stringify(wrongBranchResponse.data, null, 2));
        } catch (error: any) {
            console.log('❌ Wrong branch error:', error.response?.data || error.message);
        }

        // Test 4: Non-existent practice
        console.log('\n🧪 Test 4: Non-existent practice');
        const nonExistentRequest = {
            practiceId: 'non-existent-id',
            userRepositoryState: practice.goalRepositoryState
        };

        try {
            const nonExistentResponse = await axios.post(
                `${API_BASE_URL}/git/validate-practice`,
                nonExistentRequest
            );
            console.log('✅ Non-existent practice result:', JSON.stringify(nonExistentResponse.data, null, 2));
        } catch (error: any) {
            console.log('❌ Non-existent practice error:', error.response?.data || error.message);
        }

        console.log('\n✅ All endpoint tests completed!');

    } catch (error: any) {
        console.error('❌ Error during testing:', error.response?.data || error.message);
    }
}

// Run the test
testValidationEndpoint().catch(console.error);
