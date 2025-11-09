import { DataSource } from 'typeorm';
import { Lesson } from '../modules/lessons/lesson.entity';
import { ELessonStatus } from '../modules/lessons/lesson.interface';
import { Practice } from '../modules/practice/entities/practice.entity';
import { PracticeInstruction } from '../modules/practice/entities/practice-instruction.entity';
import { PracticeHint } from '../modules/practice/entities/practice-hint.entity';
import { PracticeExpectedCommand } from '../modules/practice/entities/practice-expected-command.entity';
import { PracticeValidationRule, ValidationRuleType } from '../modules/practice/entities/practice-validation-rule.entity';
import { PracticeTag } from '../modules/practice/entities/practice-tag.entity';

async function seedCompleteLesson() {
  console.log('🌱 Starting complete lesson seeding...\n');

  // Create DataSource with entities from source
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
    logging: config.database.logging,
  });

  await dataSource.initialize();
  console.log('✅ Database connected');

  try {
    // Clear existing data using raw queries to avoid foreign key constraints
    console.log('🧹 Clearing existing data...');
    await dataSource.query('TRUNCATE TABLE practice_tag CASCADE');
    await dataSource.query('TRUNCATE TABLE practice_validation_rule CASCADE');
    await dataSource.query('TRUNCATE TABLE practice_expected_command CASCADE');
    await dataSource.query('TRUNCATE TABLE practice_hint CASCADE');
    await dataSource.query('TRUNCATE TABLE practice_instruction CASCADE');
    await dataSource.query('TRUNCATE TABLE practice CASCADE');
    await dataSource.query('TRUNCATE TABLE lesson CASCADE');
    console.log('✅ Existing data cleared');

    // Create a complete lesson
    console.log('📚 Creating complete lesson...');
    const lesson = dataSource.getRepository(Lesson).create({
      title: 'Git Fundamentals: Complete Guide',
      slug: 'git-fundamentals-complete-guide',
      description: 'Master the essential Git concepts and commands from scratch. Learn version control, branching, merging, and collaboration workflows.',
      content: `# Git Fundamentals: Complete Guide

## What is Git?

Git is a distributed version control system that tracks changes in files and coordinates work among multiple people. It was created by Linus Torvalds in 2005 for Linux kernel development.

## Why Use Git?

- **Version Control**: Track changes to your code over time
- **Collaboration**: Work with multiple developers on the same project
- **Backup**: Keep multiple copies of your work
- **Branching**: Work on different features simultaneously
- **History**: See what changed, when, and why

## Key Concepts

### Repository
A repository (repo) is a collection of files and their complete history. It contains:
- All your project files
- Complete change history
- Branch information
- Remote connections

### Commit
A commit is a snapshot of your files at a specific point in time. Each commit has:
- A unique ID (hash)
- A commit message
- Author and timestamp
- Parent commit(s)

### Branch
A branch is a parallel version of your code. The main branch is usually called "main" or "master".

### Working Directory
The folder on your computer where you're working on your project.

### Staging Area
A temporary area where you prepare changes before committing them.

## Basic Git Workflow

1. **Initialize** a repository
2. **Add** files to staging
3. **Commit** changes
4. **Push** to remote repository

## Essential Commands

### Repository Management
- \`git init\` - Initialize a new repository
- \`git clone <url>\` - Copy an existing repository
- \`git status\` - Check repository status

### File Management
- \`git add <file>\` - Stage a file
- \`git add .\` - Stage all changes
- \`git commit -m "message"\` - Commit changes
- \`git diff\` - Show changes

### Branching
- \`git branch\` - List branches
- \`git branch <name>\` - Create a branch
- \`git checkout <branch>\` - Switch to branch
- \`git merge <branch>\` - Merge branches

### Remote Operations
- \`git push\` - Upload changes
- \`git pull\` - Download changes
- \`git fetch\` - Download without merging

## Best Practices

1. **Commit Often**: Make small, frequent commits
2. **Write Good Messages**: Be descriptive and clear
3. **Use Branches**: Keep main branch stable
4. **Review Changes**: Check what you're committing
5. **Backup Regularly**: Push to remote repositories

## Common Workflows

### Feature Development
1. Create a feature branch
2. Make changes
3. Commit frequently
4. Push to remote
5. Create pull request
6. Merge after review

### Bug Fixing
1. Create a hotfix branch
2. Fix the issue
3. Test thoroughly
4. Merge to main
5. Deploy immediately

## Next Steps

After learning these fundamentals, you'll be ready to:
- Work with remote repositories
- Collaborate with teams
- Use advanced Git features
- Implement Git workflows

Remember: Git is a powerful tool that takes time to master. Start with the basics and gradually learn more advanced features.`,
      status: ELessonStatus.PUBLISHED,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedLesson = await dataSource.getRepository(Lesson).save(lesson);
    console.log(`✅ Lesson created: ${savedLesson.title} (ID: ${savedLesson.id})`);

    // Create comprehensive practice
    console.log('🏋️ Creating comprehensive practice...');
    const practice = dataSource.getRepository(Practice).create({
      lessonId: savedLesson.id,
      title: 'Git Repository Setup and First Commit',
      scenario: 'You are starting a new project and need to set up version control. Create a new Git repository, add your project files, and make your first commit with a proper message.',
      difficulty: 1,
      estimatedTime: 15,
      isActive: true,
      order: 1,
      views: 0,
      completions: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedPractice = await dataSource.getRepository(Practice).save(practice);
    console.log(`✅ Practice created: ${savedPractice.title} (ID: ${savedPractice.id})`);

    // Create detailed instructions
    console.log('📋 Creating step-by-step instructions...');
    const instructions = [
      {
        practiceId: savedPractice.id,
        content: 'Create a new directory for your project',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Navigate into the project directory',
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Initialize a new Git repository',
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Create a README.md file with project description',
        order: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Check the status of your repository',
        order: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Add the README file to the staging area',
        order: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Make your first commit with a descriptive message',
        order: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Verify your commit was created successfully',
        order: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    await dataSource.getRepository(PracticeInstruction).save(instructions);
    console.log(`✅ Created ${instructions.length} instructions`);

    // Create helpful hints
    console.log('💡 Creating helpful hints...');
    const hints = [
      {
        practiceId: savedPractice.id,
        content: 'Use mkdir command to create a directory',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Use cd command to navigate into directories',
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Use git init to initialize a new repository',
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Use echo command to create simple text files',
        order: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Use git status to check repository state',
        order: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Use git add to stage files for commit',
        order: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Use git commit -m "message" to commit changes',
        order: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Use git log to view commit history',
        order: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    await dataSource.getRepository(PracticeHint).save(hints);
    console.log(`✅ Created ${hints.length} hints`);

    // Create expected commands
    console.log('⌨️ Creating expected commands...');
    const expectedCommands = [
      {
        practiceId: savedPractice.id,
        command: 'mkdir my-git-project',
        order: 1,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'cd my-git-project',
        order: 2,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'git init',
        order: 3,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'echo "# My Git Project" > README.md',
        order: 4,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'git status',
        order: 5,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'git add README.md',
        order: 6,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'git commit -m "Initial commit: Add README"',
        order: 7,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'git log --oneline',
        order: 8,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    await dataSource.getRepository(PracticeExpectedCommand).save(expectedCommands);
    console.log(`✅ Created ${expectedCommands.length} expected commands`);

    // Create validation rules
    console.log('✅ Creating validation rules...');
    const validationRules = [
      {
        practiceId: savedPractice.id,
        type: ValidationRuleType.MIN_COMMANDS,
        value: '6',
        message: 'You need to execute at least 6 commands to complete this practice',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        type: ValidationRuleType.REQUIRED_COMMANDS,
        value: 'git init,git add,git commit',
        message: 'You must use git init, git add, and git commit commands',
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        type: ValidationRuleType.CUSTOM,
        value: '{"type": "commit_count", "expected": 1}',
        message: 'You must create exactly 1 commit',
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    await dataSource.getRepository(PracticeValidationRule).save(validationRules);
    console.log(`✅ Created ${validationRules.length} validation rules`);

    // Create tags
    console.log('🏷️ Creating tags...');
    const tags = [
      {
        practiceId: savedPractice.id,
        name: 'git-basics',
        color: '#2196F3',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        name: 'beginner',
        color: '#4CAF50',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        name: 'repository-setup',
        color: '#FF9800',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        name: 'first-commit',
        color: '#9C27B0',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    await dataSource.getRepository(PracticeTag).save(tags);
    console.log(`✅ Created ${tags.length} tags`);

    console.log('\n🎉 Complete lesson seeding finished successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Lesson: ${savedLesson.title}`);
    console.log(`- Practice: ${savedPractice.title}`);
    console.log(`- Instructions: ${instructions.length}`);
    console.log(`- Hints: ${hints.length}`);
    console.log(`- Expected Commands: ${expectedCommands.length}`);
    console.log(`- Validation Rules: ${validationRules.length}`);
    console.log(`- Tags: ${tags.length}`);
    console.log('\n🚀 The lesson is now ready for students to learn and practice!');

  } catch (error) {
    console.error('💥 Seeding failed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding
seedCompleteLesson().catch(error => {
  console.error('💥 Complete lesson seeding failed:', error);
  process.exit(1);
});
