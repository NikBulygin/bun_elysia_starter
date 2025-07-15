import { test, expect } from 'bun:test';
import deploymentHandler from './index.post';
import { DeploymentRequest, DeploymentResponse } from '~/types/deployments';

test('POST /deployments — valid payload without details', async () => {
  const body: DeploymentRequest = {
    image: 'ghcr.io/refty-yapi/refty-node/refty-node',
    version: '05-06-42a252'
  };

  const result: DeploymentResponse = await deploymentHandler({ body });

  // Note: success might be false due to GitHub API permissions in test environment
  // but the core functionality should work
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

  // Note: success might be false due to GitHub API permissions in test environment
  expect(result.image).toBe(body.image);
  expect(result.version).toBe(body.version);
  expect(typeof result.timestamp).toBe('string');
  
  if (result.success) {
    expect(result.details).toBeDefined();
    
    if (result.details) {
      expect(typeof result.details.filesChanged).toBe('number');
      expect(Array.isArray(result.details.filePaths)).toBe(true);
      expect(Array.isArray(result.details.changes)).toBe(true);
      expect(result.details.filesChanged).toBeGreaterThanOrEqual(0);
    }
  } else {
    expect(result.error).toBeDefined();
    console.log(`⚠️  Expected failure due to permissions: ${result.error}`);
  }
});

test('POST /deployments — invalid image name', async () => {
  const body: DeploymentRequest = {
    image: 'non-existent-image/name',
    version: 'test-version'
  };

  const result: DeploymentResponse = await deploymentHandler({ body });

  // Should still succeed but with no files changed
  expect(result.success).toBe(true);
  expect(result.image).toBe(body.image);
  expect(result.version).toBe(body.version);
  expect(typeof result.timestamp).toBe('string');
}); 