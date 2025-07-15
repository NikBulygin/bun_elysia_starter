import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
function loadEnvConfig() {
  try {
    const envPath = join(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const envVars: Record<string, string> = {};
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.warn('⚠️  .env file not found, using system environment variables');
    return {};
  }
}

// Types
interface GitHubFile {
  name: string;
  path: string;
  type: string;
  download_url?: string;
}

interface SearchResult {
  success: boolean;
  files: string[];
  error?: string;
}

// Function to search for yml files in GitHub repository
export async function searchYmlFiles(): Promise<SearchResult> {
  const envConfig = loadEnvConfig();
  const repositoryUrl = envConfig.REPOSITORY_URL || process.env.REPOSITORY_URL;
  const apiKey = envConfig.API_KEY || process.env.API_KEY;
  // Fix the typo in branch name if it exists
  let branch = envConfig.BRANCH || process.env.BRANCH || 'main';
  if (branch === 'GithubIntergration') {
    branch = 'GithubIntegration';
  }

  // Validate configuration
  if (!repositoryUrl) {
    return {
      success: false,
      files: [],
      error: 'REPOSITORY_URL not set in environment variables'
    };
  }

  if (!apiKey) {
    return {
      success: false,
      files: [],
      error: 'API_KEY not set in environment variables'
    };
  }

  try {
    // Parse repository URL to get owner and repo
    let owner: string, repo: string;
    
    if (repositoryUrl.includes('github.com')) {
      // Handle GitHub URLs like "https://github.com/owner/repo" or "https://github.com/owner/repo/"
      const urlParts = repositoryUrl.replace(/\/$/, '').split('/');
      if (urlParts.length < 2) {
        return {
          success: false,
          files: [],
          error: 'Invalid GitHub repository URL format'
        };
      }
      owner = urlParts[urlParts.length - 2];
      repo = urlParts[urlParts.length - 1];
    } else {
      // Handle container registry URLs like "ghcr.io/owner/repo"
      const urlParts = repositoryUrl.split('/');
      if (urlParts.length < 2) {
        return {
          success: false,
          files: [],
          error: 'Invalid repository URL format'
        };
      }
      owner = urlParts[urlParts.length - 2];
      repo = urlParts[urlParts.length - 1];
    }

    // GitHub API endpoint
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    
    console.log(`🔍 Searching for YAML files in: ${owner}/${repo} (branch: ${branch})`);
    console.log(`📡 API URL: ${apiUrl}`);

    // Fetch repository contents
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${apiKey}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'refty-infra-test'
      }
    });

    if (!response.ok) {
      return {
        success: false,
        files: [],
        error: `GitHub API error: ${response.status} ${response.statusText}`
      };
    }

    const data = await response.json();
    const ymlFiles: string[] = [];

    // Search for yml files
    if (data.tree && Array.isArray(data.tree)) {
      data.tree.forEach((item: any) => {
        if (item && item.type === 'blob' && item.path && 
            (item.path.endsWith('.yml') || item.path.endsWith('.yaml'))) {
          ymlFiles.push(item.path);
        }
      });
    }

    return {
      success: true,
      files: ymlFiles
    };

  } catch (error) {
    return {
      success: false,
      files: [],
      error: `Error searching for yml files: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Function to get specific yml file content
export async function getYmlFileContent(filePath: string): Promise<{ success: boolean; content?: string; error?: string }> {
  const envConfig = loadEnvConfig();
  const repositoryUrl = envConfig.REPOSITORY_URL || process.env.REPOSITORY_URL;
  const apiKey = envConfig.API_KEY || process.env.API_KEY;
  // Fix the typo in branch name if it exists
  let branch = envConfig.BRANCH || process.env.BRANCH || 'main';
  if (branch === 'GithubIntergration') {
    branch = 'GithubIntegration';
  }

  if (!repositoryUrl || !apiKey) {
    return {
      success: false,
      error: 'Repository URL or API Key not set'
    };
  }

  try {
    let owner: string, repo: string;
    
    if (repositoryUrl.includes('github.com')) {
      // Handle GitHub URLs like "https://github.com/owner/repo" or "https://github.com/owner/repo/"
      const urlParts = repositoryUrl.replace(/\/$/, '').split('/');
      owner = urlParts[urlParts.length - 2];
      repo = urlParts[urlParts.length - 1];
    } else {
      // Handle container registry URLs like "ghcr.io/owner/repo"
      const urlParts = repositoryUrl.split('/');
      owner = urlParts[urlParts.length - 2];
      repo = urlParts[urlParts.length - 1];
    }

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${apiKey}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'refty-infra-test'
      }
    });

    if (!response.ok) {
      return {
        success: false,
        error: `GitHub API error: ${response.status} ${response.statusText}`
      };
    }

    const data = await response.json();
    
    if (data.content && data.encoding === 'base64') {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return {
        success: true,
        content
      };
    }

    return {
      success: false,
      error: 'Invalid file content format'
    };

  } catch (error) {
    return {
      success: false,
      error: `Error fetching file content: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
