/**
 * Seed script for Git Engine Lesson - Complete lesson with practice based on git-engine commands
 * Creates comprehensive test data focused on git-engine supported commands:
 * - init, status, commit, branch, checkout, switch, clear
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

async function seedGitEngineLesson() {
  console.log('🌱 Starting Git Engine lesson seeding...\n');

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

    // Create Git Engine lesson
    console.log('📚 Creating Git Engine lesson...');
    const lesson = dataSource.getRepository(Lesson).create({
      title: 'Git Engine Commands: Complete Guide',
      slug: 'git-engine-commands-complete-guide',
      description: 'Master all Git commands supported by our Git Engine. Learn repository management, branching, and version control using the interactive Git Engine.',
      content: `# Git Engine Commands: Complete Guide

## Introduction to Git Engine

Our Git Engine is a simplified version of Git that supports the essential commands for learning version control. This interactive environment helps you understand Git concepts without the complexity of a full Git installation.

## Supported Commands

Our Git Engine currently supports the following commands:

### Repository Management
- **\`git init\`** - Initialize a new Git repository
- **\`git status\`** - Check the current state of your repository
- **\`git clear\`** - Reset the repository state (clear all data)

### Version Control
- **\`git commit -m "message"\`** - Create a new commit with changes
- **\`git log\`** - View commit history (planned feature)

### Branching Operations
- **\`git branch\`** - List all branches
- **\`git branch <name>\`** - Create a new branch
- **\`git checkout <branch>\`** - Switch to an existing branch
- **\`git switch <branch>\`** - Switch to an existing branch (alternative syntax)
- **\`git switch -c <branch>\`** - Create and switch to a new branch

## Key Concepts

### Repository State
When you initialize a repository with \`git init\`, our engine creates:
- An empty commit history
- A default "main" branch
- A HEAD pointer pointing to the main branch

### Commits
Each commit in our engine contains:
- A unique ID (generated automatically)
- A commit message (provided by you)
- Author information (automatically set)
- Parent commit reference
- Branch information

### Branches
Branches are parallel lines of development:
- **main**: The default branch when you initialize a repository
- **Feature branches**: Created for new features or bug fixes
- **Branch switching**: Moving between different branches

## Command Details

### git init
Initializes a new Git repository in the current directory.
- Creates a new repository if none exists
- Reinitializes if repository already exists
- Sets up the main branch and HEAD pointer

**Example:**
\`\`\`bash
git init
# Output: Initialized empty Git repository
\`\`\`

### git status
Shows the current state of your repository.
- Displays current branch
- Shows commit status
- Indicates if working tree is clean

**Example:**
\`\`\`bash
git status
# Output: On branch main
#         nothing to commit, working tree clean
\`\`\`

### git commit -m "message"
Creates a new commit with the specified message.
- Requires a commit message using -m flag
- Creates a new commit object
- Updates branch pointer and HEAD

**Example:**
\`\`\`bash
git commit -m "Add new feature"
# Output: [main abc1234] Add new feature
\`\`\`

### git branch
Lists all branches in the repository.
- Shows current branch with asterisk (*)
- Displays all available branches

**Example:**
\`\`\`bash
git branch
# Output: * main
#          feature/new-feature
\`\`\`

### git branch <name>
Creates a new branch with the specified name.
- Creates branch from current HEAD
- Does not switch to the new branch

**Example:**
\`\`\`bash
git branch feature/login
# Output: (no output, branch created silently)
\`\`\`

### git checkout <branch>
Switches to the specified branch.
- Changes HEAD to point to the branch
- Updates working directory to match branch state

**Example:**
\`\`\`bash
git checkout feature/login
# Output: Switched to branch 'feature/login'
\`\`\`

### git switch <branch>
Alternative syntax for switching branches.
- Same functionality as git checkout
- More intuitive command name

**Example:**
\`\`\`bash
git switch main
# Output: Switched to branch 'main'
\`\`\`

### git switch -c <branch>
Creates a new branch and switches to it.
- Combines branch creation and switching
- Equivalent to: git branch <name> && git checkout <name>

**Example:**
\`\`\`bash
git switch -c feature/dashboard
# Output: Switched to a new branch 'feature/dashboard'
\`\`\`

### git clear
Resets the repository state.
- Clears all commits, branches, and history
- Returns to initial state (no repository)
- Useful for starting fresh

**Example:**
\`\`\`bash
git clear
# Output: (no output, repository cleared)
\`\`\`

## Best Practices

### Commit Messages
- Use descriptive messages that explain what changed
- Keep messages concise but informative
- Use imperative mood (e.g., "Add feature" not "Added feature")

### Branch Naming
- Use descriptive names that indicate purpose
- Common patterns: feature/, bugfix/, hotfix/
- Use lowercase with hyphens or slashes

### Workflow
1. Initialize repository with \`git init\`
2. Create feature branches for new work
3. Make commits with descriptive messages
4. Switch between branches as needed
5. Use \`git status\` to check current state

## Common Workflows

### Starting a New Project
1. \`git init\` - Initialize repository
2. \`git status\` - Check initial state
3. \`git commit -m "Initial commit"\` - Make first commit

### Feature Development
1. \`git switch -c feature/new-feature\` - Create and switch to feature branch
2. Make changes and commit: \`git commit -m "Add new feature"\`
3. \`git switch main\` - Switch back to main branch

### Branch Management
1. \`git branch\` - List all branches
2. \`git switch <branch>\` - Switch between branches
3. \`git branch <name>\` - Create new branches

## Troubleshooting

### Common Issues
- **"fatal: not a git repository"**: Run \`git init\` first
- **"fatal: HEAD is not pointing to a branch"**: Use \`git switch\` to point to a branch
- **"fatal: A branch named 'X' already exists"**: Choose a different branch name

### Getting Help
- Use \`git status\` to understand current state
- Check branch status with \`git branch\`
- Use \`git clear\` to start fresh if needed

## Next Steps

After mastering these commands, you'll be ready to:
- Work with more complex Git workflows
- Understand Git's internal structure
- Use full Git commands in real projects
- Collaborate with teams using Git

Remember: Practice makes perfect! Use our interactive Git Engine to experiment with these commands and build your confidence.`,
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
      title: 'Git Engine: Complete Workflow Practice',
      scenario: 'You are learning Git using our interactive Git Engine. Practice the complete workflow from repository initialization to branch management. Use all supported commands to understand how Git works.',
      difficulty: 2,
      estimatedTime: 25,
      isActive: true,
      order: 1,
      views: 0,
      completions: 0,
      goalRepositoryState: {
        commits: [
          {
            id: "abc1234",
            type: "COMMIT",
            message: "Initial commit",
            author: {
              name: "You",
              email: "<you@example.com>",
              date: new Date().toISOString()
            },
            committer: {
              name: "You", 
              email: "<you@example.com>",
              date: new Date().toISOString()
            },
            parents: [],
            branch: "main"
          },
          {
            id: "def5678",
            type: "COMMIT", 
            message: "Add login feature",
            author: {
              name: "You",
              email: "<you@example.com>",
              date: new Date().toISOString()
            },
            committer: {
              name: "You",
              email: "<you@example.com>",
              date: new Date().toISOString()
            },
            parents: ["abc1234"],
            branch: "feature/login"
          },
          {
            id: "ghi9012",
            type: "COMMIT",
            message: "Add dashboard feature", 
            author: {
              name: "You",
              email: "<you@example.com>",
              date: new Date().toISOString()
            },
            committer: {
              name: "You",
              email: "<you@example.com>",
              date: new Date().toISOString()
            },
            parents: ["abc1234"],
            branch: "feature/dashboard"
          }
        ],
        branches: [
          {
            name: "main",
            commitId: "abc1234"
          },
          {
            name: "feature/login", 
            commitId: "def5678"
          },
          {
            name: "feature/dashboard",
            commitId: "ghi9012"
          }
        ],
        tags: [],
        head: {
          type: "branch",
          ref: "main",
          commitId: "abc1234"
        },
      },
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
        content: 'Initialize a new Git repository',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Check the status of your repository',
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Make your first commit with a descriptive message',
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Check the status again to see the clean working tree',
        order: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Create a new branch for a feature',
        order: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'List all branches to see your new branch',
        order: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Switch to the new feature branch',
        order: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Make a commit on the feature branch',
        order: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Switch back to the main branch',
        order: 9,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Create and switch to a new branch using git switch -c',
        order: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Make a commit on this new branch',
        order: 11,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Switch back to main branch',
        order: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Clear the repository to start fresh',
        order: 13,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Verify the repository has been cleared',
        order: 14,
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
        content: 'Use git init to initialize a new repository',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Use git status to check repository state',
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Use git commit -m "message" to create commits',
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Use git branch to list all branches',
        order: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Use git branch <name> to create a new branch',
        order: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Use git checkout <branch> to switch branches',
        order: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Use git switch <branch> as alternative to checkout',
        order: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Use git switch -c <branch> to create and switch to new branch',
        order: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Use git clear to reset repository state',
        order: 9,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Remember to use descriptive commit messages',
        order: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Branch names should be descriptive and meaningful',
        order: 11,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        content: 'Always check git status to understand current state',
        order: 12,
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
        command: 'git init',
        order: 1,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'git status',
        order: 2,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'git commit -m "Initial commit"',
        order: 3,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'git status',
        order: 4,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'git branch feature/login',
        order: 5,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'git branch',
        order: 6,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'git checkout feature/login',
        order: 7,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'git commit -m "Add login feature"',
        order: 8,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'git checkout main',
        order: 9,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'git switch -c feature/dashboard',
        order: 10,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'git commit -m "Add dashboard feature"',
        order: 11,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'git switch main',
        order: 12,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'git clear',
        order: 13,
        isRequired: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        command: 'git status',
        order: 14,
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
        value: '12',
        message: 'You need to execute at least 12 commands to complete this practice',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        type: ValidationRuleType.REQUIRED_COMMANDS,
        value: 'git init,git status,git commit,git branch,git checkout,git switch,git clear',
        message: 'You must use all supported Git Engine commands: init, status, commit, branch, checkout, switch, clear',
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        type: ValidationRuleType.CUSTOM,
        value: '{"type": "commit_count", "expected": 3}',
        message: 'You must create exactly 3 commits during this practice',
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        type: ValidationRuleType.CUSTOM,
        value: '{"type": "branch_count", "expected": 3}',
        message: 'You must create at least 3 branches (including main)',
        order: 4,
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
        name: 'git-engine',
        color: '#2196F3',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        name: 'intermediate',
        color: '#FF9800',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        name: 'complete-workflow',
        color: '#4CAF50',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        name: 'branching',
        color: '#9C27B0',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        name: 'repository-management',
        color: '#F44336',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        practiceId: savedPractice.id,
        name: 'version-control',
        color: '#607D8B',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    await dataSource.getRepository(PracticeTag).save(tags);
    console.log(`✅ Created ${tags.length} tags`);

    console.log('\n🎉 Git Engine lesson seeding finished successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Lesson: ${savedLesson.title}`);
    console.log(`- Practice: ${savedPractice.title}`);
    console.log(`- Instructions: ${instructions.length}`);
    console.log(`- Hints: ${hints.length}`);
    console.log(`- Expected Commands: ${expectedCommands.length}`);
    console.log(`- Validation Rules: ${validationRules.length}`);
    console.log(`- Tags: ${tags.length}`);
    console.log('\n🚀 The lesson is now ready for students to learn Git Engine commands!');
    console.log('\n📋 Supported Commands Covered:');
    console.log('   ✅ git init - Initialize repository');
    console.log('   ✅ git status - Check repository state');
    console.log('   ✅ git commit - Create commits');
    console.log('   ✅ git branch - List and create branches');
    console.log('   ✅ git checkout - Switch branches');
    console.log('   ✅ git switch - Alternative branch switching');
    console.log('   ✅ git clear - Reset repository state');

  } catch (error) {
    console.error('💥 Seeding failed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding
seedGitEngineLesson().catch(error => {
  console.error('💥 Git Engine lesson seeding failed:', error);
  process.exit(1);
});
