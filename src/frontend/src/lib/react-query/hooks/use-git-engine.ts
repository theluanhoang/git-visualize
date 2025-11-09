import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import api from '@/lib/api/axios';
import { IRepositoryState, GitCommandResponse } from '@/types/git';
import { PracticeRepoStateService } from '@/services/practiceRepositoryState';
import { LOCALSTORAGE_KEYS, localStorageHelpers } from '@/constants/localStorage';
import { gitKeys, terminalKeys, goalKeys } from '@/lib/react-query/query-keys';

const terminalKeyFor = (practiceId?: string, version?: number) => 
  practiceId ? LOCALSTORAGE_KEYS.GIT_ENGINE.TERMINAL_RESPONSES(practiceId, version) : LOCALSTORAGE_KEYS.GIT_ENGINE.TERMINAL_RESPONSES('global');

const saveTerminalResponses = (responses: GitCommandResponse[], practiceId?: string, version?: number) => {
  localStorageHelpers.setJSON(terminalKeyFor(practiceId, version), responses);
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
      } catch (error) {
        console.warn(`Failed to execute command "${command}":`, error);
      }
    }
    
    return { repositoryState: currentState };
  }
};

export const useExecuteGitCommand = (practiceId?: string, version?: number) => {
  const queryClient = useQueryClient();
  
  return useMutation<GitCommandResponse, unknown, string>({
    mutationFn: (command: string) => {
      const currentState = queryClient.getQueryData<IRepositoryState | null>(['git', 'state', practiceId ?? 'global']);
      
      if (currentState && command === 'git init') {
        queryClient.setQueryData(['git', 'state', practiceId ?? 'global'], null);
        return gitEngineApi.executeGitCommand(command, null);
      }
      
      return gitEngineApi.executeGitCommand(command, currentState ?? null);
    },
    onSuccess: (data, command) => {
      const key = terminalKeys.practice(practiceId);
      const oldResponses = queryClient.getQueryData<GitCommandResponse[]>(key) || [];
      const newResponses = [...oldResponses, { ...data, command }];
      
      queryClient.setQueryData<GitCommandResponse[]>(key, newResponses);
      
      if (practiceId === 'goal-builder') {
        queryClient.setQueryData(terminalKeys.goal, newResponses);
      }
      
      if (data.repositoryState) {
        queryClient.setQueryData(gitKeys.state(practiceId), data.repositoryState);
      }
      
      saveTerminalResponses(newResponses, practiceId, version);
      if (practiceId && data.repositoryState) {
        const currentVersion = queryClient.getQueryData<number>(['git', 'state-version', practiceId]) || 0;
        PracticeRepoStateService.upsert(practiceId, { state: data.repositoryState, version: currentVersion }).then((res) => {
          queryClient.setQueryData(['git', 'state-version', practiceId], res.version);
        }).catch((err) => {
          console.warn('Failed to upsert practice repo state:', err);
        });
      }
    },
    onError: (error, command) => {
      const errorResponse: GitCommandResponse = {
        success: false,
        output: error instanceof Error ? error.message : 'Unknown error',
        repositoryState: null,
        command,
      };
      const key = terminalKeys.practice(practiceId);
      const oldResponses = queryClient.getQueryData<GitCommandResponse[]>(key) || [];
      const newResponses = [...oldResponses, errorResponse];
      
      queryClient.setQueryData<GitCommandResponse[]>(key, newResponses);
      
      saveTerminalResponses(newResponses, practiceId, version);
    },
  });
};

export const useRepositoryState = (practiceId?: string) => {
  const queryClient = useQueryClient();
  return useQuery<IRepositoryState | null>({
    queryKey: gitKeys.state(practiceId),
    queryFn: async () => {
      if (practiceId) {
        const server = await PracticeRepoStateService.get(practiceId);
        queryClient.setQueryData(['git', 'state-version', practiceId], server.version);
        return server.state;
      }
      return gitEngineApi.getRepositoryState();
    },
  });
};

export const useTerminalResponses = (practiceId?: string, version?: number) => {
  const queryClient = useQueryClient();
  
  const [data, setData] = useState<GitCommandResponse[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [hasBeenReset, setHasBeenReset] = useState(false);
  
  useEffect(() => {
    if (!isInitialized) {
      let savedResponses = localStorageHelpers.getJSON<GitCommandResponse[]>(terminalKeyFor(practiceId, version), []);
      
      if (savedResponses.length === 0 && practiceId) {
        const legacyKey = LOCALSTORAGE_KEYS.GIT_ENGINE.TERMINAL_RESPONSES(practiceId);
        savedResponses = localStorageHelpers.getJSON<GitCommandResponse[]>(legacyKey, []);
        
        if (savedResponses.length > 0 && version) {
          localStorageHelpers.setJSON(terminalKeyFor(practiceId, version), savedResponses);
        }
      }
      
      if (hasBeenReset && savedResponses.length > 0) {
        setData([]);
        queryClient.setQueryData(terminalKeys.practice(practiceId), []);
      } else {
        setData(savedResponses);
        queryClient.setQueryData(terminalKeys.practice(practiceId), savedResponses);
      }
      setIsInitialized(true);
    }
  }, [queryClient, practiceId, version, isInitialized, resetKey, hasBeenReset]);
  
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.query.queryKey[0] === 'terminal-responses' && event.query.queryKey[1] === (practiceId ?? 'global')) {
        const key = terminalKeys.practice(practiceId);
        const newData = queryClient.getQueryData<GitCommandResponse[]>(key) || [];
        setData(newData);
      }
    });
    
    return unsubscribe;
  }, [queryClient, practiceId]);
  
  const reset = () => {
    setIsInitialized(false);
    setData([]);
    setHasBeenReset(true);
    setResetKey(prev => prev + 1);
  };

  return {
    data,
    isLoading: false,
    error: null,
    refetch: () => {
      const savedResponses = localStorageHelpers.getJSON<GitCommandResponse[]>(terminalKeyFor(practiceId, version), []);
      queryClient.setQueryData(terminalKeys.practice(practiceId), savedResponses);
      setData(savedResponses);
    },
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
  
  const syncFromServer = async () => {
    if (!practiceId) return;
    const server = await PracticeRepoStateService.get(practiceId);
    queryClient.setQueryData(gitKeys.state(practiceId), server.state);
    queryClient.setQueryData(['git', 'state-version', practiceId], server.version || 0);
    const mockResponses: GitCommandResponse[] = server.state ? [
      {
        repositoryState: server.state,
        command: 'sync-from-server',
        success: true,
        output: 'Synchronized repository state from server'
      }
    ] : [];
    queryClient.setQueryData(terminalKeys.practice(practiceId), mockResponses);
    localStorageHelpers.setJSON(LOCALSTORAGE_KEYS.GIT_ENGINE.TERMINAL_RESPONSES(practiceId), mockResponses);
  };

  const clearAllData = async () => {
    if (practiceId) {
      try {
        await PracticeRepoStateService.remove(practiceId);
      } catch (e) {
        console.warn('Practice repo state remove failed (continuing):', e);
      }
    }

    if (practiceId && version) {
      localStorageHelpers.version.clearVersionedData(practiceId, version);
    } else {
      localStorageHelpers.removeItem(terminalKeyFor(practiceId));
      localStorageHelpers.removeItem(practiceId ? LOCALSTORAGE_KEYS.GIT_ENGINE.COMMIT_GRAPH_POSITIONS(practiceId) : LOCALSTORAGE_KEYS.GIT_ENGINE.COMMIT_GRAPH_POSITIONS('global'));
    }
    
    localStorageHelpers.removeItem(LOCALSTORAGE_KEYS.GIT_ENGINE.REPOSITORY_STATE);

    queryClient.setQueryData(terminalKeys.practice(practiceId), []);
    queryClient.setQueryData(gitKeys.state(practiceId), null);
    
    if (practiceId === 'goal-builder') {
      queryClient.setQueryData(terminalKeys.goal, []);
    }
    
    if (practiceId) {
      queryClient.setQueryData(['git', 'state-version', practiceId], 0);
    }
    
    queryClient.removeQueries({ queryKey: terminalKeys.practice(practiceId) });
    queryClient.removeQueries({ queryKey: gitKeys.state(practiceId) });
    
    if (practiceId === 'goal-builder') {
      queryClient.removeQueries({ queryKey: terminalKeys.goal });
    }
    
    queryClient.setQueryData(gitKeys.state(practiceId), null);
    
    if (practiceId === 'goal-builder') {
      queryClient.setQueryData(terminalKeys.goal, []);
    }
    
    resetTerminalResponses();
    
    if (practiceId === 'goal-builder') {
      queryClient.invalidateQueries({ queryKey: terminalKeys.goal });
    }
  };
  
  return { responses, runCommand, isRunning, clearAllData, syncFromServer };
};
