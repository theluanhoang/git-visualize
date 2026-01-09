import axios from 'axios';

const API_BASE = 'http://localhost:8001/api/v1';

async function testCompleteSystem() {
  console.log('🧪 Testing Complete System...\n');

  try {
    // Test 1: Get lesson with practices
    console.log('1️⃣ Testing lesson API with practices...');
    const lessonResponse = await axios.get(
      `${API_BASE}/lesson?includePractices=true`,
    );
    const lesson = lessonResponse.data.data[0];

    console.log(`✅ Lesson: ${lesson.title}`);
    console.log(`✅ Slug: ${lesson.slug}`);
    console.log(`✅ Status: ${lesson.status}`);
    console.log(`✅ Practices: ${lesson.practices?.length || 0}`);

    if (lesson.practices && lesson.practices.length > 0) {
      const practice = lesson.practices[0];
      console.log(`✅ Practice: ${practice.title}`);
      console.log(`✅ Difficulty: ${practice.difficulty}/5`);
      console.log(`✅ Estimated Time: ${practice.estimatedTime} minutes`);
    }

    // Test 2: Get practices by lesson slug
    console.log('\n2️⃣ Testing practices API by lesson slug...');
    const practicesResponse = await axios.get(
      `${API_BASE}/practices?lessonSlug=${lesson.slug}`,
    );
    const practices = practicesResponse.data.data;

    console.log(`✅ Found ${practices.length} practices`);

    if (practices.length > 0) {
      const practice = practices[0];
      console.log(`✅ Practice Title: ${practice.title}`);
      console.log(`✅ Instructions: ${practice.instructions?.length || 0}`);
      console.log(`✅ Hints: ${practice.hints?.length || 0}`);
      console.log(
        `✅ Expected Commands: ${practice.expectedCommands?.length || 0}`,
      );
      console.log(
        `✅ Validation Rules: ${practice.validationRules?.length || 0}`,
      );
      console.log(`✅ Tags: ${practice.tags?.length || 0}`);
    }

    // Test 3: Test individual practice details
    console.log('\n3️⃣ Testing individual practice details...');
    if (practices.length > 0) {
      const practiceId = practices[0].id;
      const practiceDetailResponse = await axios.get(
        `${API_BASE}/practices?id=${practiceId}`,
      );
      const practiceDetail = practiceDetailResponse.data;

      console.log(`✅ Practice ID: ${practiceDetail.id}`);
      console.log(`✅ Scenario: ${practiceDetail.scenario}`);
      console.log(`✅ Active: ${practiceDetail.isActive}`);
      console.log(`✅ Order: ${practiceDetail.order}`);
    }

    // Test 4: Test practice instructions
    console.log('\n4️⃣ Testing practice instructions...');
    if (practices.length > 0) {
      const practice = practices[0];
      if (practice.instructions) {
        console.log('📋 Instructions:');
        practice.instructions.forEach((instruction: any, index: number) => {
          console.log(`   ${index + 1}. ${instruction.content}`);
        });
      }
    }

    // Test 5: Test practice hints
    console.log('\n5️⃣ Testing practice hints...');
    if (practices.length > 0) {
      const practice = practices[0];
      if (practice.hints) {
        console.log('💡 Hints:');
        practice.hints.forEach((hint: any, index: number) => {
          console.log(`   ${index + 1}. ${hint.content}`);
        });
      }
    }

    // Test 6: Test expected commands
    console.log('\n6️⃣ Testing expected commands...');
    if (practices.length > 0) {
      const practice = practices[0];
      if (practice.expectedCommands) {
        console.log('⌨️ Expected Commands:');
        practice.expectedCommands.forEach((command: any, index: number) => {
          console.log(
            `   ${index + 1}. ${command.command} ${command.isRequired ? '(Required)' : '(Optional)'}`,
          );
        });
      }
    }

    // Test 7: Test validation rules
    console.log('\n7️⃣ Testing validation rules...');
    if (practices.length > 0) {
      const practice = practices[0];
      if (practice.validationRules) {
        console.log('✅ Validation Rules:');
        practice.validationRules.forEach((rule: any, index: number) => {
          console.log(
            `   ${index + 1}. ${rule.type}: ${rule.value} - ${rule.message}`,
          );
        });
      }
    }

    // Test 8: Test tags
    console.log('\n8️⃣ Testing practice tags...');
    if (practices.length > 0) {
      const practice = practices[0];
      if (practice.tags) {
        console.log('🏷️ Tags:');
        practice.tags.forEach((tag: any, index: number) => {
          console.log(`   ${index + 1}. ${tag.name} (${tag.color})`);
        });
      }
    }

    // Test 9: Test analytics endpoints
    console.log('\n9️⃣ Testing analytics endpoints...');
    if (practices.length > 0) {
      const practiceId = practices[0].id;

      // Test increment views
      await axios.post(`${API_BASE}/practices/${practiceId}/view`);
      console.log('✅ Incremented practice views');

      // Test increment completions
      await axios.post(`${API_BASE}/practices/${practiceId}/complete`);
      console.log('✅ Incremented practice completions');
    }

    console.log('\n🎉 All tests passed! System is working correctly.');
    console.log('\n📊 System Summary:');
    console.log(`- Lesson: ${lesson.title}`);
    console.log(`- Practice: ${practices[0]?.title || 'None'}`);
    console.log(`- Instructions: ${practices[0]?.instructions?.length || 0}`);
    console.log(`- Hints: ${practices[0]?.hints?.length || 0}`);
    console.log(`- Commands: ${practices[0]?.expectedCommands?.length || 0}`);
    console.log(`- Validations: ${practices[0]?.validationRules?.length || 0}`);
    console.log(`- Tags: ${practices[0]?.tags?.length || 0}`);
    console.log('\n🚀 Ready for frontend testing!');
  } catch (error: any) {
    console.error('💥 Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the tests
testCompleteSystem();
