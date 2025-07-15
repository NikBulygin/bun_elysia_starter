import { readFileSync } from 'fs';
import { join } from 'path';
import type { 
  EnvConfig, 
  RepositoryInfo, 
  LoadEnvConfigFunction, 
  ParseRepositoryFunction 
} from '../../../types/github';

export const loadEnvConfig: LoadEnvConfigFunction = () => {
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
};

export const parseRepository: ParseRepositoryFunction = (repositoryUrl: string, branch: string) => {
  let owner: string, repo: string;
  
  if (repositoryUrl.includes('github.com')) {
    // Handle GitHub URLs like "https://github.com/owner/repo" or "https://github.com/owner/repo/"
    const urlParts = repositoryUrl.replace(/\/$/, '').split('/');
    if (urlParts.length < 2) {
      throw new Error('Invalid GitHub repository URL format');
    }
    owner = urlParts[urlParts.length - 2];
    repo = urlParts[urlParts.length - 1];
  } else {
    const urlParts = repositoryUrl.split('/');

    if (urlParts.length < 2) {
      throw new Error('Invalid repository URL format');
    }
    owner = urlParts[urlParts.length - 2];
    repo = urlParts[urlParts.length - 1];
  }

  return { owner, repo, branch };
};

export const validateEnvConfig = (envConfig: EnvConfig): { valid: boolean; error?: string } => {
  if (!envConfig.REPOSITORY_URL) {
    return { valid: false, error: 'REPOSITORY_URL not set in environment variables' };
  }
  
  if (!envConfig.API_KEY) {
    return { valid: false, error: 'API_KEY not set in environment variables' };
  }
  
  return { valid: true };
}; 