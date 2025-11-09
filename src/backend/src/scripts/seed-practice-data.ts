import { DataSource } from 'typeorm';
import { Practice } from '../modules/practice/entities/practice.entity';
import { PracticeInstruction } from '../modules/practice/entities/practice-instruction.entity';
import { PracticeHint } from '../modules/practice/entities/practice-hint.entity';
import { PracticeExpectedCommand } from '../modules/practice/entities/practice-expected-command.entity';
import { PracticeValidationRule } from '../modules/practice/entities/practice-validation-rule.entity';
import { PracticeTag } from '../modules/practice/entities/practice-tag.entity';
import { Lesson } from '../modules/lessons/lesson.entity';
import { ELessonStatus } from '../modules/lessons/lesson.interface';
import { ValidationRuleType } from '../modules/practice/entities/practice-validation-rule.entity';

export async function seedPracticeData(dataSource: DataSource) {
  const practiceRepository = dataSource.getRepository(Practice);
  const instructionRepository = dataSource.getRepository(PracticeInstruction);
  const hintRepository = dataSource.getRepository(PracticeHint);
  const expectedCommandRepository = dataSource.getRepository(PracticeExpectedCommand);
  const validationRuleRepository = dataSource.getRepository(PracticeValidationRule);
  const tagRepository = dataSource.getRepository(PracticeTag);
  const lessonRepository = dataSource.getRepository(Lesson);

  // Find or create a lesson for practice
  let lesson = await lessonRepository.findOne({ where: { slug: 'gioi-thieu-ve-git' } });
  if (!lesson) {
    lesson = lessonRepository.create({
      title: 'Giới thiệu về Git',
      slug: 'gioi-thieu-ve-git',
      description: 'Bài học cơ bản về Git',
      content: 'Nội dung bài học...',
      status: ELessonStatus.PUBLISHED
    });
    await lessonRepository.save(lesson);
  }

  // Create practice for "Giới thiệu về Git"
  const practice = practiceRepository.create({
    lessonId: lesson.id,
    title: 'Thực hành Git cơ bản',
    scenario: 'Bạn là developer mới, hãy khởi tạo repository Git và tạo commit đầu tiên. Hãy làm theo các bước dưới đây để làm quen với Git.',
    difficulty: 1,
    estimatedTime: 10,
    isActive: true,
    order: 0
  });
  await practiceRepository.save(practice);

  // Create instructions
  const instructions = [
    'Khởi tạo repository Git mới trong thư mục hiện tại',
    'Tạo file README.md với nội dung "Hello Git!"',
    'Thêm file README.md vào staging area',
    'Thực hiện commit đầu tiên với message "Initial commit"'
  ];

  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructionRepository.create({
      practiceId: practice.id,
      content: instructions[i],
      order: i
    });
    await instructionRepository.save(instruction);
  }

  // Create hints
  const hints = [
    'Sử dụng git init để khởi tạo repository',
    'Sử dụng echo hoặc tạo file thủ công để tạo README.md',
    'Sử dụng git add để thêm file vào staging area',
    'Sử dụng git commit -m để tạo commit với message'
  ];

  for (let i = 0; i < hints.length; i++) {
    const hint = hintRepository.create({
      practiceId: practice.id,
      content: hints[i],
      order: i
    });
    await hintRepository.save(hint);
  }

  // Create expected commands
  const expectedCommands = [
    'git init',
    'echo "Hello Git!" > README.md',
    'git add README.md',
    'git commit -m "Initial commit"'
  ];

  for (let i = 0; i < expectedCommands.length; i++) {
    const command = expectedCommandRepository.create({
      practiceId: practice.id,
      command: expectedCommands[i],
      order: i,
      isRequired: true
    });
    await expectedCommandRepository.save(command);
  }

  // Create validation rules
  const validationRules = [
    {
      type: ValidationRuleType.MIN_COMMANDS,
      value: '4',
      message: 'Bạn cần thực hiện ít nhất 4 lệnh'
    },
    {
      type: ValidationRuleType.REQUIRED_COMMANDS,
      value: '["git init", "git add", "git commit"]',
      message: 'Bạn cần sử dụng các lệnh git init, git add, và git commit'
    },
    {
      type: ValidationRuleType.EXPECTED_GRAPH_STATE,
      value: '{"commits": 1, "branches": 1}',
      message: 'Kết quả cuối cùng phải có 1 commit và 1 branch'
    }
  ];

  for (let i = 0; i < validationRules.length; i++) {
    const rule = validationRuleRepository.create({
      practiceId: practice.id,
      type: validationRules[i].type,
      value: validationRules[i].value,
      message: validationRules[i].message,
      order: i
    });
    await validationRuleRepository.save(rule);
  }

  // Create tags
  const tags = [
    { name: 'beginner', color: '#22c55e' },
    { name: 'git-basics', color: '#3b82f6' },
    { name: 'repository', color: '#8b5cf6' }
  ];

  for (const tag of tags) {
    const practiceTag = tagRepository.create({
      practiceId: practice.id,
      name: tag.name,
      color: tag.color
    });
    await tagRepository.save(practiceTag);
  }

  console.log('Practice data seeded successfully!');
}
