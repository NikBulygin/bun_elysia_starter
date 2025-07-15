import { createCommit } from './commit';
import { pushCommit } from './push';
import { loadEnvConfig, validateEnvConfig } from './common';
import type { RollbackResult, OriginalVersion } from '../../../types/github';

export async function rollbackToOriginalState(
  originalVersions: OriginalVersion[]
): Promise<RollbackResult> {
  const envConfig = loadEnvConfig();
  const repositoryUrl = envConfig.REPOSITORY_URL || process.env.REPOSITORY_URL;
  const apiKey = envConfig.API_KEY || process.env.API_KEY;

  const validation = validateEnvConfig({ REPOSITORY_URL: repositoryUrl, API_KEY: apiKey });
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error
    };
  }

  try {
    console.log('🔄 Rolling back to original state...');
    console.log(`📄 Files to restore: ${originalVersions.length}`);

    const commitFiles = originalVersions.map(version => ({
      path: version.file,
      content: version.content
    }));

    const rollbackMessage = '[AUTOGEN] Rollback test changes to original state';
    const commitResult = await createCommit(commitFiles, rollbackMessage);

    if (!commitResult.success) {
      return {
        success: false,
        error: `Error creating rollback commit: ${commitResult.error}`
      };
    }

    const pushResult = await pushCommit(commitResult.commitSha!);
    
    if (!pushResult.success) {
      return {
        success: false,
        error: `Error pushing rollback commit: ${pushResult.error}`
      };
    }

    console.log(`✅ Rollback completed: ${commitResult.commitSha}`);
    
    return {
      success: true,
      rollbackCommitSha: commitResult.commitSha
    };

  } catch (error) {
    return {
      success: false,
      error: `Error during rollback: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
} 