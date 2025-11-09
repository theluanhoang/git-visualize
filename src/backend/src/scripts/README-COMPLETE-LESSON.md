# Complete Lesson Seeding

## Overview

This script creates a comprehensive, production-ready lesson with complete practice content for testing the entire system.

## What's Included

### 📚 Lesson: "Git Fundamentals: Complete Guide"
- **Title**: Git Fundamentals: Complete Guide
- **Slug**: git-fundamentals-complete-guide
- **Status**: PUBLISHED (ready for students)
- **Content**: Comprehensive Git tutorial covering:
  - What is Git and why use it
  - Key concepts (repository, commit, branch, etc.)
  - Basic workflow
  - Essential commands
  - Best practices
  - Common workflows

### 🏋️ Practice: "Git Repository Setup and First Commit"
- **Difficulty**: Beginner (1/5)
- **Estimated Time**: 15 minutes
- **Scenario**: Complete Git setup from scratch
- **Instructions**: 8 step-by-step instructions
- **Hints**: 8 helpful hints for each step
- **Expected Commands**: 8 required Git commands
- **Validation Rules**: 3 validation rules
- **Tags**: 4 descriptive tags

## Data Structure

### Lesson Content
- Rich markdown content with proper formatting
- Professional structure with sections and subsections
- Code examples and best practices
- Clear learning objectives

### Practice Components
1. **Instructions** (8 steps):
   - Create project directory
   - Navigate to directory
   - Initialize Git repository
   - Create README file
   - Check repository status
   - Stage files
   - Make first commit
   - Verify commit

2. **Hints** (8 hints):
   - Command suggestions for each step
   - Helpful tips and shortcuts
   - Common mistakes to avoid

3. **Expected Commands** (8 commands):
   - `mkdir my-git-project`
   - `cd my-git-project`
   - `git init`
   - `echo "# My Git Project" > README.md`
   - `git status`
   - `git add README.md`
   - `git commit -m "Initial commit: Add README"`
   - `git log --oneline`

4. **Validation Rules** (3 rules):
   - Minimum 6 commands required
   - Must use git init, git add, git commit
   - Must create exactly 1 commit

5. **Tags** (4 tags):
   - `git-basics` (blue)
   - `beginner` (green)
   - `repository-setup` (orange)
   - `first-commit` (purple)

## Usage

### Run the Seeding Script
```bash
# From backend directory
yarn run seed:complete
```

### What Happens
1. **Database Cleanup**: Clears all existing data
2. **Lesson Creation**: Creates the complete lesson
3. **Practice Creation**: Creates the comprehensive practice
4. **Related Data**: Creates all instructions, hints, commands, validation rules, and tags
5. **Verification**: Shows summary of created data

### Expected Output
```
🌱 Starting complete lesson seeding...

✅ Database connected
🧹 Clearing existing data...
✅ Existing data cleared
📚 Creating complete lesson...
✅ Lesson created: Git Fundamentals: Complete Guide (ID: 1)
🏋️ Creating comprehensive practice...
✅ Practice created: Git Repository Setup and First Commit (ID: 1)
📋 Creating step-by-step instructions...
✅ Created 8 instructions
💡 Creating helpful hints...
✅ Created 8 hints
⌨️ Creating expected commands...
✅ Created 8 expected commands
✅ Creating validation rules...
✅ Created 3 validation rules
🏷️ Creating tags...
✅ Created 4 tags

🎉 Complete lesson seeding finished successfully!

📊 Summary:
- Lesson: Git Fundamentals: Complete Guide
- Practice: Git Repository Setup and First Commit
- Instructions: 8
- Hints: 8
- Expected Commands: 8
- Validation Rules: 3
- Tags: 4

🚀 The lesson is now ready for students to learn and practice!
```

## Testing the System

### 1. Check Lesson API
```bash
curl http://localhost:8001/api/v1/lesson?includePractices=true
```

### 2. Check Practice API
```bash
curl http://localhost:8001/api/v1/practices?lessonSlug=git-fundamentals-complete-guide
```

### 3. Test Frontend
1. Start frontend: `cd frontend && npm run dev`
2. Navigate to: `http://localhost:3000/git-theory/git-fundamentals-complete-guide`
3. Click "Vào phòng thực hành"
4. Test the practice session

## Sample Data

The complete data structure is available in `complete-lesson-sample.json` for reference.

## Quality Assurance

This lesson and practice are designed to be:
- ✅ **Complete**: All required fields populated
- ✅ **Realistic**: Real-world Git scenario
- ✅ **Educational**: Proper learning progression
- ✅ **Testable**: Can be completed by students
- ✅ **Professional**: Production-ready content
- ✅ **Comprehensive**: Tests all system features

## Next Steps

After running this script, you can:
1. Test the complete learning experience
2. Verify all UI components work correctly
3. Check data persistence and API responses
4. Identify any issues or improvements needed
5. Use as a template for creating more lessons

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure PostgreSQL is running
2. **Port Conflicts**: Check if port 8001 is available
3. **Dependencies**: Run `yarn install` if needed
4. **Permissions**: Ensure database user has proper permissions

### Reset Data
To clear and reseed:
```bash
yarn run seed:complete
```

This will clear all existing data and create fresh test data.
