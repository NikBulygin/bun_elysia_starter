import { replaceImageVersion } from './replaceString';
import { createCommit } from './commit';
import { pushCommit } from './push';
import type { ReplaceYmlResult } from '../../../types/github';

export async function replaceYml(
  imageName: string,
  newVersion: string,
  commitMessage?: string,
  autoPush: boolean = true
): Promise<ReplaceYmlResult> {
  const result: ReplaceYmlResult = {
    success: false,
    updatedFiles: [],
    errors: [],
    changes: []
  };

  try {
    console.log(`🚀 Starting ReplaceYml for image: ${imageName}:${newVersion}`);
    
    console.log('\n📦 Step 1: Replacing image versions...');
    const replaceResult = await replaceImageVersion(imageName, newVersion);
    
    if (!replaceResult.success) {
      result.errors.push(`Error replacing versions: ${replaceResult.errors.join(', ')}`);
      return result;
    }

    if (replaceResult.updatedFiles.length === 0) {
      console.log('ℹ️  No files found for update');
      result.success = true;
      return result;
    }

    console.log(`✅ Found ${replaceResult.updatedFiles.length} files for update`);
    result.updatedFiles = replaceResult.updatedFiles;

    for (const fileResult of replaceResult.results) {
      if (fileResult.changes) {
        for (const change of fileResult.changes) {
          result.changes.push({
            file: fileResult.file,
            oldVersion: change.oldVersion,
            newVersion: change.newVersion
          });
        }
      }
    }

    console.log('\n📝 Step 2: Creating commit...');
    
    const commitFiles = replaceResult.results
      .filter(r => r.updatedContent && r.originalContent !== r.updatedContent)
      .map(r => ({
        path: r.file,
        content: r.updatedContent!
      }));

    const defaultCommitMessage = `[AUTOGEN] Update image version: ${imageName} -> ${newVersion}\n\nUpdated files:\n${result.updatedFiles.map(f => `- ${f}`).join('\n')}`;
    const finalCommitMessage = commitMessage || defaultCommitMessage;

    const commitResult = await createCommit(commitFiles, finalCommitMessage);
    
    if (!commitResult.success) {
      result.errors.push(`Error creating commit: ${commitResult.error}`);
      return result;
    }

    result.commitSha = commitResult.commitSha;
    console.log(`✅ Commit created: ${commitResult.commitSha}`);

    if (autoPush) {
      console.log('\n🚀 Step 3: Pushing changes...');
      const pushResult = await pushCommit(commitResult.commitSha!);
      
      if (!pushResult.success) {
        result.errors.push(`Error pushing: ${pushResult.error}`);
        return result;
      }

      console.log('✅ Changes successfully pushed');
    } else {
      console.log('\n⏸️  Push skipped (autoPush = false)');
    }

    result.success = true;
    console.log(`\n🎉 Operation completed successfully!`);
    console.log(`📊 Result: ${result.updatedFiles.length} files updated, ${result.changes.length} changes`);

  } catch (error) {
    const errorMsg = `Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    result.errors.push(errorMsg);
    console.error('❌', errorMsg);
  }

  return result;
}

export async function updateImageVersion(
  imageName: string,
  newVersion: string
): Promise<ReplaceYmlResult> {
  return replaceYml(imageName, newVersion);
}


export async function updateImageVersionWithMessage(
  imageName: string,
  newVersion: string,
  commitMessage: string
): Promise<ReplaceYmlResult> {
  return replaceYml(imageName, newVersion, commitMessage);
}