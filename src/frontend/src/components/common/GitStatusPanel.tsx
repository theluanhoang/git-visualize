import React, { useMemo } from 'react';
import { IRepositoryState, FileStatus, IFileState } from '@/types/git';
import { GitBranch, FilePlus, FileMinus, FileX, FileCheck } from 'lucide-react';

interface GitStatusPanelProps {
  repositoryState: IRepositoryState | null;
  className?: string;
}

function GitStatusPanel({ repositoryState, className = '' }: GitStatusPanelProps) {
  const status = useMemo(() => {
    if (!repositoryState) {
      return {
        staged: [],
        unstagedModified: [],
        unstagedDeleted: [],
        untracked: [],
        hasChanges: false
      };
    }

    const workingDir = repositoryState.workingDirectory || [];
    const stagingArea = repositoryState.stagingArea || [];
    const stagingSet = new Set(stagingArea);

    const staged: IFileState[] = [];
    const unstagedModified: IFileState[] = [];
    const unstagedDeleted: IFileState[] = [];
    const untracked: IFileState[] = [];

    for (const file of workingDir) {
      if (stagingSet.has(file.path)) {
        staged.push(file);
        continue;
      }

      if (file.status === FileStatus.MODIFIED) {
        unstagedModified.push(file);
      } else if (file.status === FileStatus.DELETED) {
        unstagedDeleted.push(file);
      } else if (file.status === FileStatus.UNTRACKED) {
        untracked.push(file);
      }
    }

    const hasChanges = staged.length > 0 || unstagedModified.length > 0 || 
                      unstagedDeleted.length > 0 || untracked.length > 0;

    return {
      staged,
      unstagedModified,
      unstagedDeleted,
      untracked,
      hasChanges
    };
  }, [repositoryState]);

  if (!repositoryState) {
    return null;
  }

  const head = repositoryState.head;
  const branchName = head && head.type === "branch" ? head.ref : "(detached HEAD)";

  return (
    <div className={`bg-terminal-bg border border-border rounded-lg overflow-hidden flex flex-col flex-1 ${className}`}>
      <div className="px-3 py-2 bg-terminal-header border-b border-border shrink-0">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <GitBranch size={14} />
          <span className="truncate">{branchName}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Staged Changes */}
        {status.staged.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 text-xs font-medium text-green-600 dark:text-green-400">
              <FileCheck size={12} />
              <span>Staged ({status.staged.length})</span>
            </div>
            <div className="ml-4 space-y-0.5">
              {status.staged.map((file) => (
                <div
                  key={file.path}
                  className="text-xs text-muted-foreground flex items-center gap-1.5 truncate"
                  title={file.path}
                >
                  {file.status === FileStatus.DELETED ? (
                    <>
                      <FileX size={10} className="text-red-500 shrink-0" />
                      <span className="line-through truncate">deleted: {file.path}</span>
                    </>
                  ) : (
                    <>
                      <FilePlus size={10} className="text-green-500 shrink-0" />
                      <span className="truncate">{file.path}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unstaged Changes */}
        {(status.unstagedModified.length > 0 || status.unstagedDeleted.length > 0) && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
              <FileMinus size={12} />
              <span>Unstaged</span>
            </div>
            <div className="ml-4 space-y-0.5">
              {status.unstagedModified.map((file) => (
                <div
                  key={file.path}
                  className="text-xs text-muted-foreground flex items-center gap-1.5 truncate"
                  title={file.path}
                >
                  <FileMinus size={10} className="text-yellow-500 shrink-0" />
                  <span className="truncate">{file.path}</span>
                </div>
              ))}
              {status.unstagedDeleted.map((file) => (
                <div
                  key={file.path}
                  className="text-xs text-muted-foreground flex items-center gap-1.5 truncate"
                  title={file.path}
                >
                  <FileX size={10} className="text-red-500 shrink-0" />
                  <span className="truncate">{file.path}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Untracked Files */}
        {status.untracked.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
              <FilePlus size={12} />
              <span>Untracked ({status.untracked.length})</span>
            </div>
            <div className="ml-4 space-y-0.5">
              {status.untracked.map((file) => (
                <div
                  key={file.path}
                  className="text-xs text-muted-foreground flex items-center gap-1.5 truncate"
                  title={file.path}
                >
                  <FilePlus size={10} className="text-blue-500 shrink-0" />
                  <span className="truncate">{file.path}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Changes */}
        {!status.hasChanges && (
          <div className="text-xs text-muted-foreground text-center py-3">
            {repositoryState.commits.length === 0 
              ? "No commits yet"
              : "Clean"}
          </div>
        )}
      </div>
    </div>
  );
}

export default GitStatusPanel;

