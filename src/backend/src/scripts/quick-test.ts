// Quick test script to verify the setup
console.log('🧪 Quick Test Script');
console.log('==================');

// Test 1: Check if we can import the entities
try {
  console.log('1️⃣ Testing entity imports...');
  const { Practice } = require('../modules/practice/entities/practice.entity');
  const { PracticeInstruction } = require('../modules/practice/entities/practice-instruction.entity');
  const { PracticeHint } = require('../modules/practice/entities/practice-hint.entity');
  const { PracticeExpectedCommand } = require('../modules/practice/entities/practice-expected-command.entity');
  const { PracticeValidationRule } = require('../modules/practice/entities/practice-validation-rule.entity');
  const { PracticeTag } = require('../modules/practice/entities/practice-tag.entity');
  const { Lesson } = require('../modules/lessons/lesson.entity');
  console.log('✅ All entities imported successfully');
} catch (error) {
  console.error('❌ Entity import failed:', error);
  process.exit(1);
}

// Test 2: Check if we can import the services
try {
  console.log('2️⃣ Testing service imports...');
  const { PracticeAggregateService } = require('../modules/practice/services/practice-aggregate.service');
  const { PracticeEntityService } = require('../modules/practice/services/practice-entity.service');
  const { LessonService } = require('../modules/lessons/lesson.service');
  console.log('✅ All services imported successfully');
} catch (error) {
  console.error('❌ Service import failed:', error);
  process.exit(1);
}

// Test 3: Check if we can import the DTOs
try {
  console.log('3️⃣ Testing DTO imports...');
  const { CreatePracticeDTO } = require('../modules/practice/dto/create-practice.dto');
  const { UpdatePracticeDTO } = require('../modules/practice/dto/update-practice.dto');
  const { GetPracticesQueryDto } = require('../modules/practice/dto/get-practices.query.dto');
  console.log('✅ All DTOs imported successfully');
} catch (error) {
  console.error('❌ DTO import failed:', error);
  process.exit(1);
}

// Test 4: Check if we can import the enums
try {
  console.log('4️⃣ Testing enum imports...');
  const { ValidationRuleType } = require('../modules/practice/entities/practice-validation-rule.entity');
  const { ELessonStatus } = require('../modules/lessons/lesson.interface');
  console.log('✅ All enums imported successfully');
  console.log('📋 Available validation rule types:', Object.values(ValidationRuleType));
  console.log('📋 Available lesson statuses:', Object.values(ELessonStatus));
} catch (error) {
  console.error('❌ Enum import failed:', error);
  process.exit(1);
}

console.log('');
console.log('🎉 All imports successful! The Practice module is ready to use.');
console.log('');
console.log('📋 Next steps:');
console.log('1. Run: npm run migration:run');
console.log('2. Run: npm run setup:practice');
console.log('3. Start server: npm run start:dev');
console.log('4. Test API: npm run test:practice-api');
