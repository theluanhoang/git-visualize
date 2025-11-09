# Complete System Testing Guide

## Overview

This guide provides comprehensive testing instructions for the Git Visualization Engine system, including backend APIs and frontend integration.

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
yarn run start:dev
```

### 2. Seed Complete Data
```bash
cd backend
yarn run seed:complete
```

### 3. Test Backend APIs
```bash
cd backend
yarn run test:complete
```

### 4. Start Frontend
```bash
cd frontend
npm run dev
```

## 📊 Test Data Overview

### Lesson: "Git Fundamentals: Complete Guide"
- **Status**: PUBLISHED (ready for students)
- **Content**: Comprehensive Git tutorial
- **Slug**: `git-fundamentals-complete-guide`

### Practice: "Git Repository Setup and First Commit"
- **Difficulty**: Beginner (1/5)
- **Time**: 15 minutes
- **Components**:
  - 8 step-by-step instructions
  - 8 helpful hints
  - 8 expected commands
  - 3 validation rules
  - 4 descriptive tags

## 🧪 Backend Testing

### Available Scripts

| Script | Description |
|--------|-------------|
| `yarn run seed:complete` | Create complete lesson + practice |
| `yarn run test:complete` | Test all APIs and data integrity |
| `yarn run seed:full` | Create multiple lessons + practices |
| `yarn run test:full-api` | Test with multiple data sets |

### API Endpoints Tested

#### Lessons
- `GET /api/v1/lesson?includePractices=true` - Get lesson with practices
- `GET /api/v1/lesson?slug=git-fundamentals-complete-guide` - Get specific lesson

#### Practices
- `GET /api/v1/practices?lessonSlug=git-fundamentals-complete-guide` - Get practices by lesson
- `GET /api/v1/practices?id={practiceId}` - Get specific practice
- `POST /api/v1/practices/{id}/view` - Increment views
- `POST /api/v1/practices/{id}/complete` - Increment completions

### Expected Test Results

```
🧪 Testing Complete System...

1️⃣ Testing lesson API with practices...
✅ Lesson: Git Fundamentals: Complete Guide
✅ Slug: git-fundamentals-complete-guide
✅ Status: PUBLISHED
✅ Practices: 1

2️⃣ Testing practices API by lesson slug...
✅ Found 1 practices
✅ Instructions: 8
✅ Hints: 8
✅ Expected Commands: 8
✅ Validation Rules: 3
✅ Tags: 4

3️⃣ Testing individual practice details...
✅ Practice ID: [UUID]
✅ Scenario: [Complete scenario description]
✅ Active: true

4️⃣ Testing practice instructions...
📋 Instructions:
   1. Create a new directory for your project
   2. Navigate into the project directory
   ... (8 total)

5️⃣ Testing practice hints...
💡 Hints:
   1. Use mkdir command to create a directory
   2. Use cd command to navigate into directories
   ... (8 total)

6️⃣ Testing expected commands...
⌨️ Expected Commands:
   1. mkdir my-git-project (Required)
   2. cd my-git-project (Required)
   ... (8 total)

7️⃣ Testing validation rules...
✅ Validation Rules:
   1. min_commands: 6 - [Description]
   2. required_commands: git init,git add,git commit - [Description]
   3. custom: {"type": "commit_count", "expected": 1} - [Description]

8️⃣ Testing practice tags...
🏷️ Tags:
   1. git-basics (#2196F3)
   2. beginner (#4CAF50)
   3. repository-setup (#FF9800)
   4. first-commit (#9C27B0)

9️⃣ Testing analytics endpoints...
✅ Incremented practice views
✅ Incremented practice completions

🎉 All tests passed! System is working correctly.
```

## 🎯 Frontend Testing

### 1. Lesson Page
Navigate to: `http://localhost:3000/git-theory/git-fundamentals-complete-guide`

**Expected**:
- Lesson content displays correctly
- "Vào phòng thực hành" button is visible
- Practice information is shown

### 2. Practice Page
Navigate to: `http://localhost:3000/practice?lesson=git-fundamentals-complete-guide`

**Expected**:
- Practice selector shows the practice
- Practice details are displayed
- "Start Practice" button works

### 3. Practice Session
Click "Start Practice"

**Expected**:
- Terminal and commit graph are displayed
- Practice sidebar shows instructions
- "Need Help?" button shows hints
- All practice data is loaded correctly

## 🔍 Manual Testing Checklist

### Backend APIs
- [ ] Lesson API returns correct data
- [ ] Practice API returns complete practice data
- [ ] Analytics endpoints work (views/completions)
- [ ] All relationships are loaded correctly
- [ ] Error handling works properly

### Frontend Integration
- [ ] Lesson page displays correctly
- [ ] Practice selection works
- [ ] Practice session loads all data
- [ ] Terminal and commit graph render
- [ ] Sidebar shows instructions and hints
- [ ] Navigation between pages works
- [ ] Responsive design works on different screen sizes

### Data Integrity
- [ ] All practice components are loaded
- [ ] Instructions are in correct order
- [ ] Hints are helpful and relevant
- [ ] Expected commands are accurate
- [ ] Validation rules make sense
- [ ] Tags are descriptive and colorful

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`

2. **API 404 Errors**
   - Verify backend is running on port 8001
   - Check API endpoint URLs

3. **Frontend Build Errors**
   - Run `npm install` in frontend directory
   - Check for missing dependencies

4. **Data Not Loading**
   - Run `yarn run seed:complete` to create test data
   - Check database tables exist

### Debug Commands

```bash
# Check backend status
curl http://localhost:8001/api/v1/lesson

# Check database connection
cd backend && yarn run typeorm:datasource

# View database tables
psql -h localhost -U your_username -d your_database -c "\dt"

# Reset and reseed data
cd backend && yarn run seed:complete
```

## 📈 Performance Testing

### Load Testing
- Test with multiple concurrent requests
- Monitor database performance
- Check memory usage

### Frontend Performance
- Test page load times
- Check bundle sizes
- Monitor rendering performance

## 🎉 Success Criteria

The system is working correctly when:

1. ✅ All backend APIs return expected data
2. ✅ Frontend displays all components correctly
3. ✅ Practice session is fully functional
4. ✅ Data persistence works across page reloads
5. ✅ All user interactions work smoothly
6. ✅ No console errors or warnings
7. ✅ Responsive design works on all devices

## 📝 Next Steps

After successful testing:

1. Create additional lessons and practices
2. Implement advanced Git scenarios
3. Add more validation rules
4. Enhance UI/UX based on feedback
5. Add user authentication and progress tracking
6. Implement advanced analytics

## 📞 Support

If you encounter issues:

1. Check the console for error messages
2. Verify all services are running
3. Check database connectivity
4. Review the API responses
5. Test with the provided scripts

The system is designed to be robust and user-friendly. All components should work together seamlessly to provide an excellent learning experience.
