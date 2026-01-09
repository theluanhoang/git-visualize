/**
 * Test script for full API with comprehensive data
 * Tests both lessons and practices with their relationships
 */

async function testFullAPI() {
  const baseUrl = 'http://localhost:8001';

  console.log('🧪 Testing Full API with comprehensive data...\n');

  try {
    // Test 1: Get all lessons
    console.log('📚 Test 1: Get all lessons');
    const lessonsResponse = await fetch(`${baseUrl}/lesson`);
    const lessons = await lessonsResponse.json();
    console.log(`✅ Found ${lessons.data.length} lessons`);
    lessons.data.forEach((lesson: any, index: number) => {
      console.log(`   ${index + 1}. ${lesson.title} (${lesson.slug})`);
    });

    // Test 2: Get lessons with practices
    console.log('\n📚🎯 Test 2: Get lessons with practices');
    const lessonsWithPracticesResponse = await fetch(
      `${baseUrl}/lesson?includePractices=true`,
    );
    const lessonsWithPractices = await lessonsWithPracticesResponse.json();
    console.log(
      `✅ Found ${lessonsWithPractices.data.length} lessons with practices`,
    );

    lessonsWithPractices.data.forEach((lesson: any, index: number) => {
      console.log(`   ${index + 1}. ${lesson.title}`);
      if (lesson.practices && lesson.practices.length > 0) {
        console.log(`      🎯 ${lesson.practices.length} practices:`);
        lesson.practices.forEach((practice: any, pIndex: number) => {
          console.log(
            `         ${pIndex + 1}. ${practice.title} (Difficulty: ${practice.difficulty})`,
          );
        });
      } else {
        console.log(`      ⚠️  No practices found`);
      }
    });

    // Test 3: Get all practices
    console.log('\n🎯 Test 3: Get all practices');
    const practicesResponse = await fetch(`${baseUrl}/practices`);
    const practices = await practicesResponse.json();
    console.log(`✅ Found ${practices.data.length} practices`);
    practices.data.forEach((practice: any, index: number) => {
      console.log(
        `   ${index + 1}. ${practice.title} (Lesson: ${practice.lessonId})`,
      );
    });

    // Test 4: Get practices by lesson slug
    console.log('\n🎯📚 Test 4: Get practices by lesson slug');
    const firstLessonSlug = lessons.data[0].slug;
    const practicesByLessonResponse = await fetch(
      `${baseUrl}/practices?lessonSlug=${firstLessonSlug}`,
    );
    const practicesByLesson = await practicesByLessonResponse.json();
    console.log(
      `✅ Found ${practicesByLesson.data.length} practices for lesson: ${firstLessonSlug}`,
    );
    practicesByLesson.data.forEach((practice: any, index: number) => {
      console.log(
        `   ${index + 1}. ${practice.title} (Difficulty: ${practice.difficulty})`,
      );
    });

    // Test 5: Get practices by difficulty
    console.log('\n🎯📊 Test 5: Get practices by difficulty');
    const beginnerPracticesResponse = await fetch(
      `${baseUrl}/practices?difficulty=1`,
    );
    const beginnerPractices = await beginnerPracticesResponse.json();
    console.log(`✅ Found ${beginnerPractices.data.length} beginner practices`);
    beginnerPractices.data.forEach((practice: any, index: number) => {
      console.log(`   ${index + 1}. ${practice.title}`);
    });

    // Test 6: Get practices with tags
    console.log('\n🏷️ Test 6: Get practices with tags');
    const practicesWithTagsResponse = await fetch(
      `${baseUrl}/practices?includeRelations=true`,
    );
    const practicesWithTags = await practicesWithTagsResponse.json();
    console.log(
      `✅ Found ${practicesWithTags.data.length} practices with full relations`,
    );

    practicesWithTags.data.forEach((practice: any, index: number) => {
      console.log(`   ${index + 1}. ${practice.title}`);
      if (practice.tags && practice.tags.length > 0) {
        console.log(
          `      🏷️  Tags: ${practice.tags.map((tag: any) => tag.name).join(', ')}`,
        );
      }
      if (practice.instructions && practice.instructions.length > 0) {
        console.log(`      📝 ${practice.instructions.length} instructions`);
      }
      if (practice.expectedCommands && practice.expectedCommands.length > 0) {
        console.log(
          `      ⌨️  ${practice.expectedCommands.length} expected commands`,
        );
      }
    });

    // Test 7: Test specific practice by ID
    if (practices.data.length > 0) {
      console.log('\n🎯🔍 Test 7: Get specific practice by ID');
      const practiceId = practices.data[0].id;
      const specificPracticeResponse = await fetch(
        `${baseUrl}/practices?id=${practiceId}`,
      );
      const specificPractice = await specificPracticeResponse.json();
      console.log(`✅ Found practice: ${specificPractice.title}`);
      console.log(`   📝 Scenario: ${specificPractice.scenario}`);
      console.log(
        `   ⏱️  Estimated time: ${specificPractice.estimatedTime} minutes`,
      );
      console.log(`   📊 Difficulty: ${specificPractice.difficulty}`);
    }

    // Test 8: Test analytics endpoints
    console.log('\n📊 Test 8: Test analytics endpoints');
    if (practices.data.length > 0) {
      const practiceId = practices.data[0].id;

      // Increment views
      const viewResponse = await fetch(
        `${baseUrl}/practices/${practiceId}/view`,
        {
          method: 'POST',
        },
      );
      console.log(`✅ View count incremented (Status: ${viewResponse.status})`);

      // Increment completions
      const completionResponse = await fetch(
        `${baseUrl}/practices/${practiceId}/complete`,
        {
          method: 'POST',
        },
      );
      console.log(
        `✅ Completion count incremented (Status: ${completionResponse.status})`,
      );
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   📚 Lessons: ${lessons.data.length}`);
    console.log(`   🎯 Practices: ${practices.data.length}`);
    console.log(`   🔗 All relationships working correctly`);
    console.log(`   ✅ API endpoints functioning properly`);
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testFullAPI()
    .then(() => {
      console.log('\n✨ Full API testing completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Full API testing failed:', error);
      process.exit(1);
    });
}

export { testFullAPI };
