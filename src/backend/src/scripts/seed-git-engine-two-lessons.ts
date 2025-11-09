/**
 * Seed script: Create TWO full Git Engine lessons with practices
 * - Lesson 1: Git Engine Fundamentals (init, status, commit)
 * - Lesson 2: Branching & Switching (branch, checkout, switch, clear)
 *
 * Notes:
 * - Content is Markdown with fenced code blocks to render nicely in the frontend editor/viewer
 * - Only uses commands supported by the current Git Engine implementation
 */

import { DataSource } from 'typeorm';
import { Lesson } from '../modules/lessons/lesson.entity';
import { ELessonStatus } from '../modules/lessons/lesson.interface';
import { Practice } from '../modules/practice/entities/practice.entity';
import { PracticeInstruction } from '../modules/practice/entities/practice-instruction.entity';
import { PracticeHint } from '../modules/practice/entities/practice-hint.entity';
import { PracticeExpectedCommand } from '../modules/practice/entities/practice-expected-command.entity';
import { PracticeValidationRule, ValidationRuleType } from '../modules/practice/entities/practice-validation-rule.entity';
import { PracticeTag } from '../modules/practice/entities/practice-tag.entity';
import { ETypeGitObject } from '../modules/git-engine/git-engine.interface';

async function seedTwoLessons() {
  console.log('🌱 Seeding TWO Git Engine lessons...');

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
    synchronize: false,
    logging: config.database.logging,
  });

  await dataSource.initialize();
  console.log('✅ Database connected');

  try {
    // ================ LESSON 1 ================
    const lesson1 = dataSource.getRepository(Lesson).create({
      title: 'Git Engine Fundamentals',
      slug: 'git-engine-fundamentals',
      description: 'Learn the core Git Engine commands: init, status, commit.',
      content: `# Git Engine Fundamentals\n\n## Overview\n\nThis lesson introduces the core commands supported by our Git Engine.\n\n## Commands\n\n### git init\nInitialize a new repository.\n\n\n\`\`\`bash\ngit init\n# Output: Initialized empty Git repository\n\`\`\`\n\n### git status\nCheck current repository state.\n\n\n\`\`\`bash\ngit status\n# Output: On branch main\n#         nothing to commit, working tree clean\n\`\`\`\n\n### git commit -m "message"\nCreate a new commit with a message.\n\n\n\`\`\`bash\ngit commit -m "Initial commit"\n# Output: [main abc1234] Initial commit\n\`\`\`\n\n> Tip: Use short, imperative messages.`,
      status: ELessonStatus.PUBLISHED,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const savedLesson1 = await dataSource.getRepository(Lesson).save(lesson1);

    const practice1 = dataSource.getRepository(Practice).create({
      lessonId: savedLesson1.id,
      title: 'Practice: Initialize and Commit',
      scenario: 'Start a repository, check status, and create the first commit.',
      difficulty: 1,
      estimatedTime: 10,
      isActive: true,
      order: 1,
      views: 0,
      completions: 0,
      goalRepositoryState: {
        commits: [
          {
            id: 'init-commit-id',
            type: ETypeGitObject.COMMIT,
            message: 'Initial commit',
            author: { name: 'You', email: '<you@example.com>', date: new Date().toISOString() },
            committer: { name: 'You', email: '<you@example.com>', date: new Date().toISOString() },
            parents: [],
            branch: 'main',
          },
        ],
        branches: [ { name: 'main', commitId: 'init-commit-id' } ],
        tags: [],
        head: { type: 'branch', ref: 'main', commitId: 'init-commit-id' },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const savedPractice1 = await dataSource.getRepository(Practice).save(practice1);

    await dataSource.getRepository(PracticeInstruction).save([
      { practiceId: savedPractice1.id, content: 'Initialize repository', order: 1, createdAt: new Date(), updatedAt: new Date() },
      { practiceId: savedPractice1.id, content: 'Check repository status', order: 2, createdAt: new Date(), updatedAt: new Date() },
      { practiceId: savedPractice1.id, content: 'Create the initial commit', order: 3, createdAt: new Date(), updatedAt: new Date() },
    ]);
    await dataSource.getRepository(PracticeHint).save([
      { practiceId: savedPractice1.id, content: 'Use git init', order: 1, createdAt: new Date(), updatedAt: new Date() },
      { practiceId: savedPractice1.id, content: 'Run git status', order: 2, createdAt: new Date(), updatedAt: new Date() },
      { practiceId: savedPractice1.id, content: 'Commit with git commit -m "Initial commit"', order: 3, createdAt: new Date(), updatedAt: new Date() },
    ]);
    await dataSource.getRepository(PracticeExpectedCommand).save([
      { practiceId: savedPractice1.id, command: 'git init', order: 1, isRequired: true, createdAt: new Date(), updatedAt: new Date() },
      { practiceId: savedPractice1.id, command: 'git status', order: 2, isRequired: true, createdAt: new Date(), updatedAt: new Date() },
      { practiceId: savedPractice1.id, command: 'git commit -m "Initial commit"', order: 3, isRequired: true, createdAt: new Date(), updatedAt: new Date() },
    ]);
    await dataSource.getRepository(PracticeValidationRule).save([
      { practiceId: savedPractice1.id, type: ValidationRuleType.MIN_COMMANDS, value: '3', message: 'Execute at least 3 commands', order: 1, createdAt: new Date(), updatedAt: new Date() },
      { practiceId: savedPractice1.id, type: ValidationRuleType.REQUIRED_COMMANDS, value: 'git init,git status,git commit', message: 'Use init, status, commit', order: 2, createdAt: new Date(), updatedAt: new Date() },
    ]);
    await dataSource.getRepository(PracticeTag).save([
      { practiceId: savedPractice1.id, name: 'fundamentals', color: '#4CAF50', createdAt: new Date(), updatedAt: new Date() },
      { practiceId: savedPractice1.id, name: 'beginner', color: '#2196F3', createdAt: new Date(), updatedAt: new Date() },
    ]);

    // ================ LESSON 2 ================
    const lesson2 = dataSource.getRepository(Lesson).create({
      title: 'Branching & Switching with Git Engine',
      slug: 'git-engine-branching-and-switching',
      description: 'Work with branches using branch, checkout, switch, and clear.',
      content: `# Branching & Switching\n\n## Branching Basics\n\nCreate, list, and navigate branches with these supported commands.\n\n### git branch\nList branches; with a name, create a branch.\n\n\n\`\`\`bash\n# list\ngit branch\n\n# create\ngit branch feature/login\n\`\`\`\n\n### git checkout <branch>\nSwitch to an existing branch.\n\n\n\`\`\`bash\ngit checkout feature/login\n# Output: Switched to branch 'feature/login'\n\`\`\`\n\n### git switch\nAlternative to checkout; also supports -c to create and switch.\n\n\n\`\`\`bash\ngit switch main\n# or\ngit switch -c feature/dashboard\n\`\`\`\n\n### git clear\nReset repository state to start fresh.`,
      status: ELessonStatus.PUBLISHED,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const savedLesson2 = await dataSource.getRepository(Lesson).save(lesson2);

    const practice2 = dataSource.getRepository(Practice).create({
      lessonId: savedLesson2.id,
      title: 'Practice: Branching Workflow',
      scenario: 'Create feature branches and switch between them.',
      difficulty: 2,
      estimatedTime: 15,
      isActive: true,
      order: 1,
      views: 0,
      completions: 0,
      goalRepositoryState: {
        commits: [
          {
            id: 'l2-commit-1',
            type: ETypeGitObject.COMMIT,
            message: 'Initial commit',
            author: { name: 'You', email: '<you@example.com>', date: new Date().toISOString() },
            committer: { name: 'You', email: '<you@example.com>', date: new Date().toISOString() },
            parents: [],
            branch: 'main',
          },
          {
            id: 'l2-commit-2',
            type: ETypeGitObject.COMMIT,
            message: 'Add login feature',
            author: { name: 'You', email: '<you@example.com>', date: new Date().toISOString() },
            committer: { name: 'You', email: '<you@example.com>', date: new Date().toISOString() },
            parents: ['l2-commit-1'],
            branch: 'feature/login',
          },
        ],
        branches: [
          { name: 'main', commitId: 'l2-commit-1' },
          { name: 'feature/login', commitId: 'l2-commit-2' },
        ],
        tags: [],
        head: { type: 'branch', ref: 'feature/login', commitId: 'l2-commit-2' },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const savedPractice2 = await dataSource.getRepository(Practice).save(practice2);

    await dataSource.getRepository(PracticeInstruction).save([
      { practiceId: savedPractice2.id, content: 'Initialize repository and make initial commit', order: 1, createdAt: new Date(), updatedAt: new Date() },
      { practiceId: savedPractice2.id, content: 'Create feature/login branch', order: 2, createdAt: new Date(), updatedAt: new Date() },
      { practiceId: savedPractice2.id, content: 'Switch to feature/login and commit a change', order: 3, createdAt: new Date(), updatedAt: new Date() },
    ]);
    await dataSource.getRepository(PracticeHint).save([
      { practiceId: savedPractice2.id, content: 'Use git branch feature/login', order: 1, createdAt: new Date(), updatedAt: new Date() },
      { practiceId: savedPractice2.id, content: 'Switch with git checkout feature/login or git switch feature/login', order: 2, createdAt: new Date(), updatedAt: new Date() },
      { practiceId: savedPractice2.id, content: 'Use git commit -m "message"', order: 3, createdAt: new Date(), updatedAt: new Date() },
    ]);
    await dataSource.getRepository(PracticeExpectedCommand).save([
      { practiceId: savedPractice2.id, command: 'git init', order: 1, isRequired: true, createdAt: new Date(), updatedAt: new Date() },
      { practiceId: savedPractice2.id, command: 'git commit -m "Initial commit"', order: 2, isRequired: true, createdAt: new Date(), updatedAt: new Date() },
      { practiceId: savedPractice2.id, command: 'git branch feature/login', order: 3, isRequired: true, createdAt: new Date(), updatedAt: new Date() },
      { practiceId: savedPractice2.id, command: 'git checkout feature/login', order: 4, isRequired: true, createdAt: new Date(), updatedAt: new Date() },
      { practiceId: savedPractice2.id, command: 'git commit -m "Add login feature"', order: 5, isRequired: true, createdAt: new Date(), updatedAt: new Date() },
    ]);
    await dataSource.getRepository(PracticeValidationRule).save([
      { practiceId: savedPractice2.id, type: ValidationRuleType.MIN_COMMANDS, value: '5', message: 'Execute at least 5 commands', order: 1, createdAt: new Date(), updatedAt: new Date() },
      { practiceId: savedPractice2.id, type: ValidationRuleType.REQUIRED_COMMANDS, value: 'git init,git commit,git branch,git checkout,git switch', message: 'Use init/commit/branch/checkout/switch', order: 2, createdAt: new Date(), updatedAt: new Date() },
    ]);
    await dataSource.getRepository(PracticeTag).save([
      { practiceId: savedPractice2.id, name: 'branching', color: '#9C27B0', createdAt: new Date(), updatedAt: new Date() },
      { practiceId: savedPractice2.id, name: 'intermediate', color: '#FF9800', createdAt: new Date(), updatedAt: new Date() },
    ]);

    console.log('🎉 Successfully seeded TWO lessons.');
    console.log(` - Lesson 1: ${savedLesson1.title}`);
    console.log(` - Lesson 2: ${savedLesson2.title}`);
  } catch (err) {
    console.error('💥 Seeding failed:', err);
    throw err;
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

seedTwoLessons().catch((e) => {
  console.error(e);
  process.exit(1);
});


