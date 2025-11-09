'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { IRepositoryState, ICommit, ETypeGitObject, GitCommandResponse } from '@/types/git';
import { TerminalLine } from '../terminal/Terminal';

// Re-export for backward compatibility
export type { TerminalLine };

export interface Commit {
  id: string;
  message: string;
  branch: string;
  x: number;
  y: number;
  color: string;
  timestamp: number;
}

export interface GitDemoState {
  terminalLines: TerminalLine[];
  commits: Commit[];
  activeBranch: string;
  currentStep: number;
  repositoryState: IRepositoryState | null;
}


const DEMO_STEPS = [
  // Step 0: git init
  { 
    terminal: { type: 'command' as const, text: 'git init' },
    commit: null,
    branch: 'main'
  },
  {
    terminal: { type: 'output' as const, text: 'Initialized empty Git repository' },
    commit: null,
    branch: 'main'
  },
  // Step 2: git add
  {
    terminal: { type: 'command' as const, text: 'git add .' },
    commit: null,
    branch: 'main'
  },
  {
    terminal: { type: 'output' as const, text: '' },
    commit: null,
    branch: 'main'
  },
  // Step 4: First commit
  {
    terminal: { type: 'command' as const, text: 'git commit -m "Initial commit"' },
    commit: null,
    branch: 'main'
  },
  {
    terminal: { type: 'success' as const, text: '[main (root-commit) abc1234] Initial commit' },
    commit: { 
      id: 'c1', 
      message: 'Initial commit', 
      branch: 'main', 
      x: 50, 
      y: 20, 
      color: '#3b82f6' 
    },
    branch: 'main'
  },
  // Step 6: Second commit on main
  {
    terminal: { type: 'command' as const, text: 'git commit -m "Add features"' },
    commit: null,
    branch: 'main'
  },
  {
    terminal: { type: 'success' as const, text: '[main abc1235] Add features' },
    commit: { 
      id: 'c2', 
      message: 'Add features', 
      branch: 'main', 
      x: 50, 
      y: 40, 
      color: '#3b82f6' 
    },
    branch: 'main'
  },
  // Step 8: Create branch
  {
    terminal: { type: 'command' as const, text: 'git branch feature' },
    commit: null,
    branch: 'main'
  },
  {
    terminal: { type: 'output' as const, text: '' },
    commit: null,
    branch: 'main'
  },
  // Step 10: Checkout feature
  {
    terminal: { type: 'command' as const, text: 'git checkout feature' },
    commit: null,
    branch: 'feature'
  },
  {
    terminal: { type: 'success' as const, text: 'Switched to branch \'feature\'' },
    commit: null,
    branch: 'feature'
  },
  // Step 12: Commit on feature (starts from main branch at y:40)
  {
    terminal: { type: 'command' as const, text: 'git commit -m "Feature work"' },
    commit: null,
    branch: 'feature'
  },
  {
    terminal: { type: 'success' as const, text: '[feature abc1236] Feature work' },
    commit: { 
      id: 'c3', 
      message: 'Feature work', 
      branch: 'feature', 
      x: 60, 
      y: 50, 
      color: '#10b981' 
    },
    branch: 'feature'
  },
  // Step 14: Another commit on feature
  {
    terminal: { type: 'command' as const, text: 'git commit -m "More features"' },
    commit: null,
    branch: 'feature'
  },
  {
    terminal: { type: 'success' as const, text: '[feature abc1237] More features' },
    commit: { 
      id: 'c4', 
      message: 'More features', 
      branch: 'feature', 
      x: 60, 
      y: 70, 
      color: '#10b981' 
    },
    branch: 'feature'
  },
];

const buildRepositoryState = (commits: Commit[], activeBranch: string): IRepositoryState => {
  const now = new Date();
  const iCommits: ICommit[] = commits.map((commit, index) => {
    let parentId: string | null = null;
    
    if (commit.branch === 'main') {
      const mainCommits = commits.filter(c => c.branch === 'main');
      const currentMainIndex = mainCommits.findIndex(c => c.id === commit.id);
      if (currentMainIndex > 0) {
        parentId = mainCommits[currentMainIndex - 1].id;
      }
    } else if (commit.branch === 'feature') {
      const featureCommits = commits.filter(c => c.branch === 'feature');
      const currentFeatureIndex = featureCommits.findIndex(c => c.id === commit.id);
      
      if (currentFeatureIndex === 0) {
        const mainCommits = commits.filter(c => c.branch === 'main');
        if (mainCommits.length > 0) {
          parentId = mainCommits[mainCommits.length - 1].id;
        }
      } else {
        parentId = featureCommits[currentFeatureIndex - 1].id;
      }
    }
    
    return {
      id: commit.id,
      type: ETypeGitObject.COMMIT,
      message: commit.message,
      branch: commit.branch,
      parents: parentId ? [parentId] : [],
      committer: {
        name: 'Demo User',
        email: 'demo@example.com',
        date: new Date(now.getTime() + index * 1000)
      },
      author: {
        name: 'Demo User',
        email: 'demo@example.com',
        date: new Date(now.getTime() + index * 1000)
      },
      tree: commit.id + 'tree'
    };
  });

  const lastCommit = iCommits.length > 0 ? iCommits[iCommits.length - 1] : null;
  const lastCommitOnBranch = iCommits.filter(c => c.branch === activeBranch);
  const headCommitId = lastCommitOnBranch.length > 0 
    ? lastCommitOnBranch[lastCommitOnBranch.length - 1].id 
    : lastCommit?.id || null;

  return {
    commits: iCommits,
    branches: Array.from(new Set(iCommits.map(c => c.branch))).map(branch => ({
      name: branch,
      commitId: iCommits.filter(c => c.branch === branch).pop()?.id || ''
    })),
    tags: [],
    head: headCommitId ? {
      type: 'branch',
      ref: activeBranch,
      commitId: headCommitId
    } : null,
    workingDirectory: [],
    stagingArea: [],
    stagedDeletions: [],
    repositoryFiles: []
  };
};

export function useGitDemo() {
  const [state, setState] = useState<GitDemoState>({
    terminalLines: [],
    commits: [],
    activeBranch: 'main',
    currentStep: 0,
    repositoryState: null,
  });

  const stepRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    setState({
      terminalLines: [],
      commits: [],
      activeBranch: 'main',
      currentStep: 0,
      repositoryState: null,
    });
    stepRef.current = 0;
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const currentStep = stepRef.current;
      if (currentStep < DEMO_STEPS.length) {
        const step = DEMO_STEPS[currentStep];
        const timestamp = Date.now();

        setState(prev => {
          const newTerminalLines = [...prev.terminalLines, { ...step.terminal, timestamp }];
          const newCommits = step.commit 
            ? [...prev.commits, { ...step.commit, timestamp }]
            : prev.commits;

          const repositoryState = buildRepositoryState(newCommits, step.branch);

          return {
            terminalLines: newTerminalLines,
            commits: newCommits,
            activeBranch: step.branch,
            currentStep: currentStep + 1,
            repositoryState,
          };
        });

        stepRef.current = currentStep + 1;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        timeoutRef.current = setTimeout(() => {
          setState({
            terminalLines: [],
            commits: [],
            activeBranch: 'main',
            currentStep: 0,
            repositoryState: null,
          });
          stepRef.current = 0;
          start();
        }, 3000);
      }
    }, 600);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [reset]);

  useEffect(() => {
    start();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [start]);

  return state;
}

