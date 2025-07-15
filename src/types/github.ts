// Environment configuration
export interface EnvConfig {
  REPOSITORY_URL?: string;
  API_KEY?: string;
  BRANCH?: string;
}

// GitHub API types
export interface GitHubFile {
  name: string;
  path: string;
  type: string;
  download_url?: string;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: string;
  sha?: string;
  content?: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  tree: {
    sha: string;
  };
  parents: string[];
}

export interface GitHubTree {
  sha: string;
  tree: GitHubTreeItem[];
}

export interface GitHubContent {
  content: string;
  encoding: string;
  sha: string;
}

// Repository parsing result
export interface RepositoryInfo {
  owner: string;
  repo: string;
  branch: string;
}

// File operation types
export interface CommitFile {
  path: string;
  content: string;
  sha?: string;
}

export interface FileChange {
  oldVersion: string;
  newVersion: string;
  line: string;
}

export interface FileResult {
  file: string;
  success: boolean;
  error?: string;
  originalContent?: string;
  updatedContent?: string;
  changes?: FileChange[];
}

export interface OriginalVersion {
  file: string;
  content: string;
}

// Operation result types
export interface SearchResult {
  success: boolean;
  files: string[];
  error?: string;
}

export interface FileContentResult {
  success: boolean;
  content?: string;
  error?: string;
}

export interface ReplaceResult {
  success: boolean;
  updatedFiles: string[];
  errors: string[];
  results: FileResult[];
}

export interface CommitResult {
  success: boolean;
  commitSha?: string;
  error?: string;
}

export interface PushResult {
  success: boolean;
  error?: string;
}

export interface RollbackResult {
  success: boolean;
  error?: string;
  rollbackCommitSha?: string;
}

export interface ReplaceYmlResult {
  success: boolean;
  updatedFiles: string[];
  commitSha?: string;
  errors: string[];
  changes: Array<{
    file: string;
    oldVersion: string;
    newVersion: string;
  }>;
}

// Function signatures
export type LoadEnvConfigFunction = () => EnvConfig;
export type ParseRepositoryFunction = (repositoryUrl: string, branch: string) => RepositoryInfo; 