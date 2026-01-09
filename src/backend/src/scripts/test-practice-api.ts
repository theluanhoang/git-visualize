const API_BASE = 'http://localhost:3001';

async function makeRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorData}`);
  }

  return response.json();
}

async function testPracticeAPI() {
  console.log('🧪 Testing Practice API...\n');

  try {
    // Test 1: Get lesson with practices using includePractices parameter
    console.log(
      '1️⃣ Testing GET /lesson?slug=gioi-thieu-ve-git&includePractices=true',
    );
    const lessonWithPracticesResponse = await makeRequest(
      `${API_BASE}/lesson?slug=gioi-thieu-ve-git&includePractices=true`,
    );
    console.log('✅ Success:', {
      total: lessonWithPracticesResponse.total,
      dataCount: lessonWithPracticesResponse.data?.length || 0,
    });

    // Type-safe access to practices using type guard
    if (
      lessonWithPracticesResponse.data?.[0] &&
      'practices' in lessonWithPracticesResponse.data[0]
    ) {
      const lesson = lessonWithPracticesResponse.data[0];
      console.log('📋 Lesson with practices:', {
        title: lesson.title,
        slug: lesson.slug,
        practicesCount: lesson.practices?.length || 0,
        firstPractice: lesson.practices?.[0]
          ? {
              title: lesson.practices[0].title,
              instructions: lesson.practices[0].instructions?.length || 0,
              hints: lesson.practices[0].hints?.length || 0,
              expectedCommands:
                lesson.practices[0].expectedCommands?.length || 0,
              validationRules: lesson.practices[0].validationRules?.length || 0,
              tags: lesson.practices[0].tags?.length || 0,
            }
          : 'No practices found',
      });
    } else {
      console.log('📋 No lesson found or practices not included');
    }
    console.log(
      '📝 Note: This now uses the enhanced getLessons method with includePractices parameter and proper TypeScript types',
    );
    console.log('');

    // Test 2: Get all practices
    console.log('2️⃣ Testing GET /practices');
    const practicesResponse = await makeRequest(`${API_BASE}/practices`);
    console.log('✅ Success:', {
      total: practicesResponse.total,
      count: practicesResponse.data?.length || 0,
    });
    console.log('');

    // Test 3: Get practices by lesson slug using unified endpoint
    console.log(
      '3️⃣ Testing GET /practices?lessonSlug=gioi-thieu-ve-git&isActive=true',
    );
    const practicesBySlugResponse = await makeRequest(
      `${API_BASE}/practices?lessonSlug=gioi-thieu-ve-git&isActive=true`,
    );
    console.log('✅ Success:', {
      total: practicesBySlugResponse.total,
      dataCount: practicesBySlugResponse.data?.length || 0,
    });
    console.log('📝 Note: Now using unified endpoint with query parameters');
    console.log('');

    // Test 4: Create a new practice
    console.log('4️⃣ Testing POST /practices');
    const newPracticeData = {
      lessonId: lessonWithPracticesResponse.data[0].id,
      title: 'Test Practice',
      scenario: 'This is a test practice scenario',
      difficulty: 2,
      estimatedTime: 5,
      instructions: [
        { content: 'Test instruction 1', order: 0 },
        { content: 'Test instruction 2', order: 1 },
      ],
      hints: [{ content: 'Test hint 1', order: 0 }],
      expectedCommands: [{ command: 'git status', order: 0, isRequired: true }],
      validationRules: [
        {
          type: 'min_commands',
          value: '1',
          message: 'Need at least 1 command',
        },
      ],
      tags: [{ name: 'test', color: '#ff0000' }],
    };

    const createResponse = await makeRequest(`${API_BASE}/practices`, {
      method: 'POST',
      body: JSON.stringify(newPracticeData),
    });
    console.log('✅ Success:', {
      id: createResponse.id,
      title: createResponse.title,
    });
    console.log('');

    // Test 5: Get the created practice
    console.log('5️⃣ Testing GET /practices/:id');
    const getPracticeResponse = await makeRequest(
      `${API_BASE}/practices/${createResponse.id}`,
    );
    console.log('✅ Success:', {
      id: getPracticeResponse.id,
      title: getPracticeResponse.title,
      instructions: getPracticeResponse.instructions?.length || 0,
      hints: getPracticeResponse.hints?.length || 0,
      expectedCommands: getPracticeResponse.expectedCommands?.length || 0,
      validationRules: getPracticeResponse.validationRules?.length || 0,
      tags: getPracticeResponse.tags?.length || 0,
    });
    console.log('');

    // Test 6: Update the practice
    console.log('6️⃣ Testing PUT /practices/:id');
    const updateData = {
      title: 'Updated Test Practice',
      difficulty: 3,
    };
    const updateResponse = await makeRequest(
      `${API_BASE}/practices/${createResponse.id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updateData),
      },
    );
    console.log('✅ Success:', {
      id: updateResponse.id,
      title: updateResponse.title,
      difficulty: updateResponse.difficulty,
    });
    console.log('');

    // Test 7: Increment views
    console.log('7️⃣ Testing POST /practices/:id/view');
    await makeRequest(`${API_BASE}/practices/${createResponse.id}/view`, {
      method: 'POST',
    });
    console.log('✅ Success: View count incremented');
    console.log('');

    // Test 8: Increment completions
    console.log('8️⃣ Testing POST /practices/:id/complete');
    await makeRequest(`${API_BASE}/practices/${createResponse.id}/complete`, {
      method: 'POST',
    });
    console.log('✅ Success: Completion count incremented');
    console.log('');

    // Test 9: Delete the practice
    console.log('9️⃣ Testing DELETE /practices/:id');
    const deleteResponse = await makeRequest(
      `${API_BASE}/practices/${createResponse.id}`,
      {
        method: 'DELETE',
      },
    );
    console.log('✅ Success:', deleteResponse);
    console.log('');

    console.log('🎉 All tests passed!');
  } catch (error: any) {
    console.error('❌ Test failed:', {
      message: error.message,
    });
    process.exit(1);
  }
}

// Run the test
testPracticeAPI();
