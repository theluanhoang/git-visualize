import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { GitCommandResponse, IRepositoryState } from '@/types/git';
import { PracticeFormData } from '@/lib/schemas/practice';
import { terminalKeys } from '@/lib/react-query/query-keys';
import { LOCALSTORAGE_KEYS, localStorageHelpers } from '@/constants/localStorage';
import {
  sortCommandsByOrder,
  filterGitCommands,
  rebuildRepositoryStateFromCommands,
  createMockResponsesFromCommands,
} from '@/lib/utils/repository-state-builder';

interface UsePracticeFormStateOptions {
  goalBuilderId: string;
  practiceId?: string;
  initialData?: Partial<PracticeFormData>;
  goalResponses: GitCommandResponse[];
}

export const usePracticeFormState = ({
  goalBuilderId,
  practiceId,
  initialData,
  goalResponses,
}: UsePracticeFormStateOptions) => {
  const queryClient = useQueryClient();
  const [goalPreviewState, setGoalPreviewState] = useState<IRepositoryState | null>(() => {
    return initialData?.goalRepositoryState || null;
  });
  const [resetKey, setResetKey] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasBeenReset, setHasBeenReset] = useState(false);
  const prevPracticeIdRef = useRef(practiceId);

  const cacheKey = terminalKeys.practice(goalBuilderId);
  const localStorageKey = goalBuilderId
    ? LOCALSTORAGE_KEYS.GIT_ENGINE.TERMINAL_RESPONSES(goalBuilderId)
    : LOCALSTORAGE_KEYS.GIT_ENGINE.TERMINAL_RESPONSES('global');

  useEffect(() => {
    if (initialData?.goalRepositoryState && !goalPreviewState && !isResetting && !hasBeenReset) {
      setGoalPreviewState(initialData.goalRepositoryState);
    }
  }, [initialData?.goalRepositoryState, goalPreviewState, isResetting, hasBeenReset]);

  useEffect(() => {
    if (!hasBeenReset) {
      const last = goalResponses[goalResponses.length - 1];
      if (last?.repositoryState) {
        setGoalPreviewState(last.repositoryState);
      }
    }
  }, [goalResponses, hasBeenReset]);

  useEffect(() => {
    if (isInitialized) return;

    if (!practiceId) {
      const currentCache = queryClient.getQueryData<GitCommandResponse[]>(cacheKey) || [];
      
      if (currentCache.length === 0) {
        queryClient.setQueryData(cacheKey, []);
        queryClient.setQueryData(['git', 'state', goalBuilderId], null);
        try {
          localStorageHelpers.removeItem(localStorageKey);
          localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.GIT_ENGINE.COMMIT_GRAPH_POSITIONS(goalBuilderId));
        } catch (error) {}
      }

      if (initialData?.expectedCommands && initialData.expectedCommands.length > 0 && initialData) {
        initializeFromExpectedCommands(initialData);
      } else {
        setGoalPreviewState(null);
      }

      setIsInitialized(true);
      return;
    }

    if (initialData?.goalRepositoryState) {
      const cachedResponses = queryClient.getQueryData<GitCommandResponse[]>(cacheKey) || [];
      const storedResponses = localStorageHelpers.getJSON<GitCommandResponse[]>(localStorageKey, []);

      const shouldRebuildFromInitialData =
        cachedResponses.length === 0 &&
        storedResponses.length === 0 &&
        initialData.expectedCommands &&
        initialData.expectedCommands.length > 0;

      if (shouldRebuildFromInitialData) {
        rebuildFromInitialData(initialData);
      } else {
        restoreFromCache(cachedResponses, storedResponses, initialData);
      }
    } else {
      if (initialData) {
        handleNoGoalState(initialData);
      }
    }

    setIsInitialized(true);
  }, [
    initialData?.goalRepositoryState,
    initialData?.expectedCommands,
    isInitialized,
    queryClient,
    goalBuilderId,
    practiceId,
    cacheKey,
    localStorageKey,
  ]);

  const initializeFromExpectedCommands = useCallback(
    async (data: Partial<PracticeFormData>) => {
      const goalState = data.goalRepositoryState || null;
      if (goalState) {
        queryClient.setQueryData(['git', 'state', goalBuilderId], goalState);
        setGoalPreviewState(goalState);
      }

      const sortedCommands = sortCommandsByOrder(data.expectedCommands || []);
      const gitCommands = filterGitCommands(sortedCommands);

      if (gitCommands.length > 0) {
        try {
          const { responses, finalState } = await rebuildRepositoryStateFromCommands(sortedCommands);
          queryClient.setQueryData(cacheKey, responses);
          if (finalState) {
            queryClient.setQueryData(['git', 'state', goalBuilderId], finalState);
            setGoalPreviewState(finalState);
          }
          localStorageHelpers.setJSON(localStorageKey, responses);
        } catch (error) {
          const mockResponses = createMockResponsesFromCommands(sortedCommands, goalState);
          queryClient.setQueryData(cacheKey, mockResponses);
          if (goalState) {
            queryClient.setQueryData(['git', 'state', goalBuilderId], goalState);
            setGoalPreviewState(goalState);
          }
          localStorageHelpers.setJSON(localStorageKey, mockResponses);
        }
      } else {
        setGoalPreviewState(goalState);
      }
    },
    [goalBuilderId, cacheKey, localStorageKey, queryClient]
  );

  const rebuildFromInitialData = useCallback(
    async (data: Partial<PracticeFormData>) => {
      const goalState = data.goalRepositoryState;
      if (!goalState) return;

      queryClient.setQueryData(['git', 'state', goalBuilderId], goalState);
      setGoalPreviewState(goalState);

      const expectedCommands = data.expectedCommands || [];
      if (expectedCommands.length === 0) return;

      const sortedCommands = sortCommandsByOrder(expectedCommands);
      const gitCommands = filterGitCommands(sortedCommands);

      if (gitCommands.length > 0) {
        try {
          const { responses, finalState } = await rebuildRepositoryStateFromCommands(sortedCommands);
          queryClient.setQueryData(cacheKey, responses);
          if (finalState) {
            queryClient.setQueryData(['git', 'state', goalBuilderId], finalState);
            setGoalPreviewState(finalState);
          }
          localStorageHelpers.setJSON(localStorageKey, responses);
        } catch (error) {
          const mockResponses = createMockResponsesFromCommands(sortedCommands, goalState);
          queryClient.setQueryData(cacheKey, mockResponses);
          localStorageHelpers.setJSON(localStorageKey, mockResponses);
        }
      } else {
        const mockResponses = createMockResponsesFromCommands(sortedCommands, goalState);
        queryClient.setQueryData(cacheKey, mockResponses);
        localStorageHelpers.setJSON(localStorageKey, mockResponses);
      }
    },
    [goalBuilderId, cacheKey, localStorageKey, queryClient]
  );

  const restoreFromCache = useCallback(
    (
      cachedResponses: GitCommandResponse[],
      storedResponses: GitCommandResponse[],
      data: Partial<PracticeFormData>
    ) => {
      const existingResponses = cachedResponses.length > 0 ? cachedResponses : storedResponses;

      if (existingResponses.length > 0) {
        queryClient.setQueryData(cacheKey, existingResponses);
        const lastResponse = existingResponses[existingResponses.length - 1];

        if (lastResponse?.repositoryState) {
          setGoalPreviewState(lastResponse.repositoryState);
          queryClient.setQueryData(['git', 'state', goalBuilderId], lastResponse.repositoryState);
        } else if (data.goalRepositoryState) {
          setGoalPreviewState(data.goalRepositoryState);
          queryClient.setQueryData(['git', 'state', goalBuilderId], data.goalRepositoryState);
        }
      }
    },
    [goalBuilderId, cacheKey, queryClient]
  );

  const handleNoGoalState = useCallback(
    async (data: Partial<PracticeFormData>) => {
      if (data?.expectedCommands && data.expectedCommands.length > 0) {
        const sortedCommands = sortCommandsByOrder(data.expectedCommands);
        const gitCommands = filterGitCommands(sortedCommands);

        if (gitCommands.length > 0) {
          try {
            const { responses, finalState } = await rebuildRepositoryStateFromCommands(sortedCommands);
            queryClient.setQueryData(cacheKey, responses);
            if (finalState) {
              queryClient.setQueryData(['git', 'state', goalBuilderId], finalState);
              setGoalPreviewState(finalState);
            }
            localStorageHelpers.setJSON(localStorageKey, responses);
          } catch (error) {}
        }
      } else {
        queryClient.setQueryData(cacheKey, []);
        queryClient.setQueryData(['git', 'state', goalBuilderId], null);
        try {
          localStorageHelpers.removeItem(localStorageKey);
          localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.GIT_ENGINE.COMMIT_GRAPH_POSITIONS(goalBuilderId));
        } catch (error) {}
        setGoalPreviewState(null);
      }
    },
    [goalBuilderId, cacheKey, localStorageKey, queryClient]
  );

  useEffect(() => {
    const prevPracticeId = prevPracticeIdRef.current;

    if (prevPracticeId !== practiceId && !initialData?.goalRepositoryState) {
      if (!practiceId) {
        const currentCache = queryClient.getQueryData<GitCommandResponse[]>(cacheKey) || [];
        
        if (currentCache.length === 0) {
          setGoalPreviewState(null);
          queryClient.setQueryData(terminalKeys.goal, []);
          queryClient.setQueryData(cacheKey, []);
          queryClient.setQueryData(['git', 'state', goalBuilderId], null);
          setIsInitialized(false);
          setResetKey((prev) => prev + 1);
        }

        try {
          localStorageHelpers.removeItem(localStorageKey);
          localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.GIT_ENGINE.COMMIT_GRAPH_POSITIONS(goalBuilderId));
          localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.GIT_ENGINE.GOAL_COMMIT_GRAPH_POSITIONS);
          localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.GIT_ENGINE.GOAL_TERMINAL_RESPONSES);
        } catch (error) {}
      }

      prevPracticeIdRef.current = practiceId;
    }
  }, [practiceId, initialData?.goalRepositoryState, queryClient, goalBuilderId, cacheKey, localStorageKey]);

  useEffect(() => {
    return () => {
      const shouldClear = !practiceId && !initialData?.goalRepositoryState;
      const currentCache = queryClient.getQueryData<GitCommandResponse[]>(cacheKey) || [];

      if (shouldClear && currentCache.length === 0) {
        queryClient.setQueryData(terminalKeys.goal, []);
        queryClient.setQueryData(cacheKey, []);
        queryClient.setQueryData(['git', 'state', goalBuilderId], null);
      }
    };
  }, [practiceId, initialData?.goalRepositoryState, queryClient, goalBuilderId, cacheKey]);

  useEffect(() => {
    if (goalPreviewState === null) {
      queryClient.setQueryData(terminalKeys.goal, []);
    }
  }, [goalPreviewState, queryClient]);

  const resetGoalBuilder = useCallback(async (clearAllData: () => Promise<void>) => {
    setIsResetting(true);
    setHasBeenReset(true);

    try {
      localStorageHelpers.removeItem(localStorageKey);
      localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.GIT_ENGINE.COMMIT_GRAPH_POSITIONS(goalBuilderId));
      localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.GIT_ENGINE.GOAL_COMMIT_GRAPH_POSITIONS);
      localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.GIT_ENGINE.GOAL_TERMINAL_RESPONSES);
    } catch (error) {}

    await clearAllData();

    setGoalPreviewState(null);
    queryClient.setQueryData(terminalKeys.goal, []);
    queryClient.setQueryData(cacheKey, []);
    queryClient.setQueryData(['git', 'state', goalBuilderId], null);
    queryClient.removeQueries({ queryKey: ['git', 'state', goalBuilderId] });

    setResetKey((prev) => prev + 1);
    setIsInitialized(false);

    requestAnimationFrame(() => {
      if (typeof window !== 'undefined') {
        const resetFunction = (window as Window & { resetGoalCommitGraphView?: () => void }).resetGoalCommitGraphView;
        if (resetFunction && typeof resetFunction === 'function') {
          resetFunction();
        }
      }
      setIsResetting(false);
    });
  }, [goalBuilderId, cacheKey, localStorageKey, queryClient]);

  return {
    goalPreviewState,
    resetKey,
    isResetting,
    resetGoalBuilder,
  };
};

