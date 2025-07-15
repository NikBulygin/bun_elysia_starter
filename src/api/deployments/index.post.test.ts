import { test, expect } from 'bun:test';
import deploymentHandler from './index.post';
import { DeploymentRequest, DeploymentResponse } from '../../types/deployments';

test('POST /deployments — valid payload', () => {
  const body: DeploymentRequest = {
    image: 'ghcr.io/refty-yapi/refty-node/refty-node',
    version: '05-06-42a252'
  };

  const result: DeploymentResponse = deploymentHandler({ body });

  expect(result.success).toBe(true);
  expect(result.image).toBe(body.image);
  expect(result.version).toBe(body.version);
  expect(typeof result.timestamp).toBe('string');
}); 