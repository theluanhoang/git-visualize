'use client';

import CommitGraph from '../CommitGraph';
import { useMemo } from 'react';
import { GitCommandResponse, IRepositoryState } from '@/types/git';
import { Commit } from './useGitDemo';

interface CommitGraphPreviewProps {
  commits: Commit[];
  repositoryState: IRepositoryState | null;
}

export default function CommitGraphPreview({ commits, repositoryState }: CommitGraphPreviewProps) {
  const customResponses = useMemo<GitCommandResponse[]>(() => {
    if (!repositoryState || repositoryState.commits.length === 0) {
      return [];
    }

    return repositoryState.commits.map((commit, index) => {
      const commitsUpTo = repositoryState.commits.slice(0, index + 1);
      
      const incrementalState: IRepositoryState = {
        ...repositoryState,
        commits: commitsUpTo,
        head: {
          type: 'branch',
          ref: commit.branch,
          commitId: commit.id
        },
        branches: Array.from(new Set(commitsUpTo.map(c => c.branch))).map(branch => {
          const branchCommits = commitsUpTo.filter(c => c.branch === branch);
          return {
            name: branch,
            commitId: branchCommits.length > 0 ? branchCommits[branchCommits.length - 1].id : ''
          };
        })
      };

      return {
        success: true,
        output: `[${commit.branch} ${commit.id.substring(0, 7)}] ${commit.message}`,
        repositoryState: incrementalState,
        command: `git commit -m "${commit.message}"`
      };
    });
  }, [repositoryState]);

  return (
    <CommitGraph
      dataSource="goal"
      customResponses={customResponses}
      goalRepositoryState={repositoryState || undefined}
      showClearButton={false}
      title="Commit Graph"
      className="w-full h-full"
      isResetting={false}
      initialZoom={0.4}
    />
  );
}
