# Full Data Seeding Guide

## Overview
This guide explains how to use the comprehensive data seeding system that creates both lessons and practices with proper relationships.

## Files Created

### 1. `seed-full-data.ts`
- **Purpose**: Main seeding script that creates comprehensive test data
- **Creates**: 3 lessons + 5 practices with full relationships
- **Features**: Complete data with instructions, hints, expected commands, validation rules, and tags

### 2. `run-full-seed.ts`
- **Purpose**: Wrapper script to run the full seeding process
- **Usage**: `npm run seed:full`

### 3. `test-full-api.ts`
- **Purpose**: Comprehensive API testing with the seeded data
- **Usage**: `npm run test:full-api`

## Data Structure

### Lessons Created
1. **Git Basics - Introduction** (`git-basics-introduction`)
   - Beginner-friendly introduction to Git
   - Covers basic concepts and commands
   - 2 practices attached

2. **Git Branching Strategies** (`git-branching-strategies`)
   - Advanced branching concepts
   - Different workflow models
   - 2 practices attached

3. **Git Collaboration** (`git-collaboration`)
   - Working with remote repositories
   - Team collaboration workflows
   - 1 practice attached

### Practices Created
1. **Initialize Your First Repository** (Beginner)
   - Learn basic Git setup
   - First commit experience
   - Tags: `beginner`, `git-basics`

2. **Working with Files and Staging** (Intermediate)
   - File management and staging
   - Understanding Git workflow
   - Tags: `intermediate`, `staging`

3. **Create and Switch Branches** (Intermediate)
   - Branch creation and switching
   - Feature development workflow
   - Tags: `branching`, `intermediate`

4. **Merge Branches** (Advanced)
   - Branch merging techniques
   - Conflict resolution
   - Tags: `merging`, `advanced`

5. **Clone and Contribute to a Repository** (Advanced)
   - Open source contribution
   - Remote repository workflow
   - Tags: `collaboration`, `advanced`, `open-source`

## Usage Instructions

### 1. Start the Backend Server
```bash
cd backend
npm run start:dev
```

### 2. Run Full Data Seeding
```bash
npm run seed:full
```

### 3. Test the API
```bash
npm run test:full-api
```

## API Endpoints to Test

### Lessons
- `GET /lesson` - Get all lessons
- `GET /lesson?includePractices=true` - Get lessons with practices

### Practices
- `GET /practices` - Get all practices
- `GET /practices?lessonSlug=git-basics-introduction` - Get practices by lesson
- `GET /practices?difficulty=1` - Get beginner practices
- `GET /practices?includeRelations=true` - Get practices with full relations
- `GET /practices?id=<practice-id>` - Get specific practice

### Analytics
- `POST /practices/<id>/view` - Increment view count
- `POST /practices/<id>/complete` - Increment completion count

## Data Relationships

### Lesson → Practice
- Each lesson can have multiple practices
- Practices are linked via `lessonId`
- Proper foreign key relationships

### Practice → Related Entities
- **Instructions**: Step-by-step guidance
- **Hints**: Helpful tips for users
- **Expected Commands**: Required commands to execute
- **Validation Rules**: Success criteria
- **Tags**: Categorization and filtering

## Expected Results

After running the seeding:

1. **Database Tables**: All tables created with proper relationships
2. **3 Lessons**: Complete with content and metadata
3. **5 Practices**: Full-featured with all related data
4. **API Functionality**: All endpoints working correctly
5. **Data Integrity**: Proper foreign key relationships maintained

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`

2. **Table Creation Error**
   - Ensure `synchronize: true` in database config
   - Check entity imports in modules

3. **API Test Failures**
   - Ensure backend server is running on port 8001
   - Check if seeding completed successfully

### Verification Steps

1. Check database tables exist:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. Verify data was inserted:
   ```sql
   SELECT COUNT(*) FROM lesson;
   SELECT COUNT(*) FROM practice;
   ```

3. Test API endpoints manually:
   ```bash
   curl http://localhost:8001/lesson
   curl http://localhost:8001/practices
   ```

## Next Steps

After successful seeding:

1. **Frontend Integration**: Use the API endpoints in your frontend
2. **Custom Data**: Modify the seed script to add your own data
3. **Production Setup**: Use migrations for production deployment
4. **Testing**: Add unit tests for the API endpoints

## Scripts Available

- `npm run seed:full` - Run full data seeding
- `npm run test:full-api` - Test all API endpoints
- `npm run start:dev` - Start development server
- `npm run lint` - Check code quality

## Data Quality

The seeded data includes:
- ✅ Realistic Git scenarios
- ✅ Progressive difficulty levels
- ✅ Complete instruction sets
- ✅ Proper validation rules
- ✅ Meaningful tags and categories
- ✅ Proper relationships between entities
- ✅ Analytics tracking capabilities
