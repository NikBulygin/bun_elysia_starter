import { test, expect } from 'bun:test';
import { replaceImageVersion } from './replaceString';
import { getYmlFileContent } from './searchYmlFiles';
import { rollbackToOriginalState } from './rollback';

test('should replace image version in test.yaml file', async () => {
  console.log('🧪 Testing image version replacement...');
  
  // Initial data
  const imageName = 'ghcr.io/refty-yapi/refty-node/refty-node';
  const newVersion = '05-06-42a253';
  
  // Store original content for rollback
  const originalContent = await getYmlFileContent('here/some/long/directory/for/check/ierarchy/test.yaml');
  const originalVersions = [{
    file: 'here/some/long/directory/for/check/ierarchy/test.yaml',
    content: originalContent.content!
  }];
  
  try {
    // Perform replacement
    const result = await replaceImageVersion(imageName, newVersion);
  
  // Check overall result
  expect(result.success).toBe(true);
  expect(result.errors.length).toBe(0);
  expect(result.updatedFiles.length).toBeGreaterThan(0);
  
  // Look for result for test.yaml
  const testYamlResult = result.results.find(r => 
    r.file === 'here/some/long/directory/for/check/ierarchy/test.yaml'
  );
  
  expect(testYamlResult).toBeDefined();
  expect(testYamlResult!.success).toBe(true);
  expect(testYamlResult!.changes).toBeDefined();
  expect(testYamlResult!.changes!.length).toBeGreaterThan(0);
  
  // Check that version was replaced
  expect(testYamlResult!.updatedContent).toContain(`${imageName}:${newVersion}`);
  expect(testYamlResult!.updatedContent).not.toContain('ghcr.io/refty-yapi/refty-node/refty-node:05-06-42a252');
  
  // Check change details
  const change = testYamlResult!.changes![0];
  expect(change.oldVersion).toBe('05-06-42a252');
  expect(change.newVersion).toBe(newVersion);
  expect(change.line).toContain('image:');
  
  console.log('✅ Image version replacement completed successfully');
  console.log(`📦 Changes: ${change.oldVersion} -> ${change.newVersion}`);
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

test('should handle multiple containers in YAML files', async () => {
  console.log('🧪 Testing multiple containers handling...');
  
  const imageName = 'ghcr.io/refty-yapi/refty-node/refty-node';
  const newVersion = 'latest-test-version';
  
  const result = await replaceImageVersion(imageName, newVersion);
  
  expect(result.success).toBe(true);
  
  // Check that all files with containers were processed
  const filesWithChanges = result.results.filter(r => r.changes && r.changes.length > 0);
  expect(filesWithChanges.length).toBeGreaterThan(0);
  
  // Check that new version is present in each file with changes
  for (const fileResult of filesWithChanges) {
    expect(fileResult.updatedContent).toContain(`${imageName}:${newVersion}`);
  }
  
  console.log(`✅ Processed ${filesWithChanges.length} files with changes`);
});

test('should preserve YAML structure after replacement', async () => {
  console.log('🧪 Checking YAML structure preservation...');
  
  const imageName = 'ghcr.io/refty-yapi/refty-node/refty-node';
  const newVersion = 'structure-test-version';
  
  const result = await replaceImageVersion(imageName, newVersion);
  
  expect(result.success).toBe(true);
  
  // Check that YAML structure is preserved in test.yaml
  const testYamlResult = result.results.find(r => 
    r.file === 'here/some/long/directory/for/check/ierarchy/test.yaml'
  );
  
  if (testYamlResult && testYamlResult.updatedContent) {
    const updatedContent = testYamlResult.updatedContent;
    
    // Check key structure elements
    expect(updatedContent).toContain('apiVersion: apps/v1');
    expect(updatedContent).toContain('kind: Deployment');
    expect(updatedContent).toContain('metadata:');
    expect(updatedContent).toContain('spec:');
    expect(updatedContent).toContain('containers:');
    expect(updatedContent).toContain('env:');
    expect(updatedContent).toContain('volumeMounts:');
    expect(updatedContent).toContain('volumes:');
    
    console.log('✅ YAML structure preserved');
  }
});

test('should handle non-matching image names gracefully', async () => {
  console.log('🧪 Testing non-matching image names handling...');
  
  const imageName = 'non-existent-image/name';
  const newVersion = 'test-version';
  
  const result = await replaceImageVersion(imageName, newVersion);
  
  expect(result.success).toBe(true);
  expect(result.errors.length).toBe(0);
  
  // Check that files were processed but no changes found
  const filesWithChanges = result.results.filter(r => r.changes && r.changes.length > 0);
  expect(filesWithChanges.length).toBe(0);
  
  console.log('✅ Non-matching image names handled correctly');
});

test('should provide detailed change information', async () => {
  console.log('🧪 Checking detailed change information...');
  
  const imageName = 'ghcr.io/refty-yapi/refty-node/refty-node';
  const newVersion = 'detailed-test-version';
  
  const result = await replaceImageVersion(imageName, newVersion);
  
  expect(result.success).toBe(true);
  
  // Check that detailed information is provided for each change
  for (const fileResult of result.results) {
    if (fileResult.changes && fileResult.changes.length > 0) {
      for (const change of fileResult.changes) {
        expect(change.oldVersion).toBeDefined();
        expect(change.newVersion).toBe(newVersion);
        expect(change.line).toContain('image:');
        expect(change.line).toContain(imageName);
      }
    }
  }
  
  console.log('✅ Detailed change information provided');
}); 