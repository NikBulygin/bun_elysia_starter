import { test, expect } from 'bun:test';
import { replaceYml, updateImageVersion, updateImageVersionWithMessage } from './ReplaceYml';
import { getYmlFileContent } from './searchYmlFiles';
import { rollbackToOriginalState } from './rollback';

test('should replace image version and create commit without push', async () => {
  console.log('🧪 Testing ReplaceYml without automatic push...');
  
  const imageName = 'ghcr.io/refty-yapi/refty-node/refty-node';
  const newVersion = 'test-commit-version';
  
  // Store original content for rollback
  const originalContent = await getYmlFileContent('here/some/long/directory/for/check/ierarchy/test.yaml');
  const originalVersions = [{
    file: 'here/some/long/directory/for/check/ierarchy/test.yaml',
    content: originalContent.content!
  }];
  
  try {
    // Perform replacement without automatic push
    const result = await replaceYml(imageName, newVersion, undefined, false);
  
  // Check result
  expect(result.success).toBe(true);
  expect(result.errors.length).toBe(0);
  expect(result.updatedFiles.length).toBeGreaterThan(0);
  expect(result.commitSha).toBeDefined();
  expect(result.changes.length).toBeGreaterThan(0);
  
  // Check that test.yaml was updated
  const testYamlChange = result.changes.find(c => 
    c.file === 'here/some/long/directory/for/check/ierarchy/test.yaml'
  );
  expect(testYamlChange).toBeDefined();
  expect(testYamlChange!.oldVersion).toBe('05-06-42a252');
  expect(testYamlChange!.newVersion).toBe(newVersion);
  
  console.log(`✅ ReplaceYml completed successfully`);
  console.log(`📦 Files updated: ${result.updatedFiles.length}`);
  console.log(`📝 Commit: ${result.commitSha}`);
  console.log(`🔄 Changes: ${result.changes.length}`);
  } finally {
    // Rollback to original state
    console.log('🔄 Rolling back to original state...');
    const rollbackResult = await rollbackToOriginalState(originalVersions);
    if (rollbackResult.success) {
      console.log('✅ Rollback completed successfully');
    } else {
      console.error('❌ Rollback failed:', rollbackResult.error);
    }
  }
});

test('should use custom commit message', async () => {
  console.log('🧪 Testing ReplaceYml with custom commit message...');
  
  const imageName = 'ghcr.io/refty-yapi/refty-node/refty-node';
  const newVersion = 'custom-message-version';
  const customMessage = 'Custom commit message for testing';
  
  // Perform replacement with custom message
  const result = await replaceYml(imageName, newVersion, customMessage, false);
  
  expect(result.success).toBe(true);
  expect(result.errors.length).toBe(0);
  expect(result.commitSha).toBeDefined();
  
  console.log(`✅ ReplaceYml with custom message completed successfully`);
  console.log(`📝 Commit: ${result.commitSha}`);
});

test('should work with updateImageVersion helper function', async () => {
  console.log('🧪 Testing updateImageVersion helper function...');
  
  const imageName = 'ghcr.io/refty-yapi/refty-node/refty-node';
  const newVersion = 'helper-function-version';
  
  // Use helper function
  const result = await updateImageVersion(imageName, newVersion);
  
  expect(result.success).toBe(true);
  expect(result.errors.length).toBe(0);
  expect(result.updatedFiles.length).toBeGreaterThan(0);
  expect(result.changes.length).toBeGreaterThan(0);
  
  console.log(`✅ updateImageVersion works correctly`);
  console.log(`📦 Files updated: ${result.updatedFiles.length}`);
});

test('should work with updateImageVersionWithMessage helper function', async () => {
  console.log('🧪 Testing updateImageVersionWithMessage...');
  
  const imageName = 'ghcr.io/refty-yapi/refty-node/refty-node';
  const newVersion = 'message-helper-version';
  const customMessage = 'Test message from helper function';
  
  // Use helper function with message
  const result = await updateImageVersionWithMessage(imageName, newVersion, customMessage);
  
  expect(result.success).toBe(true);
  expect(result.errors.length).toBe(0);
  expect(result.commitSha).toBeDefined();
  
  console.log(`✅ updateImageVersionWithMessage works correctly`);
  console.log(`📝 Commit: ${result.commitSha}`);
});

test('should handle non-existent image gracefully', async () => {
  console.log('🧪 Testing non-existent image handling...');
  
  const imageName = 'non-existent-image/name';
  const newVersion = 'test-version';
  
  const result = await replaceYml(imageName, newVersion, undefined, false);
  
  expect(result.success).toBe(true);
  expect(result.errors.length).toBe(0);
  expect(result.updatedFiles.length).toBe(0);
  expect(result.changes.length).toBe(0);
  
  console.log('✅ Non-existent image handled correctly');
});

test('should provide detailed change information', async () => {
  console.log('🧪 Checking detailed change information...');
  
  const imageName = 'ghcr.io/refty-yapi/refty-node/refty-node';
  const newVersion = 'detailed-info-version';
  
  const result = await replaceYml(imageName, newVersion, undefined, false);
  
  expect(result.success).toBe(true);
  expect(result.changes.length).toBeGreaterThan(0);
  
  // Check change information structure
  for (const change of result.changes) {
    expect(change.file).toBeDefined();
    expect(change.oldVersion).toBeDefined();
    expect(change.newVersion).toBe(newVersion);
    expect(change.file.endsWith('.yaml') || change.file.endsWith('.yml')).toBe(true);
  }
  
  console.log(`✅ Detailed change information provided`);
  console.log(`📊 Changes:`, result.changes.map(c => 
    `${c.file}: ${c.oldVersion} -> ${c.newVersion}`
  ));
}); 