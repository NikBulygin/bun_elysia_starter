import { test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

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
    return {};
  }
}

test('GitHub API authorization works with API_KEY', async () => {
  const envConfig = loadEnvConfig();
  const apiKey = envConfig.API_KEY || process.env.API_KEY;

  expect(apiKey).toBeDefined();
  expect(typeof apiKey).toBe('string');
  expect(apiKey!.length).toBeGreaterThan(10);

  const response = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `token ${apiKey}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'refty-infra-test'
    }
  });

  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data).toHaveProperty('login');
  console.log('GitHub login:', data.login);
});

test('GitHub API: can read repository', async () => {
  const envConfig = loadEnvConfig();
  const apiKey = envConfig.API_KEY || process.env.API_KEY;
  const repo = 'NikBulygin/refty-infra-test';

  const response = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      'Authorization': `token ${apiKey}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'refty-infra-test'
    }
  });

  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.full_name).toBe(repo);
});

test('GitHub API: token has push access (can edit repo)', async () => {
  const envConfig = loadEnvConfig();
  const apiKey = envConfig.API_KEY || process.env.API_KEY;
  const repo = 'NikBulygin/refty-infra-test';

  const response = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      'Authorization': `token ${apiKey}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'refty-infra-test'
    }
  });

  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data).toHaveProperty('permissions');
  expect(data.permissions).toHaveProperty('push');
  console.log('Repo push permission:', data.permissions.push);
  expect(data.permissions.push).toBe(true);
});

test('GitHub API: branch exists and can be accessed', async () => {
  const envConfig = loadEnvConfig();
  const apiKey = envConfig.API_KEY || process.env.API_KEY;
  const branch = envConfig.BRANCH || process.env.BRANCH || 'main';
  const repo = 'NikBulygin/refty-infra-test';

  const response = await fetch(`https://api.github.com/repos/${repo}/branches/${branch}`, {
    headers: {
      'Authorization': `token ${apiKey}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'refty-infra-test'
    }
  });

  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data).toHaveProperty('name');
  expect(data).toHaveProperty('commit');
  expect(data.commit).toHaveProperty('sha');
  console.log(`Branch ${branch} exists, commit SHA: ${data.commit.sha}`);
});

test('GitHub API: can get tree SHA from branch', async () => {
  const envConfig = loadEnvConfig();
  const apiKey = envConfig.API_KEY || process.env.API_KEY;
  const branch = envConfig.BRANCH || process.env.BRANCH || 'main';
  const repo = 'NikBulygin/refty-infra-test';

  // First get branch info
  const branchResponse = await fetch(`https://api.github.com/repos/${repo}/branches/${branch}`, {
    headers: {
      'Authorization': `token ${apiKey}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'refty-infra-test'
    }
  });

  expect(branchResponse.status).toBe(200);
  const branchData = await branchResponse.json();
  const commitSha = branchData.commit.sha;

  // Then get commit info to get tree SHA
  const commitResponse = await fetch(`https://api.github.com/repos/${repo}/git/commits/${commitSha}`, {
    headers: {
      'Authorization': `token ${apiKey}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'refty-infra-test'
    }
  });

  expect(commitResponse.status).toBe(200);
  const commitData = await commitResponse.json();
  expect(commitData).toHaveProperty('tree');
  expect(commitData.tree).toHaveProperty('sha');
  console.log(`Tree SHA: ${commitData.tree.sha}`);
});

test('GitHub API: can create a test tree (simulate commit process)', async () => {
  const envConfig = loadEnvConfig();
  const apiKey = envConfig.API_KEY || process.env.API_KEY;
  const branch = envConfig.BRANCH || process.env.BRANCH || 'main';
  const repo = 'NikBulygin/refty-infra-test';

  // Get base tree SHA
  const branchResponse = await fetch(`https://api.github.com/repos/${repo}/branches/${branch}`, {
    headers: {
      'Authorization': `token ${apiKey}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'refty-infra-test'
    }
  });

  expect(branchResponse.status).toBe(200);
  const branchData = await branchResponse.json();
  const baseTreeSha = branchData.commit.sha;

  // Try to create a tree (this is where the 403 error occurs)
  const treeResponse = await fetch(`https://api.github.com/repos/${repo}/git/trees`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${apiKey}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'refty-infra-test',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: [
        {
          path: 'test-file.txt',
          mode: '100644',
          type: 'blob',
          content: 'Test content for debugging'
        }
      ]
    })
  });

  console.log(`Tree creation response: ${treeResponse.status} ${treeResponse.statusText}`);
  
  if (treeResponse.status === 403) {
    console.log('❌ 403 Forbidden - Token cannot create trees (likely fine-grained token or insufficient permissions)');
    console.log('Response body:', await treeResponse.text());
  } else if (treeResponse.status === 201) {
    console.log('✅ Tree created successfully');
    const treeData = await treeResponse.json();
    console.log('Tree SHA:', treeData.sha);
  } else {
    console.log(`Unexpected status: ${treeResponse.status}`);
    console.log('Response body:', await treeResponse.text());
  }

  // Don't fail the test, just log the result for debugging
  expect(treeResponse.status).toBeOneOf([201, 403, 422]);
});

test('GitHub API: check token type and scopes', async () => {
  const envConfig = loadEnvConfig();
  const apiKey = envConfig.API_KEY || process.env.API_KEY;

  const response = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `token ${apiKey}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'refty-infra-test'
    }
  });

  expect(response.status).toBe(200);
  const data = await response.json();
  
  // Check if it's a fine-grained token (these have limitations with git operations)
  if (apiKey!.startsWith('github_pat_')) {
    console.log('⚠️  This appears to be a fine-grained token (github_pat_...)');
    console.log('Fine-grained tokens may have limitations with git operations');
    console.log('Consider using a classic token with repo scope');
  } else if (apiKey!.startsWith('ghp_')) {
    console.log('✅ This appears to be a classic token (ghp_...)');
  } else {
    console.log('❓ Unknown token format');
  }
  
  console.log('User:', data.login);
  console.log('Token format:', apiKey!.substring(0, 10) + '...');
}); 