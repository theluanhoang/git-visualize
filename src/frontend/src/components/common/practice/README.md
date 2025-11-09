# Practice Components

## Overview
This directory contains all the components for the Git practice system, integrated with the backend API.

## Components

### 1. PracticeSelector.tsx
**Purpose**: Main component for selecting and browsing available practices
**Features**:
- Search and filter practices
- Difficulty-based filtering
- View mode toggle (grid/list)
- Practice selection and details preview

**Props**:
```typescript
interface PracticeSelectorProps {
  onStartPractice?: (practice: Practice) => void;
}
```

### 2. PracticeList.tsx
**Purpose**: Displays a list of practices with filtering and selection
**Features**:
- Practice cards with metadata
- Difficulty badges
- View/completion statistics
- Click to select functionality

**Props**:
```typescript
interface PracticeListProps {
  practices: Practice[];
  onSelectPractice?: (practice: Practice) => void;
  selectedPracticeId?: string;
}
```

### 3. PracticeDetails.tsx
**Purpose**: Shows detailed information about a selected practice
**Features**:
- Complete practice information
- Instructions, hints, and expected commands
- Validation rules display
- Start practice button

**Props**:
```typescript
interface PracticeDetailsProps {
  practice: Practice;
  onStartPractice?: () => void;
}
```

## API Integration

### Services
- **PracticesService**: Handles all API calls to the backend
- **usePractices**: React Query hooks for data fetching
- **useIncrementViews/Completions**: Analytics tracking

### Data Flow
1. **Fetch Practices**: `usePractices()` → `PracticesService.getPractices()`
2. **Select Practice**: User clicks → `onSelectPractice()` callback
3. **Start Practice**: User clicks start → `onStartPractice()` callback
4. **Analytics**: Automatic view/completion tracking

## Usage Example

```tsx
import PracticeSelector from '@/components/common/practice/PracticeSelector';

function PracticePage() {
  const handleStartPractice = (practice: Practice) => {
    // Navigate to practice session
    console.log('Starting practice:', practice.title);
  };

  return (
    <PracticeSelector onStartPractice={handleStartPractice} />
  );
}
```

## Styling
All components use the existing design system:
- **Colors**: CSS variables for theming
- **Animations**: Framer Motion for smooth transitions
- **Layout**: Tailwind CSS with responsive design
- **Components**: Shadcn UI components

## Features

### Search & Filter
- Real-time search across title and scenario
- Difficulty-based filtering (Beginner/Intermediate/Advanced)
- Tag-based filtering (future enhancement)

### Practice Information
- **Title & Scenario**: Clear practice description
- **Difficulty**: Visual difficulty indicators
- **Time Estimation**: Expected completion time
- **Statistics**: Views and completion counts
- **Tags**: Categorization and filtering

### Instructions & Guidance
- **Step-by-step Instructions**: Ordered task list
- **Hints**: Helpful tips for users
- **Expected Commands**: Required Git commands
- **Validation Rules**: Success criteria

## Integration Points

### With Existing UI
- **Terminal Panel**: Existing terminal component
- **Commit Graph**: Existing graph visualization
- **Practice Tips**: Existing tips component
- **Staging Area**: Existing visualizer component

### With Backend API
- **GET /practices**: Fetch all practices
- **GET /practices?lessonSlug=**: Filter by lesson
- **GET /practices?difficulty=**: Filter by difficulty
- **POST /practices/:id/view**: Track views
- **POST /practices/:id/complete**: Track completions

## Future Enhancements

1. **Practice Progress**: Track user progress through steps
2. **Achievement System**: Badges and rewards
3. **Social Features**: Share progress, leaderboards
4. **Advanced Filtering**: More filter options
5. **Practice Analytics**: Detailed usage statistics
6. **Offline Support**: Practice without internet
7. **Custom Practices**: User-created content

## Error Handling

- **Loading States**: Spinner while fetching data
- **Empty States**: Friendly messages when no data
- **Error Boundaries**: Graceful error handling
- **Fallback UI**: Default content when data unavailable

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **Color Contrast**: WCAG compliant colors
- **Focus Management**: Clear focus indicators
- **Semantic HTML**: Proper HTML structure
