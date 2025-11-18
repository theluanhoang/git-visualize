import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import React from 'react';
import api from '@/lib/api/axios';
import { IRepositoryState, GitCommandResponse } from '@/types/git';
import { PracticeRepoStateService } from '@/services/practiceRepositoryState';
import { LOCALSTORAGE_KEYS, localStorageHelpers } from '@/constants/localStorage';
import { gitKeys, terminalKeys } from '@/lib/react-query/query-keys';

const terminalKeyFor = (practiceId?: string, version?: number) => 
  practiceId ? LOCALSTORAGE_KEYS.GIT_ENGINE.TERMINAL_RESPONSES(practiceId, version) : LOCALSTORAGE_KEYS.GIT_ENGINE.TERMINAL_RESPONSES('global');

const saveTerminalResponses = (responses: GitCommandResponse[], practiceId?: string, version?: number) => {
  const key = terminalKeyFor(practiceId, version);
  localStorageHelpers.setJSON(key, responses);
};

const getTerminalResponses = (
  queryClient: ReturnType<typeof useQueryClient>,
  practiceId?: string,
  version?: number
): GitCommandResponse[] => {
  const versionedKey = terminalKeyFor(practiceId, version);
  const queryKey = terminalKeys.practice(practiceId);
  
  let responses = localStorageHelpers.getJSON<GitCommandResponse[]>(versionedKey, []);
  
  if (responses.length > 0) {
    return responses;
  }
  
  responses = queryClient.getQueryData<GitCommandResponse[]>(queryKey) || [];
  
  if (responses.length > 0) {
    return responses;
  }
  
  if (practiceId) {
    const legacyKey = LOCALSTORAGE_KEYS.GIT_ENGINE.TERMINAL_RESPONSES(practiceId);
    responses = localStorageHelpers.getJSON<GitCommandResponse[]>(legacyKey, []);
    
    if (responses.length > 0 && version !== undefined) {
      localStorageHelpers.setJSON(versionedKey, responses);
    }
  }
  
  return responses;
};

const updateTerminalResponsesCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  responses: GitCommandResponse[],
  practiceId?: string,
  version?: number
) => {
  const queryKey = terminalKeys.practice(practiceId);
  
  queryClient.setQueryData<GitCommandResponse[]>(queryKey, responses);
  
  saveTerminalResponses(responses, practiceId, version);
  
  if (practiceId === 'goal-builder') {
    queryClient.setQueryData(terminalKeys.goal, responses);
  }
};

const rebuildRepositoryStateFromResponses = (responses: GitCommandResponse[]): IRepositoryState | null => {
  if (!responses || responses.length === 0) {
    return null;
  }

  for (let i = responses.length - 1; i >= 0; i--) {
    const response = responses[i];
    if (response.repositoryState) {
      return response.repositoryState;
    }
  }

  return null;
};

export const gitEngineApi = {
  executeGitCommand: async (command: string, repositoryState?: IRepositoryState | null) => {
    const res = await api.post<GitCommandResponse>('/api/v1/git/execute', { command, repositoryState });
    return res.data;
  },
  getRepositoryState: async () => {
    const res = await api.get<IRepositoryState>('/api/v1/git/state');
    return res.data;
  },
  buildGoalRepositoryState: async (commands: string[]) => {
    let currentState: IRepositoryState | null = null;
    
    for (const command of commands) {
      try {
        const response = await gitEngineApi.executeGitCommand(command, currentState);
        if (response.repositoryState) {
          currentState = response.repositoryState;
        }
      } catch (error) {}
    }
    
    return { repositoryState: currentState };
  }
};

export const useExecuteGitCommand = (practiceId?: string, version?: number) => {
  const queryClient = useQueryClient();
  
  const practiceIdRef = useRef(practiceId);
  const versionRef = useRef(version);
  
  useEffect(() => {
    practiceIdRef.current = practiceId;
    versionRef.current = version;
  }, [practiceId, version]);
  
  return useMutation<GitCommandResponse, unknown, string>({
    mutationFn: (command: string) => {
      const currentPracticeId = practiceIdRef.current;
      const currentStateKey = gitKeys.state(currentPracticeId);
      const currentState = queryClient.getQueryData<IRepositoryState | null>(currentStateKey);
      
      if (currentState && command === 'git init') {
        queryClient.setQueryData(currentStateKey, null);
        return gitEngineApi.executeGitCommand(command, null);
      }
      
      return gitEngineApi.executeGitCommand(command, currentState ?? null);
    },
    onSuccess: (data, command) => {
      const currentPracticeId = practiceIdRef.current;
      const currentVersion = versionRef.current;
      const currentStateKey = gitKeys.state(currentPracticeId);
      const currentVersionKey = currentPracticeId ? ['git', 'state-version', currentPracticeId] as const : null;
      
      const oldResponses = getTerminalResponses(queryClient, currentPracticeId, currentVersion);
      
      const newResponse = { ...data, command };
      const newResponses = [...oldResponses, newResponse];
      
      updateTerminalResponsesCache(queryClient, newResponses, currentPracticeId, currentVersion);
      
      if (data.repositoryState) {
        queryClient.setQueryData(currentStateKey, data.repositoryState);
      }
      
      if (currentPracticeId && data.repositoryState && currentVersionKey) {
        const versionValue = queryClient.getQueryData<number>(currentVersionKey) || 0;
        PracticeRepoStateService.upsert(currentPracticeId, { state: data.repositoryState, version: versionValue })
          .then((res) => {
            queryClient.setQueryData(currentVersionKey, res.version);
          })
          .catch(() => {
          });
      }
    },
    onError: (error, command) => {
      const currentPracticeId = practiceIdRef.current;
      const currentVersion = versionRef.current;
      
      const errorResponse: GitCommandResponse = {
        success: false,
        output: error instanceof Error ? error.message : 'Unknown error',
        repositoryState: null,
        command,
      };
      
      const oldResponses = getTerminalResponses(queryClient, currentPracticeId, currentVersion);
      const newResponses = [...oldResponses, errorResponse];
      
      updateTerminalResponsesCache(queryClient, newResponses, currentPracticeId, currentVersion);
    },
  });
};

export const useRepositoryState = (practiceId?: string, version?: number) => {
  const queryClient = useQueryClient();
  
  const queryKey = useMemo(() => gitKeys.state(practiceId), [practiceId]);
  const versionKey = useMemo(() => practiceId ? ['git', 'state-version', practiceId] as const : null, [practiceId]);
  
  return useQuery<IRepositoryState | null>({
    queryKey,
    queryFn: async () => {
      if (practiceId) {
        const terminalResponses = getTerminalResponses(queryClient, practiceId, version);
        
        if (terminalResponses.length > 0) {
          const rebuiltState = rebuildRepositoryStateFromResponses(terminalResponses);
          if (rebuiltState) {
            let currentVersion = versionKey ? queryClient.getQueryData<number>(versionKey) : undefined;
            if (currentVersion === undefined && versionKey) {
              try {
                const server = await PracticeRepoStateService.get(practiceId);
                currentVersion = server.version;
                queryClient.setQueryData(versionKey, currentVersion);
              } catch {
                currentVersion = version ?? 0;
              }
            }
            
            if (versionKey && currentVersion !== undefined) {
              PracticeRepoStateService.upsert(practiceId, { state: rebuiltState, version: currentVersion })
                .then((res) => {
                  queryClient.setQueryData(versionKey, res.version);
                })
                .catch(() => {
                });
            }
            
            return rebuiltState;
          }
        }
        
        const server = await PracticeRepoStateService.get(practiceId);
        if (versionKey) {
          queryClient.setQueryData(versionKey, server.version);
        }
        return server.state;
      }
      return gitEngineApi.getRepositoryState();
    },
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false, 
    initialData: () => {
      if (practiceId) {
        const terminalResponses = getTerminalResponses(queryClient, practiceId, version);
        if (terminalResponses.length > 0) {
          return rebuildRepositoryStateFromResponses(terminalResponses);
        }
      }
      return queryClient.getQueryData<IRepositoryState | null>(queryKey) ?? null;
    },
  });
};

export const useTerminalResponses = (practiceId?: string, version?: number) => {
  const queryClient = useQueryClient();
  
  const queryKey = useMemo(() => terminalKeys.practice(practiceId), [practiceId]);
  
  const [data, setData] = useState<GitCommandResponse[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [hasBeenReset, setHasBeenReset] = useState(false);
  const prevPracticeIdRef = useRef<string | undefined>(practiceId);
  const prevVersionRef = useRef<number | undefined>(version);
  
  useEffect(() => {
    if (prevPracticeIdRef.current !== practiceId || prevVersionRef.current !== version) {
      setIsInitialized(false);
      setHasBeenReset(false);
      prevPracticeIdRef.current = practiceId;
      prevVersionRef.current = version;
    }
  }, [practiceId, version]);
  
  useEffect(() => {
    if (!isInitialized) {
      const savedResponses = getTerminalResponses(queryClient, practiceId, version);
      
      if (hasBeenReset) {
        setData([]);
        queryClient.setQueryData(queryKey, []);
      } else {
        setData(savedResponses);
        queryClient.setQueryData(queryKey, savedResponses);
      }
      setIsInitialized(true);
    }
  }, [queryClient, practiceId, version, isInitialized, resetKey, hasBeenReset, queryKey]);
  
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === 'updated' &&
        event.query.queryKey[0] === 'terminal-responses' &&
        event.query.queryKey[1] === (practiceId ?? 'global')
      ) {
        const newData = queryClient.getQueryData<GitCommandResponse[]>(queryKey) || [];
        setData((prevData) => {
          if (prevData.length !== newData.length) {
            return newData;
          }
          return prevData;
        });
      }
    });
    
    return unsubscribe;
  }, [queryClient, practiceId, queryKey]);
  
  const reset = useCallback(() => {
    setIsInitialized(false);
    setData([]);
    setHasBeenReset(true);
    setResetKey(prev => prev + 1);
  }, []);
  
  const refetch = useCallback(() => {
    const savedResponses = getTerminalResponses(queryClient, practiceId, version);
    queryClient.setQueryData(queryKey, savedResponses);
    setData(savedResponses);
  }, [queryClient, practiceId, version, queryKey]);

  return {
    data,
    isLoading: false,
    error: null,
    refetch,
    reset
  };
};

export const useGoalTerminalResponses = () => {
  const queryClient = useQueryClient();
  
  return useQuery<GitCommandResponse[]>({
    queryKey: terminalKeys.goal,
    queryFn: () => {
      const savedResponses = localStorageHelpers.getJSON<GitCommandResponse[]>(LOCALSTORAGE_KEYS.GIT_ENGINE.GOAL_TERMINAL_RESPONSES, []);
      return savedResponses;
    },
    initialData: [],
    staleTime: Infinity, 
    gcTime: Infinity,
  });
};

export const initializeAppData = (practiceId?: string) => {
  return localStorageHelpers.getJSON<GitCommandResponse[]>(terminalKeyFor(practiceId), []);
};

export const useBuildGoalRepositoryState = (commands: string[], enabled: boolean = true) => {
  return useQuery({
    queryKey: gitKeys.goalState(commands),
    queryFn: () => gitEngineApi.buildGoalRepositoryState(commands),
    enabled: enabled && commands.length > 0,
    staleTime: 5 * 60 * 1000, 
    gcTime: 10 * 60 * 1000, 
    retry: 1,
    retryDelay: 1000,
  });
};

export const useGitEngine = (practiceId?: string, version?: number) => {
  const { mutateAsync: runCommand, isPending: isRunning } = useExecuteGitCommand(practiceId, version);
  const { data: responses = [], reset: resetTerminalResponses } = useTerminalResponses(practiceId, version);
  const queryClient = useQueryClient();
  
  const stateKey = useMemo(() => gitKeys.state(practiceId), [practiceId]);
  const terminalKey = useMemo(() => terminalKeys.practice(practiceId), [practiceId]);
  const versionKey = useMemo(() => practiceId ? ['git', 'state-version', practiceId] as const : null, [practiceId]);
  const isGoalBuilder = useMemo(() => practiceId === 'goal-builder', [practiceId]);
  
  const syncFromServer = useCallback(async () => {
    if (!practiceId) return;
    
    try {
      const server = await PracticeRepoStateService.get(practiceId);
      const mockResponses: GitCommandResponse[] = server.state ? [
        {
          repositoryState: server.state,
          command: 'sync-from-server',
          success: true,
          output: 'Synchronized repository state from server'
        }
      ] : [];
      
      queryClient.setQueryData(stateKey, server.state);
      if (versionKey) {
        queryClient.setQueryData(versionKey, server.version || 0);
      }
      queryClient.setQueryData(terminalKey, mockResponses);
      
      localStorageHelpers.setJSON(LOCALSTORAGE_KEYS.GIT_ENGINE.TERMINAL_RESPONSES(practiceId), mockResponses);
    } catch (error) {}
  }, [practiceId, queryClient, stateKey, terminalKey, versionKey]);

  const clearAllData = useCallback(async () => {
    if (practiceId) {
      try {
        await PracticeRepoStateService.remove(practiceId);
      } catch (e) {}
    }

    if (practiceId && version) {
      localStorageHelpers.version.clearVersionedData(practiceId, version);
    } else {
      localStorageHelpers.removeItem(terminalKeyFor(practiceId));
      const commitGraphKey = practiceId 
        ? LOCALSTORAGE_KEYS.GIT_ENGINE.COMMIT_GRAPH_POSITIONS(practiceId)
        : LOCALSTORAGE_KEYS.GIT_ENGINE.COMMIT_GRAPH_POSITIONS('global');
      localStorageHelpers.removeItem(commitGraphKey);
    }
    localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.GIT_ENGINE.REPOSITORY_STATE);

    queryClient.setQueryData(terminalKey, []);
    queryClient.setQueryData(stateKey, null);
    
    if (isGoalBuilder) {
      queryClient.setQueryData(terminalKeys.goal, []);
    }
    
    if (versionKey) {
      queryClient.setQueryData(versionKey, 0);
    }
    
    queryClient.removeQueries({ queryKey: terminalKey });
    queryClient.removeQueries({ queryKey: stateKey });
    
    if (isGoalBuilder) {
      queryClient.removeQueries({ queryKey: terminalKeys.goal });
      queryClient.invalidateQueries({ queryKey: terminalKeys.goal });
    }
    
    resetTerminalResponses();
  }, [practiceId, version, queryClient, stateKey, terminalKey, versionKey, isGoalBuilder, resetTerminalResponses]);
  
  return { 
    responses, 
    runCommand, 
    isRunning, 
    clearAllData, 
    syncFromServer 
  };
};
