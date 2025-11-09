/**
 * LocalStorage keys constants
 * Centralized management of all localStorage keys used in the application
 */

export const LOCALSTORAGE_KEYS = {
  // Authentication keys
  AUTH: {
    ACCESS_TOKEN: 'auth:access',
    REFRESH_TOKEN: 'auth:refresh',
    USER: 'auth:user',
    OAUTH_SESSION: 'auth:oauth-session',
  },

  // Git Engine keys
  GIT_ENGINE: {
    TERMINAL_RESPONSES: (practiceId: string, version?: number) => 
      version ? `git-terminal-responses:${practiceId}:v${version}` : `git-terminal-responses:${practiceId}`,
    COMMIT_GRAPH_POSITIONS: (practiceId: string, version?: number) => 
      version ? `git-commit-graph-node-positions:${practiceId}:v${version}` : `git-commit-graph-node-positions:${practiceId}`,
    GOAL_TERMINAL_RESPONSES: 'git-goal-terminal-responses',
    GOAL_COMMIT_GRAPH_POSITIONS: 'git-goal-commit-graph-node-positions',
    REPOSITORY_STATE: 'git-repository-state',
    VERSION_METADATA: (practiceId: string) => `git-version-metadata:${practiceId}`,
  },

  // Admin keys
  ADMIN: {
    WELCOME_DISMISSED: 'admin-welcome-dismissed',
  },
} as const;

/**
 * Helper functions for localStorage operations
 */
export const localStorageHelpers = {
  /**
   * Safely get item from localStorage
   */
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to get localStorage item:', error);
      return null;
    }
  },

  /**
   * Safely set item to localStorage
   */
  setItem: (key: string, value: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('Failed to set localStorage item:', error);
      return false;
    }
  },

  /**
   * Safely remove item from localStorage
   */
  removeItem: (key: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Failed to remove localStorage item:', error);
      return false;
    }
  },

  /**
   * Safely get JSON item from localStorage
   */
  getJSON: <T>(key: string, defaultValue: T): T => {
    const item = localStorageHelpers.getItem(key);
    if (!item) return defaultValue;
    try {
      return JSON.parse(item);
    } catch (error) {
      console.warn('Failed to parse localStorage JSON:', error);
      return defaultValue;
    }
  },

  /**
   * Safely set JSON item to localStorage
   */
  setJSON: (key: string, value: any): boolean => {
    try {
      return localStorageHelpers.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to stringify localStorage JSON:', error);
      return false;
    }
  },

  /**
   * Version management helpers
   */
  version: {
    /**
     * Save version metadata for a practice
     */
    saveVersion: (practiceId: string, version: number): boolean => {
      const key = LOCALSTORAGE_KEYS.GIT_ENGINE.VERSION_METADATA(practiceId);
      return localStorageHelpers.setJSON(key, { version, timestamp: Date.now() });
    },

    /**
     * Get saved version for a practice
     */
    getVersion: (practiceId: string): number | null => {
      const key = LOCALSTORAGE_KEYS.GIT_ENGINE.VERSION_METADATA(practiceId);
      const data = localStorageHelpers.getJSON<{ version: number; timestamp: number } | null>(key, null);
      return data?.version || null;
    },

    /**
     * Check if version has changed and needs reset
     */
    hasVersionChanged: (practiceId: string, currentVersion: number): boolean => {
      const savedVersion = localStorageHelpers.version.getVersion(practiceId);
      return savedVersion !== null && savedVersion !== currentVersion;
    },

    /**
     * Clear all versioned data for a practice
     */
    clearVersionedData: (practiceId: string, version?: number): void => {
      if (version) {
        localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.GIT_ENGINE.TERMINAL_RESPONSES(practiceId, version));
        localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.GIT_ENGINE.COMMIT_GRAPH_POSITIONS(practiceId, version));
      }
      
      localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.GIT_ENGINE.TERMINAL_RESPONSES(practiceId));
      localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.GIT_ENGINE.COMMIT_GRAPH_POSITIONS(practiceId));
      
      localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.GIT_ENGINE.VERSION_METADATA(practiceId));
    },
  },
} as const;

