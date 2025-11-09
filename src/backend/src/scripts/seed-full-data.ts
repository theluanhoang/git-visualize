/**
 * Seed script for full data - Lessons and Practices
 * Creates comprehensive test data with matching relationships
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

async function seedFullData() {
    console.log('🌱 Starting full data seeding...\n');

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

        // Create Lessons
        console.log('\n📚 Creating lessons...');
        
        const lesson1 = dataSource.getRepository(Lesson).create({
            title: 'Git Basics - Introduction',
            description: 'Learn the fundamentals of Git version control',
            content: `# Git Basics - Introduction

## What is Git?
Git is a distributed version control system that tracks changes in files and coordinates work among multiple people.

## Key Concepts
- **Repository**: A collection of files and their history
- **Commit**: A snapshot of your files at a point in time
- **Branch**: A parallel version of your code
- **Merge**: Combining changes from different branches

## Basic Commands
- \`git init\` - Initialize a new repository
- \`git add\` - Stage files for commit
- \`git commit\` - Save changes to history
- \`git status\` - Check repository status

## Best Practices
1. Commit often with meaningful messages
2. Use branches for new features
3. Keep commits focused and atomic
4. Review changes before committing`,
            slug: 'git-basics-introduction',
            status: ELessonStatus.PUBLISHED,
            views: 0
        });

        const lesson2 = dataSource.getRepository(Lesson).create({
            title: 'Git Branching Strategies',
            description: 'Master different branching workflows and strategies',
            content: `# Git Branching Strategies

## Branching Models

### Git Flow
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/**: New feature development
- **release/**: Prepare new releases
- **hotfix/**: Critical bug fixes

### GitHub Flow
- **main**: Always deployable
- **feature/**: New features and fixes
- Simple and fast workflow

## Branching Commands
- \`git branch\` - List branches
- \`git checkout -b\` - Create and switch to new branch
- \`git merge\` - Combine branches
- \`git rebase\` - Replay commits

## Best Practices
1. Use descriptive branch names
2. Keep branches short-lived
3. Delete merged branches
4. Use pull requests for code review`,
            slug: 'git-branching-strategies',
            status: ELessonStatus.PUBLISHED,
            views: 0
        });

        const lesson3 = dataSource.getRepository(Lesson).create({
            title: 'Git Collaboration',
            description: 'Learn how to work with others using Git',
            content: `# Git Collaboration

## Working with Remote Repositories

### Remote Operations
- \`git clone\` - Copy a repository
- \`git fetch\` - Download changes
- \`git pull\` - Fetch and merge
- \`git push\` - Upload changes

### Collaboration Workflows
1. **Fork and Pull Request**: Contribute to open source
2. **Shared Repository**: Team collaboration
3. **Centralized Workflow**: Traditional approach

## Resolving Conflicts
- Identify conflicting files
- Edit files to resolve conflicts
- Stage resolved files
- Complete the merge

## Best Practices
1. Always pull before pushing
2. Use meaningful commit messages
3. Keep commits atomic
4. Communicate with team members`,
            slug: 'git-collaboration',
            status: ELessonStatus.PUBLISHED,
            views: 0
        });

        const savedLessons = await dataSource.getRepository(Lesson).save([lesson1, lesson2, lesson3]);
        console.log(`✅ Created ${savedLessons.length} lessons`);

        // Create Practices for Lesson 1: Git Basics
        console.log('\n🎯 Creating practices for Git Basics...');
        
        const practice1 = dataSource.getRepository(Practice).create({
            lessonId: savedLessons[0].id,
            title: 'Initialize Your First Repository',
            scenario: 'You are starting a new project and need to set up version control. Create a new Git repository and make your first commit.',
            difficulty: 1,
            estimatedTime: 10,
            isActive: true,
            order: 1,
            views: 0,
            completions: 0
        });

        const savedPractice1 = await dataSource.getRepository(Practice).save(practice1);

        // Instructions for Practice 1
        await dataSource.getRepository(PracticeInstruction).save([
            {
                practiceId: savedPractice1.id,
                content: 'Create a new directory for your project',
                order: 1
            },
            {
                practiceId: savedPractice1.id,
                content: 'Initialize a Git repository in the directory',
                order: 2
            },
            {
                practiceId: savedPractice1.id,
                content: 'Create a README.md file with project description',
                order: 3
            },
            {
                practiceId: savedPractice1.id,
                content: 'Add the README file to staging area',
                order: 4
            },
            {
                practiceId: savedPractice1.id,
                content: 'Make your first commit with a descriptive message',
                order: 5
            }
        ]);

        // Hints for Practice 1
        await dataSource.getRepository(PracticeHint).save([
            {
                practiceId: savedPractice1.id,
                content: 'Use mkdir command to create a directory',
                order: 1
            },
            {
                practiceId: savedPractice1.id,
                content: 'Use git init to initialize the repository',
                order: 2
            },
            {
                practiceId: savedPractice1.id,
                content: 'Use git add . to stage all files',
                order: 3
            }
        ]);

        // Expected Commands for Practice 1
        await dataSource.getRepository(PracticeExpectedCommand).save([
            {
                practiceId: savedPractice1.id,
                command: 'mkdir my-project',
                order: 1,
                isRequired: true
            },
            {
                practiceId: savedPractice1.id,
                command: 'cd my-project',
                order: 2,
                isRequired: true
            },
            {
                practiceId: savedPractice1.id,
                command: 'git init',
                order: 3,
                isRequired: true
            },
            {
                practiceId: savedPractice1.id,
                command: 'echo "# My Project" > README.md',
                order: 4,
                isRequired: true
            },
            {
                practiceId: savedPractice1.id,
                command: 'git add README.md',
                order: 5,
                isRequired: true
            },
            {
                practiceId: savedPractice1.id,
                command: 'git commit -m "Initial commit"',
                order: 6,
                isRequired: true
            }
        ]);

        // Validation Rules for Practice 1
        await dataSource.getRepository(PracticeValidationRule).save([
            {
                practiceId: savedPractice1.id,
                type: ValidationRuleType.MIN_COMMANDS,
                value: '4',
                message: 'You need to execute at least 4 commands',
                order: 1
            },
            {
                practiceId: savedPractice1.id,
                type: ValidationRuleType.REQUIRED_COMMANDS,
                value: 'git init,git add,git commit',
                message: 'You must use git init, git add, and git commit commands',
                order: 2
            }
        ]);

        // Tags for Practice 1
        await dataSource.getRepository(PracticeTag).save([
            {
                practiceId: savedPractice1.id,
                name: 'beginner',
                color: '#4CAF50'
            },
            {
                practiceId: savedPractice1.id,
                name: 'git-basics',
                color: '#2196F3'
            }
        ]);

        // Create Practice 2 for Lesson 1
        const practice2 = dataSource.getRepository(Practice).create({
            lessonId: savedLessons[0].id,
            title: 'Working with Files and Staging',
            scenario: 'You have multiple files in your project. Learn how to stage specific files and understand the difference between working directory, staging area, and repository.',
            difficulty: 2,
            estimatedTime: 15,
            isActive: true,
            order: 2,
            views: 0,
            completions: 0
        });

        const savedPractice2 = await dataSource.getRepository(Practice).save(practice2);

        // Instructions for Practice 2
        await dataSource.getRepository(PracticeInstruction).save([
            {
                practiceId: savedPractice2.id,
                content: 'Create multiple files in your project',
                order: 1
            },
            {
                practiceId: savedPractice2.id,
                content: 'Check the status of your repository',
                order: 2
            },
            {
                practiceId: savedPractice2.id,
                content: 'Stage only specific files (not all)',
                order: 3
            },
            {
                practiceId: savedPractice2.id,
                content: 'Check the status again to see the difference',
                order: 4
            },
            {
                practiceId: savedPractice2.id,
                content: 'Commit the staged files',
                order: 5
            }
        ]);

        // Expected Commands for Practice 2
        await dataSource.getRepository(PracticeExpectedCommand).save([
            {
                practiceId: savedPractice2.id,
                command: 'touch file1.txt file2.txt file3.txt',
                order: 1,
                isRequired: true
            },
            {
                practiceId: savedPractice2.id,
                command: 'git status',
                order: 2,
                isRequired: true
            },
            {
                practiceId: savedPractice2.id,
                command: 'git add file1.txt file2.txt',
                order: 3,
                isRequired: true
            },
            {
                practiceId: savedPractice2.id,
                command: 'git status',
                order: 4,
                isRequired: true
            },
            {
                practiceId: savedPractice2.id,
                command: 'git commit -m "Add file1 and file2"',
                order: 5,
                isRequired: true
            }
        ]);

        // Tags for Practice 2
        await dataSource.getRepository(PracticeTag).save([
            {
                practiceId: savedPractice2.id,
                name: 'intermediate',
                color: '#FF9800'
            },
            {
                practiceId: savedPractice2.id,
                name: 'staging',
                color: '#9C27B0'
            }
        ]);

        // Create Practices for Lesson 2: Git Branching
        console.log('\n🌿 Creating practices for Git Branching...');
        
        const practice3 = dataSource.getRepository(Practice).create({
            lessonId: savedLessons[1].id,
            title: 'Create and Switch Branches',
            scenario: 'You need to work on a new feature without affecting the main branch. Create a new branch and switch to it.',
            difficulty: 2,
            estimatedTime: 12,
            isActive: true,
            order: 1,
            views: 0,
            completions: 0
        });

        const savedPractice3 = await dataSource.getRepository(Practice).save(practice3);

        // Instructions for Practice 3
        await dataSource.getRepository(PracticeInstruction).save([
            {
                practiceId: savedPractice3.id,
                content: 'Check your current branch',
                order: 1
            },
            {
                practiceId: savedPractice3.id,
                content: 'Create a new branch for your feature',
                order: 2
            },
            {
                practiceId: savedPractice3.id,
                content: 'Switch to the new branch',
                order: 3
            },
            {
                practiceId: savedPractice3.id,
                content: 'Verify you are on the new branch',
                order: 4
            },
            {
                practiceId: savedPractice3.id,
                content: 'Make some changes and commit them',
                order: 5
            }
        ]);

        // Expected Commands for Practice 3
        await dataSource.getRepository(PracticeExpectedCommand).save([
            {
                practiceId: savedPractice3.id,
                command: 'git branch',
                order: 1,
                isRequired: true
            },
            {
                practiceId: savedPractice3.id,
                command: 'git checkout -b feature/new-feature',
                order: 2,
                isRequired: true
            },
            {
                practiceId: savedPractice3.id,
                command: 'git branch',
                order: 3,
                isRequired: true
            },
            {
                practiceId: savedPractice3.id,
                command: 'echo "New feature content" > feature.txt',
                order: 4,
                isRequired: true
            },
            {
                practiceId: savedPractice3.id,
                command: 'git add feature.txt',
                order: 5,
                isRequired: true
            },
            {
                practiceId: savedPractice3.id,
                command: 'git commit -m "Add new feature"',
                order: 6,
                isRequired: true
            }
        ]);

        // Tags for Practice 3
        await dataSource.getRepository(PracticeTag).save([
            {
                practiceId: savedPractice3.id,
                name: 'branching',
                color: '#E91E63'
            },
            {
                practiceId: savedPractice3.id,
                name: 'intermediate',
                color: '#FF9800'
            }
        ]);

        // Create Practice 4 for Lesson 2
        const practice4 = dataSource.getRepository(Practice).create({
            lessonId: savedLessons[1].id,
            title: 'Merge Branches',
            scenario: 'You have completed your feature branch and want to merge it back to the main branch.',
            difficulty: 3,
            estimatedTime: 20,
            isActive: true,
            order: 2,
            views: 0,
            completions: 0
        });

        const savedPractice4 = await dataSource.getRepository(Practice).save(practice4);

        // Instructions for Practice 4
        await dataSource.getRepository(PracticeInstruction).save([
            {
                practiceId: savedPractice4.id,
                content: 'Switch back to the main branch',
                order: 1
            },
            {
                practiceId: savedPractice4.id,
                content: 'Merge your feature branch into main',
                order: 2
            },
            {
                practiceId: savedPractice4.id,
                content: 'Verify the merge was successful',
                order: 3
            },
            {
                practiceId: savedPractice4.id,
                content: 'Delete the feature branch (optional)',
                order: 4
            }
        ]);

        // Expected Commands for Practice 4
        await dataSource.getRepository(PracticeExpectedCommand).save([
            {
                practiceId: savedPractice4.id,
                command: 'git checkout main',
                order: 1,
                isRequired: true
            },
            {
                practiceId: savedPractice4.id,
                command: 'git merge feature/new-feature',
                order: 2,
                isRequired: true
            },
            {
                practiceId: savedPractice4.id,
                command: 'git log --oneline',
                order: 3,
                isRequired: true
            },
            {
                practiceId: savedPractice4.id,
                command: 'git branch -d feature/new-feature',
                order: 4,
                isRequired: false
            }
        ]);

        // Tags for Practice 4
        await dataSource.getRepository(PracticeTag).save([
            {
                practiceId: savedPractice4.id,
                name: 'merging',
                color: '#3F51B5'
            },
            {
                practiceId: savedPractice4.id,
                name: 'advanced',
                color: '#F44336'
            }
        ]);

        // Create Practices for Lesson 3: Git Collaboration
        console.log('\n🤝 Creating practices for Git Collaboration...');
        
        const practice5 = dataSource.getRepository(Practice).create({
            lessonId: savedLessons[2].id,
            title: 'Clone and Contribute to a Repository',
            scenario: 'You want to contribute to an open source project. Clone the repository, make changes, and prepare for contribution.',
            difficulty: 3,
            estimatedTime: 25,
            isActive: true,
            order: 1,
            views: 0,
            completions: 0
        });

        const savedPractice5 = await dataSource.getRepository(Practice).save(practice5);

        // Instructions for Practice 5
        await dataSource.getRepository(PracticeInstruction).save([
            {
                practiceId: savedPractice5.id,
                content: 'Clone a repository from GitHub',
                order: 1
            },
            {
                practiceId: savedPractice5.id,
                content: 'Create a new branch for your contribution',
                order: 2
            },
            {
                practiceId: savedPractice5.id,
                content: 'Make your changes to the code',
                order: 3
            },
            {
                practiceId: savedPractice5.id,
                content: 'Stage and commit your changes',
                order: 4
            },
            {
                practiceId: savedPractice5.id,
                content: 'Push your branch to the remote repository',
                order: 5
            }
        ]);

        // Expected Commands for Practice 5
        await dataSource.getRepository(PracticeExpectedCommand).save([
            {
                practiceId: savedPractice5.id,
                command: 'git clone https://github.com/user/repo.git',
                order: 1,
                isRequired: true
            },
            {
                practiceId: savedPractice5.id,
                command: 'cd repo',
                order: 2,
                isRequired: true
            },
            {
                practiceId: savedPractice5.id,
                command: 'git checkout -b my-contribution',
                order: 3,
                isRequired: true
            },
            {
                practiceId: savedPractice5.id,
                command: 'echo "My contribution" >> README.md',
                order: 4,
                isRequired: true
            },
            {
                practiceId: savedPractice5.id,
                command: 'git add README.md',
                order: 5,
                isRequired: true
            },
            {
                practiceId: savedPractice5.id,
                command: 'git commit -m "Add my contribution"',
                order: 6,
                isRequired: true
            },
            {
                practiceId: savedPractice5.id,
                command: 'git push origin my-contribution',
                order: 7,
                isRequired: true
            }
        ]);

        // Tags for Practice 5
        await dataSource.getRepository(PracticeTag).save([
            {
                practiceId: savedPractice5.id,
                name: 'collaboration',
                color: '#607D8B'
            },
            {
                practiceId: savedPractice5.id,
                name: 'advanced',
                color: '#F44336'
            },
            {
                practiceId: savedPractice5.id,
                name: 'open-source',
                color: '#795548'
            }
        ]);

        console.log('\n🎉 Full data seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`✅ Created ${savedLessons.length} lessons`);
        console.log('✅ Created 5 comprehensive practices');
        console.log('✅ All relationships properly established');
        console.log('\n📚 Lessons created:');
        savedLessons.forEach((lesson, index) => {
            console.log(`   ${index + 1}. ${lesson.title} (${lesson.slug})`);
        });
        console.log('\n🎯 Practices created:');
        console.log('   1. Initialize Your First Repository (Beginner)');
        console.log('   2. Working with Files and Staging (Intermediate)');
        console.log('   3. Create and Switch Branches (Intermediate)');
        console.log('   4. Merge Branches (Advanced)');
        console.log('   5. Clone and Contribute to a Repository (Advanced)');

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    } finally {
        await dataSource.destroy();
        console.log('\n🔌 Database connection closed');
    }
}

// Run the seeding
if (require.main === module) {
    seedFullData()
        .then(() => {
            console.log('\n✨ Seeding completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Seeding failed:', error);
            process.exit(1);
        });
}

export { seedFullData };
