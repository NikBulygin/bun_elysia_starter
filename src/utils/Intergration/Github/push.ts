import type { PushResult } from '../../../types/github';
import { loadEnvConfig, parseRepository, validateEnvConfig } from './common';

/**
 * Updates branch with new commit (push)
 * @param commitSha Commit SHA to push
 * @returns Push result
 */
export async function pushCommit(commitSha: string): Promise<PushResult> {
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
    // Parse repository URL
    const repoInfo = parseRepository(repositoryUrl!, branch);

    console.log(`🚀 Pushing commit ${commitSha} to branch ${repoInfo.branch}`);

    // Update branch with new commit
    const pushResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/refs/heads/${repoInfo.branch}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${apiKey}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'refty-infra-test',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sha: commitSha
      })
    });

    if (!pushResponse.ok) {
      return {
        success: false,
        error: `Failed to push commit: ${pushResponse.status} ${pushResponse.statusText}`
      };
    }

    console.log(`✅ Commit successfully pushed to branch ${repoInfo.branch}`);
    
    return {
      success: true
    };

  } catch (error) {
    return {
      success: false,
      error: `Error pushing commit: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
