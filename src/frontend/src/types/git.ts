export interface GitCommandRequest {
  command: string;
}

export interface GitCommandResponse {
  success: boolean;
  output: string;       
  repositoryState: IRepositoryState | null;
  command?: string;
}

export enum ETypeGitObject {
  BLOB = "BLOB",
  TREE = "TREE",
  COMMIT = "COMMIT"
}

export interface ICommitter {
  name: string;
  email: string;
  date: Date;
}

export interface IAuthor extends ICommitter {}

export interface IBlob {
  id: string;
  type: ETypeGitObject;
  content: string;
}

export interface ITreeEntry {
  mode: string;
  type: ETypeGitObject;
  id: string;
  name: string;
}

export interface ITree {
  id: string;
  type: ETypeGitObject;
  entries: ITreeEntry[];
}

export interface ICommit {
  id: string;
  type: ETypeGitObject;
  tree?: string;
  parents: string[];
  author: IAuthor;
  committer: ICommitter;
  message: string;
  branch: string;
}

export interface IBranch {
  name: string;
  commitId: string;      
}

export interface ITag {
  name: string;
  commitId: string;      
}

export type IHead =
  | { type: "branch"; ref: string; commitId: string }
  | { type: "commit"; ref: string }
  | null;

export enum FileStatus {
  UNTRACKED = 'untracked',
  MODIFIED = 'modified',
  DELETED = 'deleted',
  STAGED = 'staged',
  UNMODIFIED = 'unmodified'
}

export interface IFileState {
  path: string;
  status: FileStatus;
  content?: string;
}

export interface IRepositoryState {
  commits: ICommit[];
  branches: IBranch[];
  tags: ITag[];
  head: IHead;
  workingDirectory?: IFileState[];
  stagingArea?: string[];
}

export type IFileName = string;