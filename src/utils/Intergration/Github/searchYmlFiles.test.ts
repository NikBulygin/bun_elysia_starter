import { test, expect } from 'bun:test';
import { searchYmlFiles, getYmlFileContent } from './searchYmlFiles';

test('searchYmlFiles should find yml files in repository branch', async () => {
  const result = await searchYmlFiles();
  
  console.log('Search result:', JSON.stringify(result, null, 2));
  
  expect(result.success).toBe(true);
  expect(Array.isArray(result.files)).toBe(true);
  
  // Check for specific files
  expect(result.files).toContain('refty-bayut-district-property-parser-deploy.yaml');
  expect(result.files).toContain('refty-bayut-district-property-sync-deploy.yaml');
  
  console.log('Found yml files:', result.files);
});

test('getYmlFileContent should fetch file content', async () => {
  const result = await getYmlFileContent('refty-bayut-district-property-parser-deploy.yaml');
  
  expect(result.success).toBe(true);
  expect(typeof result.content).toBe('string');
  expect(result.content).toContain('apiVersion');
  
  console.log('File content length:', result.content?.length);
});

test('getYmlFileContent should fetch nested yaml file content', async () => {
  const result = await getYmlFileContent('here/some/long/directory/for/check/ierarchy/test.yml');
  
  expect(result.success).toBe(true);
  expect(typeof result.content).toBe('string');
  expect(result.content).toContain('apiVersion');
  expect(result.content).toContain('refty-bayut-district-property-parser');
  expect(result.content).toContain('ghcr.io/refty-yapi/refty-node/refty-node:05-06-42a252');
  
  console.log('Nested file content length:', result.content?.length);
});

 