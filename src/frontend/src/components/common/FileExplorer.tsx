import React, { useState, useCallback, useMemo } from 'react';
import { IRepositoryState, IFileState, FileStatus } from '@/types/git';
import { useRepositoryState } from '@/lib/react-query/hooks/use-git-engine';
import { useQueryClient } from '@tanstack/react-query';
import { gitKeys } from '@/lib/react-query/query-keys';
import { 
  File, 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  Folder,
  Save,
  X,
  FileCheck,
  FilePlus
} from 'lucide-react';

interface FileExplorerProps {
  practiceId?: string;
  version?: number;
  className?: string;
}

interface FileEditorProps {
  file: IFileState;
  onSave: (content: string) => void;
  onCancel: () => void;
}

function FileEditor({ file, onSave, onCancel }: FileEditorProps) {
  const [content, setContent] = useState(file.content || '');

  const handleSave = () => {
    onSave(content);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileText size={14} />
          <span>{file.path}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
          >
            <Save size={12} />
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-1"
          >
            <X size={12} />
            Cancel
          </button>
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-48 p-3 font-mono text-sm bg-background text-foreground border-0 outline-none resize-none"
        placeholder="File content..."
        autoFocus
      />
    </div>
  );
}

function FileExplorer({ practiceId, version, className = '' }: FileExplorerProps) {
  const { data: repositoryState } = useRepositoryState(practiceId, version);
  const queryClient = useQueryClient();
  const [editingFile, setEditingFile] = useState<IFileState | null>(null);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const workingDir = useMemo(() => {
    return repositoryState?.workingDirectory || [];
  }, [repositoryState]);

  const updateRepositoryState = useCallback((updater: (state: IRepositoryState) => IRepositoryState) => {
    if (!repositoryState) return;

    const stateKey = gitKeys.state(practiceId);
    const updatedState = updater(repositoryState);
    queryClient.setQueryData(stateKey, updatedState);
  }, [repositoryState, practiceId, queryClient]);

  const handleCreateFile = useCallback(() => {
    if (!newFileName.trim() || !repositoryState) return;

    const fileName = newFileName.trim();
    
    const existingFile = workingDir.find(f => f.path === fileName);
    if (existingFile) {
      alert(`File "${fileName}" already exists`);
      return;
    }

    updateRepositoryState((state) => {
      const newFile: IFileState = {
        path: fileName,
        status: FileStatus.UNTRACKED,
        content: ''
      };

      return {
        ...state,
        workingDirectory: [...(state.workingDirectory || []), newFile]
      };
    });

    setNewFileName('');
    setShowNewFileDialog(false);
  }, [newFileName, repositoryState, workingDir, updateRepositoryState]);

  const handleEditFile = useCallback((file: IFileState) => {
    setEditingFile(file);
  }, []);

  const handleSaveFile = useCallback((content: string) => {
    if (!editingFile || !repositoryState) return;

    updateRepositoryState((state) => {
      const workingDirectory = state.workingDirectory || [];
      const fileIndex = workingDirectory.findIndex(f => f.path === editingFile.path);
      
      if (fileIndex === -1) return state;

      const currentFile = workingDirectory[fileIndex];
      let newStatus: FileStatus;

      switch (currentFile.status) {
        case FileStatus.UNTRACKED:
          newStatus = FileStatus.UNTRACKED;
          break;
        case FileStatus.UNMODIFIED:
          newStatus = FileStatus.MODIFIED;
          break;
        case FileStatus.STAGED:
          newStatus = FileStatus.MODIFIED;
          break;
        case FileStatus.MODIFIED:
          newStatus = FileStatus.MODIFIED;
          break;
        default:
          newStatus = currentFile.status;
      }

      const updatedFile: IFileState = {
        ...currentFile,
        content,
        status: newStatus
      };

      const newWorkingDir = [...workingDirectory];
      newWorkingDir[fileIndex] = updatedFile;

      return {
        ...state,
        workingDirectory: newWorkingDir
      };
    });

    setEditingFile(null);
  }, [editingFile, repositoryState, updateRepositoryState]);

  const handleDeleteFile = useCallback((filePath: string) => {
    if (!repositoryState) return;
    if (!confirm(`Are you sure you want to delete "${filePath}"?`)) return;

    updateRepositoryState((state) => {
      const workingDirectory = state.workingDirectory || [];
      const fileIndex = workingDirectory.findIndex(f => f.path === filePath);
      
      if (fileIndex === -1) return state;

      const file = workingDirectory[fileIndex];
      const newWorkingDir = [...workingDirectory];
      
      if (file.status === FileStatus.UNMODIFIED || file.status === FileStatus.STAGED) {
        newWorkingDir[fileIndex] = {
          ...file,
          status: FileStatus.DELETED
        };
      } else {
        newWorkingDir.splice(fileIndex, 1);
      }

      return {
        ...state,
        workingDirectory: newWorkingDir
      };
    });
  }, [repositoryState, updateRepositoryState]);

  const getFileIcon = (file: IFileState) => {
    switch (file.status) {
      case FileStatus.STAGED:
        return <FileCheck size={14} className="text-green-500" />;
      case FileStatus.MODIFIED:
        return <Edit2 size={14} className="text-yellow-500" />;
      case FileStatus.DELETED:
        return <Trash2 size={14} className="text-red-500" />;
      case FileStatus.UNTRACKED:
        return <FilePlus size={14} className="text-blue-500" />;
      default:
        return <File size={14} className="text-gray-500" />;
    }
  };


  if (!repositoryState) {
    return (
      <div className={`bg-terminal-bg border border-border rounded-lg p-4 ${className}`}>
        <div className="text-sm text-muted-foreground text-center">
          Initialize a git repository first (git init)
        </div>
      </div>
    );
  }

  if (editingFile) {
    return (
      <div className={className}>
        <FileEditor
          file={editingFile}
          onSave={handleSaveFile}
          onCancel={() => setEditingFile(null)}
        />
      </div>
    );
  }

  return (
    <div className={`bg-terminal-bg border border-border rounded-lg overflow-hidden flex flex-col flex-1 ${className}`}>
      <div className="px-3 py-2 bg-terminal-header border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <Folder size={14} />
          <span>Files</span>
        </div>
        <button
          onClick={() => setShowNewFileDialog(true)}
          className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus size={10} />
          New
        </button>
      </div>

      {showNewFileDialog && (
        <div className="p-2 border-b border-border bg-muted/50 shrink-0">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFile();
                } else if (e.key === 'Escape') {
                  setShowNewFileDialog(false);
                  setNewFileName('');
                }
              }}
              placeholder="file.txt"
              className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background text-foreground outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleCreateFile}
              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
            >
              ✓
            </button>
            <button
              onClick={() => {
                setShowNewFileDialog(false);
                setNewFileName('');
              }}
              className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {workingDir.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-6">
            No files yet
          </div>
        ) : (
          workingDir.map((file) => (
            <div
              key={file.path}
              className={`flex items-center justify-between p-1.5 rounded border text-xs ${
                file.status === FileStatus.DELETED 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                  : 'bg-background border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                {getFileIcon(file)}
                <span className={`truncate ${
                  file.status === FileStatus.DELETED ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}>
                  {file.path}
                </span>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {file.status !== FileStatus.DELETED && (
                  <button
                    onClick={() => handleEditFile(file)}
                    className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded"
                    title="Edit"
                  >
                    <Edit2 size={12} />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteFile(file.path)}
                  className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FileExplorer;

