import type { SearchResult, FileContentResult } from '../../../types/github';
import { loadEnvConfig, parseRepository, validateEnvConfig } from './common';

export async function searchYmlFiles(): Promise<SearchResult> {
  const envConfig = loadEnvConfig();
  const repositoryUrl = envConfig.REPOSITORY_URL || process.env.REPOSITORY_URL;
  const apiKey = envConfig.API_KEY || process.env.API_KEY;
  const branch = envConfig.BRANCH || process.env.BRANCH || 'main';

  const validation = validateEnvConfig({ REPOSITORY_URL: repositoryUrl, API_KEY: apiKey });
  if (!validation.valid) {
    return {
      success: false,
      files: [],
      error: validation.error
    };
  }

  try {
    const repoInfo = parseRepository(repositoryUrl!, branch);

    const apiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees/${repoInfo.branch}?recursive=1`;
    
    console.log(`🔍 Searching for YAML files in: ${repoInfo.owner}/${repoInfo.repo} (branch: ${repoInfo.branch})`);
    console.log(`📡 API URL: ${apiUrl}`);

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

export async function getYmlFileContent(filePath: string): Promise<FileContentResult> {
  const envConfig = loadEnvConfig();
  const repositoryUrl = envConfig.REPOSITORY_URL || process.env.REPOSITORY_URL;
  const apiKey = envConfig.API_KEY || process.env.API_KEY;
  const branch = envConfig.BRANCH || process.env.BRANCH || 'main';

  const validation = validateEnvConfig({ REPOSITORY_URL: repositoryUrl, API_KEY: apiKey });
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error
    };
  }

  try {
    const repoInfo = parseRepository(repositoryUrl!, branch);
    const apiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${filePath}?ref=${repoInfo.branch}`;

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
