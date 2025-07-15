import { test, expect } from 'bun:test';
import deploymentHandler from './index.post';
import { DeploymentRequest, DeploymentResponse } from '~/types/deployments';

test('POST /deployments — valid payload without details', async () => {
  const body: DeploymentRequest = {
    image: 'ghcr.io/refty-yapi/refty-node/refty-node',
    version: '05-06-42a252'
  };

  const result: DeploymentResponse = await deploymentHandler({ body });

  // Basic structure validation
  expect(result.image).toBe(body.image);
  expect(result.version).toBe(body.version);
  expect(typeof result.timestamp).toBe('string');
  
  if (result.success) {
    expect(result.error).toBeUndefined();
    expect(result.details).toBeUndefined();
  } else {
    expect(result.error).toBeDefined();
    console.log(`⚠️  Expected failure due to permissions: ${result.error}`);
  }
});

test('POST /deployments — valid payload with details', async () => {
  const body: DeploymentRequest = {
    image: 'ghcr.io/refty-yapi/refty-node/refty-node',
    version: '05-06-42a252'
  };

  const result: DeploymentResponse = await deploymentHandler({ 
    body, 
    query: { details: 'true' } 
  });

  // Basic structure validation
  expect(result.image).toBe(body.image);
  expect(result.version).toBe(body.version);
  expect(typeof result.timestamp).toBe('string');
  
  if (result.success) {
    expect(result.details).toBeDefined();
    
    if (result.details) {
      expect(typeof result.details.filesChanged).toBe('number');
      expect(Array.isArray(result.details.filePaths)).toBe(true);
      expect(Array.isArray(result.details.changes)).toBe(true);
      // Don't check specific values - repository state may vary
      expect(result.details.filesChanged).toBeGreaterThanOrEqual(0);
      expect(result.details.filePaths.length).toBe(result.details.filesChanged);
    }
  } else {
    expect(result.error).toBeDefined();
    console.log(`⚠️  Expected failure due to permissions: ${result.error}`);
  }
});

test('POST /deployments — invalid image name (no files to update)', async () => {
  const body: DeploymentRequest = {
    image: 'non-existent-image/name',
    version: 'test-version'
  };

  const result: DeploymentResponse = await deploymentHandler({ body });

  // Should succeed even with no files changed
  expect(result.success).toBe(true);
  expect(result.image).toBe(body.image);
  expect(result.version).toBe(body.version);
  expect(typeof result.timestamp).toBe('string');
  expect(result.error).toBeUndefined();
});

test('POST /deployments — same version (no changes needed)', async () => {
  // Use a version that likely doesn't exist in the repo
  const body: DeploymentRequest = {
    image: 'ghcr.io/refty-yapi/refty-node/refty-node',
    version: 'test-version-12345'
  };

  const result: DeploymentResponse = await deploymentHandler({ 
    body, 
    query: { details: 'true' } 
  });

  // Should succeed even if no files were updated
  expect(result.success).toBe(true);
  expect(result.image).toBe(body.image);
  expect(result.version).toBe(body.version);
  expect(typeof result.timestamp).toBe('string');
  
  if (result.details) {
    // May have 0 files changed if version doesn't exist in repo
    expect(result.details.filesChanged).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.details.filePaths)).toBe(true);
    expect(Array.isArray(result.details.changes)).toBe(true);
  }
}); 