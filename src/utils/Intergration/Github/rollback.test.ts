import { test, expect } from 'bun:test';
import { rollbackToOriginalState } from './rollback';
import { getYmlFileContent } from './searchYmlFiles';
import { replaceImageVersion } from './replaceString';

test('should rollback changes to original state', async () => {
  console.log('🧪 Testing rollback functionality...');
  
  // Store original content
  const originalContent = await getYmlFileContent('here/some/long/directory/for/check/ierarchy/test.yaml');
  const originalVersions = [{
    file: 'here/some/long/directory/for/check/ierarchy/test.yaml',
    content: originalContent.content!
  }];
  
  // Make some changes first
  const imageName = 'ghcr.io/refty-yapi/refty-node/refty-node';
  const testVersion = 'rollback-test-version';
  
  console.log('📝 Making test changes...');
  const changeResult = await replaceImageVersion(imageName, testVersion);
  expect(changeResult.success).toBe(true);
  
  // Verify changes were made
  const changedContent = await getYmlFileContent('here/some/long/directory/for/check/ierarchy/test.yaml');
  expect(changedContent.content).toContain(`${imageName}:${testVersion}`);
  
  // Perform rollback
  console.log('🔄 Performing rollback...');
  const rollbackResult = await rollbackToOriginalState(originalVersions);
  
  expect(rollbackResult.success).toBe(true);
  expect(rollbackResult.rollbackCommitSha).toBeDefined();
  
  // Verify rollback was successful
  const rolledBackContent = await getYmlFileContent('here/some/long/directory/for/check/ierarchy/test.yaml');
  expect(rolledBackContent.content).toContain('ghcr.io/refty-yapi/refty-node/refty-node:05-06-42a252');
  expect(rolledBackContent.content).not.toContain(testVersion);
  
  console.log('✅ Rollback test completed successfully');
  console.log(`📝 Rollback commit: ${rollbackResult.rollbackCommitSha}`);
}); 