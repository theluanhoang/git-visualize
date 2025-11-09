# Practice Module

Module quản lý nội dung thực hành cho các bài học Git.

## 🏗️ Cấu trúc

### Entities
- **Practice**: Entity chính chứa thông tin cơ bản về practice
- **PracticeInstruction**: Các hướng dẫn thực hành
- **PracticeHint**: Gợi ý cho người học
- **PracticeExpectedCommand**: Các lệnh Git mong đợi
- **PracticeValidationRule**: Quy tắc validation
- **PracticeTag**: Tags phân loại practice

### API Endpoints

#### Practice Endpoints
- `GET /practices` - **Unified endpoint** với flexible filtering:
  - `?id=uuid` - Lấy practice theo ID (trả về single practice)
  - `?lessonId=uuid` - Lấy practices theo lesson ID
  - `?lessonSlug=slug` - Lấy practices theo lesson slug
  - `?isActive=true` - Lọc theo trạng thái active
  - `?difficulty=3` - Lọc theo độ khó
  - `?tag=beginner` - Lọc theo tag
  - `?q=search` - Tìm kiếm trong title, scenario
  - `?includeRelations=false` - Bỏ qua relations để tăng performance
  - `?limit=20&offset=0` - Pagination
- `POST /practices` - Tạo practice mới
- `PUT /practices/:id` - Cập nhật practice
- `DELETE /practices/:id` - Xóa practice (soft delete)
- `POST /practices/:id/view` - Tăng view count
- `POST /practices/:id/complete` - Tăng completion count

#### Lesson Integration
- `GET /lesson?slug=:slug&includePractices=true` - Lấy lesson với practice content (sử dụng getLessons method với includePractices parameter)

**Ví dụ sử dụng API mới:**

```bash
# 1. Lấy tất cả practices
GET /practices

# 2. Lấy practice theo ID
GET /practices?id=uuid-here

# 3. Lấy practices theo lesson slug
GET /practices?lessonSlug=gioi-thieu-ve-git&isActive=true

# 4. Lấy practices theo lesson ID
GET /practices?lessonId=uuid-here

# 5. Tìm kiếm practices
GET /practices?q=git&difficulty=2

# 6. Lấy practices theo tag
GET /practices?tag=beginner

# 7. Pagination
GET /practices?limit=10&offset=20

# 8. Performance optimization (không load relations)
GET /practices?includeRelations=false

# 9. Lấy lesson với practices
GET /lesson?slug=gioi-thieu-ve-git&includePractices=true

# Response (TypeScript types):
{
  "data": [
    {
      "id": "uuid",
      "title": "Giới thiệu về Git",
      "slug": "gioi-thieu-ve-git",
      "description": "Bài học cơ bản về Git",
      "content": "Nội dung bài học...",
      "practices": [
        {
          "id": "uuid",
          "title": "Practice 1",
          "instructions": [...],
          "hints": [...],
          "expectedCommands": [...],
          "validationRules": [...],
          "tags": [...]
        }
      ]
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

**TypeScript Types (Generic & Smart):**
```typescript
// Import types
import { 
  GetLessonsResponse, 
  LessonWithPractices,
  lessonHasPractices,
  responseHasPractices
} from './types';

// Generic type - smart and flexible
const response: GetLessonsResponse<Lesson | LessonWithPractices> = await getLessons({ 
  includePractices: true 
});

// Type-safe usage with type guards
if (responseHasPractices(response)) {
  // TypeScript knows this is GetLessonsResponse<LessonWithPractices>
  const lesson = response.data[0];
  console.log(lesson.practices.length); // Type-safe access!
  lesson.practices.forEach(practice => {
    console.log(practice.title); // Type-safe access!
  });
}

// Or check individual lessons
response.data.forEach(lesson => {
  if (lessonHasPractices(lesson)) {
    console.log(lesson.practices.length); // Type-safe!
  }
});
```

## 🚀 Setup

### 1. Chạy Migration
```bash
npm run migration:run
```

### 2. Seed Data
```bash
npm run setup:practice
```

## 📝 Example Usage

### Tạo Practice mới
```typescript
const practiceData = {
  lessonId: "lesson-uuid",
  title: "Git Basics Practice",
  scenario: "Learn basic Git commands...",
  difficulty: 1,
  estimatedTime: 15,
  instructions: [
    { content: "Initialize a Git repository", order: 0 },
    { content: "Create a README file", order: 1 }
  ],
  hints: [
    { content: "Use git init command", order: 0 }
  ],
  expectedCommands: [
    { command: "git init", order: 0, isRequired: true },
    { command: "echo 'Hello' > README.md", order: 1, isRequired: true }
  ],
  validationRules: [
    { 
      type: "min_commands", 
      value: "2", 
      message: "You need at least 2 commands" 
    }
  ],
  tags: [
    { name: "beginner", color: "#22c55e" }
  ]
};
```

### Lấy Practice theo Lesson Slug
```typescript
const response = await fetch('/lesson/gioi-thieu-ve-git/practice');
const data = await response.json();
// data.lesson: thông tin lesson
// data.practices: array các practices
```

## 🔧 Validation Rules

### Types
- `min_commands`: Số lệnh tối thiểu
- `required_commands`: Các lệnh bắt buộc (JSON array)
- `expected_graph_state`: Trạng thái graph mong đợi (JSON object)
- `custom`: Quy tắc tùy chỉnh

### Example Validation Rules
```json
[
  {
    "type": "min_commands",
    "value": "3",
    "message": "You need at least 3 commands"
  },
  {
    "type": "required_commands", 
    "value": "[\"git init\", \"git add\", \"git commit\"]",
    "message": "You must use git init, git add, and git commit"
  },
  {
    "type": "expected_graph_state",
    "value": "{\"commits\": 2, \"branches\": 1}",
    "message": "Final state should have 2 commits and 1 branch"
  }
]
```

## 📊 Database Schema

### Practice Table
- `id`: UUID primary key
- `lessonId`: Foreign key to lesson
- `title`: Practice title
- `scenario`: Practice description
- `difficulty`: 1-5 scale
- `estimatedTime`: Minutes
- `isActive`: Boolean
- `order`: Sort order
- `views`: View count
- `completions`: Completion count

### Related Tables
- `practice_instruction`: Instructions with order
- `practice_hint`: Hints with order  
- `practice_expected_command`: Expected commands with order and required flag
- `practice_validation_rule`: Validation rules with type and value
- `practice_tag`: Tags with name and color

## 🎯 Features

- ✅ **Separate Entities**: Mỗi loại dữ liệu có entity riêng
- ✅ **Relationships**: Proper foreign key relationships
- ✅ **Validation**: Comprehensive validation rules
- ✅ **Ordering**: Support for ordered lists
- ✅ **Soft Delete**: Soft delete for data integrity
- ✅ **Analytics**: View and completion tracking
- ✅ **Search**: Full-text search support
- ✅ **Pagination**: Built-in pagination
