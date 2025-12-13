// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { getProjectById } from '../../../src/utils/project/getById';
import { createProject } from '../../../src/utils/project/create';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';

describe('Project getById', () => {
  beforeAll(async () => {
    await waitForDatabase();
    await initTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();
  });

  test('should get project by id', async () => {
    const created = await createProject({ name: 'Test Project' });
    const project = await getProjectById(created.id);
    
    expect(project).not.toBeNull();
    expect(project?.id).toBe(created.id);
    expect(project?.name).toBe('Test Project');
  });

  test('should return null for non-existent project', async () => {
    const project = await getProjectById(99999);
    expect(project).toBeNull();
  });
});

