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