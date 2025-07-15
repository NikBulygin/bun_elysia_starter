import type { CommitFile, CommitResult } from '../../../types/github';
import { loadEnvConfig, parseRepository, validateEnvConfig } from './common';

export async function createCommit(
  files: CommitFile[],
  commitMessage: string
): Promise<CommitResult> {
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

    console.log(`📝 Creating commit in ${repoInfo.owner}/${repoInfo.repo} (branch: ${repoInfo.branch})`);
    console.log(`📄 Files to commit: ${files.length}`);

    const branchResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/branches/${repoInfo.branch}`, {
      headers: {
        'Authorization': `token ${apiKey}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'refty-infra-test'
      }
    });

    if (!branchResponse.ok) {
      return {
        success: false,
        error: `Failed to get branch: ${branchResponse.status} ${branchResponse.statusText}`
      };
    }

    const branchData = await branchResponse.json();
    const baseTreeSha = branchData.commit.sha;

    const treeItems = files.map(file => ({
      path: file.path,
      mode: '100644',
      type: 'blob',
      content: file.content
    }));

    const treeResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${apiKey}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'refty-infra-test',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        base_tree: baseTreeSha,
        tree: treeItems
      })
    });

    if (!treeResponse.ok) {
      return {
        success: false,
        error: `Failed to create tree: ${treeResponse.status} ${treeResponse.statusText}`
      };
    }

    const treeData = await treeResponse.json();

    const commitResponse = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/git/commits`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${apiKey}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'refty-infra-test',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: commitMessage,
        tree: treeData.sha,
        parents: [baseTreeSha]
      })
    });

    if (!commitResponse.ok) {
      return {
        success: false,
        error: `Failed to create commit: ${commitResponse.status} ${commitResponse.statusText}`
      };
    }

    const commitData = await commitResponse.json();
    
    console.log(`✅ Commit created: ${commitData.sha}`);
    
    return {
      success: true,
      commitSha: commitData.sha
    };

  } catch (error) {
    return {
      success: false,
      error: `Error creating commit: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
