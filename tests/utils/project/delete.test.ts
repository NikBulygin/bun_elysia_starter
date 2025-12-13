// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { deleteProject } from '../../../src/utils/project/delete';
import { createProject } from '../../../src/utils/project/create';
import { getProjectById } from '../../../src/utils/project/getById';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';

describe('Project delete', () => {
  beforeAll(async () => {
    await waitForDatabase();
    await initTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();
  });

  test('should delete project', async () => {
    const created = await createProject({ name: 'Test Project' });
    const beforeDelete = await getProjectById(created.id);
    expect(beforeDelete).not.toBeNull();
    
    const deleted = await deleteProject(created.id);
    expect(deleted).toBe(true);
    
    const afterDelete = await getProjectById(created.id);
    expect(afterDelete).toBeNull();
  });

  test('should return false for non-existent project', async () => {
    const deleted = await deleteProject(99999);
    expect(deleted).toBe(false);
  });
});

