export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
} as const;

export const oauthKeys = {
  all: ['oauth'] as const,
  sessions: {
    all: ['oauth', 'sessions'] as const,
    active: () => ['oauth', 'sessions', 'active'] as const,
    oauth: () => ['oauth', 'sessions', 'oauth'] as const,
  },
  deviceInfo: () => ['oauth', 'device-info'] as const,
  providerStatus: () => ['oauth', 'provider-status'] as const,
} as const;

export const lessonKeys = {
  all: ['lessons'] as const,
  lists: () => [...lessonKeys.all, 'list'] as const,
  list: (params?: any) => [...lessonKeys.lists(), params] as const,
  details: () => [...lessonKeys.all, 'detail'] as const,
  detail: (id: string) => [...lessonKeys.details(), id] as const,
  views: {
    all: () => [...lessonKeys.all, 'views'] as const,
    myViews: (params?: any) => [...lessonKeys.all, 'views', 'my', params] as const,
    stats: (lessonId: string) => [...lessonKeys.all, 'views', 'stats', lessonId] as const,
    hasViewed: (lessonId: string) => [...lessonKeys.all, 'views', 'has-viewed', lessonId] as const,
  },
  admin: {
    edit: (slug: string) => ['admin-lesson-edit', slug] as const,
  },
} as const;

export const practiceKeys = {
  all: ['practices'] as const,
  lists: () => [...practiceKeys.all, 'list'] as const,
  list: (params?: any) => [...practiceKeys.lists(), params] as const,
  details: () => [...practiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...practiceKeys.details(), id] as const,
} as const;

export const gitKeys = {
  all: ['git'] as const,
  state: (practiceId?: string) => [...gitKeys.all, 'state', practiceId ?? 'global'] as const,
  goalState: (commands: string[]) => [...gitKeys.all, 'goal-state', commands] as const,
} as const;

export const terminalKeys = {
  all: ['terminal-responses'] as const,
  practice: (practiceId?: string) => [...terminalKeys.all, practiceId ?? 'global'] as const,
  goal: ['goal-terminal-responses'] as const,
} as const;

export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboardStats: () => [...analyticsKeys.all, 'dashboard-stats'] as const,
  recentLessons: (limit: number) => [...analyticsKeys.all, 'recent-lessons', limit] as const,
  users: (query?: any) => [...analyticsKeys.all, 'users', query] as const,
} as const;

export const settingsKeys = {
  all: ['settings'] as const,
} as const;

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: any) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
} as const;

export const goalKeys = {
  all: ['goal'] as const,
  terminalResponses: ['goal-terminal-responses'] as const,
} as const;

export const commonKeys = {
  authRelated: [
    ...authKeys.all,
    ...oauthKeys.all,
  ],
  
  lessonRelated: [
    ...lessonKeys.all,
    ...practiceKeys.all,
  ],
  
  practiceRelated: [
    ...practiceKeys.all,
    ...terminalKeys.all,
    ...gitKeys.all,
  ],
} as const;
