# React Query Keys

This directory contains centralized query keys for React Query to ensure consistency and easy maintenance.

## File Structure

- `query-keys.ts` - Centralized query keys definitions
- `hooks/` - Custom hooks that use the query keys

## Usage

### Import query keys

```typescript
import { practiceKeys, terminalKeys, gitKeys } from '@/lib/react-query/query-keys';
```

### Using query keys in hooks

```typescript
// Instead of hardcoded keys
const { data } = useQuery({
  queryKey: ['practices', 'detail', id],
  queryFn: () => PracticesService.getById(id),
});

// Use centralized keys
const { data } = useQuery({
  queryKey: practiceKeys.detail(id),
  queryFn: () => PracticesService.getById(id),
});
```

### Invalidation patterns

```typescript
// Invalidate all practices
queryClient.invalidateQueries({ queryKey: practiceKeys.all });

// Invalidate specific practice
queryClient.invalidateQueries({ queryKey: practiceKeys.detail(id) });

// Invalidate with parameters
queryClient.invalidateQueries({ queryKey: practiceKeys.list(params) });
```

## Available Query Key Groups

### Auth Keys
- `authKeys.all` - All auth related queries
- `authKeys.user()` - Current user query

### OAuth Keys
- `oauthKeys.all` - All OAuth related queries
- `oauthKeys.sessions.active()` - Active sessions
- `oauthKeys.sessions.oauth()` - OAuth sessions
- `oauthKeys.deviceInfo()` - Device information
- `oauthKeys.providerStatus()` - Provider status

### Lesson Keys
- `lessonKeys.all` - All lesson queries
- `lessonKeys.list(params?)` - Lesson list with optional params
- `lessonKeys.detail(id)` - Specific lesson detail
- `lessonKeys.admin.edit(slug)` - Admin lesson edit

### Practice Keys
- `practiceKeys.all` - All practice queries
- `practiceKeys.list(params?)` - Practice list with optional params
- `practiceKeys.detail(id)` - Specific practice detail

### Git Engine Keys
- `gitKeys.all` - All git related queries
- `gitKeys.state(practiceId?)` - Git state for practice
- `gitKeys.goalState(commands)` - Goal state for commands

### Terminal Keys
- `terminalKeys.all` - All terminal related queries
- `terminalKeys.practice(practiceId?)` - Terminal responses for practice
- `terminalKeys.goal` - Goal terminal responses

### Analytics Keys
- `analyticsKeys.all` - All analytics queries
- `analyticsKeys.dashboardStats()` - Dashboard statistics
- `analyticsKeys.recentLessons(limit)` - Recent lessons
- `analyticsKeys.users(query?)` - Users with optional query

### Settings Keys
- `settingsKeys.all` - All settings queries

### User Keys
- `userKeys.all` - All user queries
- `userKeys.list(params?)` - User list with optional params
- `userKeys.detail(id)` - Specific user detail

### Goal Keys
- `goalKeys.all` - All goal related queries
- `goalKeys.terminalResponses` - Goal terminal responses

## Common Patterns

### Batch Invalidation
```typescript
import { commonKeys } from '@/lib/react-query/query-keys';

// Invalidate all auth related queries
queryClient.invalidateQueries({ 
  queryKey: commonKeys.authRelated 
});

// Invalidate all lesson related queries
queryClient.invalidateQueries({ 
  queryKey: commonKeys.lessonRelated 
});
```

### Setting Query Data
```typescript
// Set specific practice data
queryClient.setQueryData(practiceKeys.detail(id), practiceData);

// Set goal terminal responses
queryClient.setQueryData(terminalKeys.goal, responses);
```

## Benefits

1. **Consistency** - All query keys follow the same pattern
2. **Type Safety** - TypeScript will catch typos and incorrect usage
3. **Easy Maintenance** - Change a key in one place, updates everywhere
4. **Discoverability** - Easy to find all available query keys
5. **Refactoring** - Safe to rename or restructure keys

## Adding New Query Keys

1. Add the new key to the appropriate group in `query-keys.ts`
2. Follow the existing naming convention
3. Use TypeScript `as const` for type safety
4. Update this README if adding new groups
5. Use the new keys in your hooks

## Migration Guide

When migrating existing hardcoded keys:

1. Find the hardcoded key: `['practices', 'detail', id]`
2. Replace with centralized key: `practiceKeys.detail(id)`
3. Import the key group: `import { practiceKeys } from '@/lib/react-query/query-keys'`
4. Test to ensure functionality remains the same
