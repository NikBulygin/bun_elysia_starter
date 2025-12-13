// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { updateProjectFields } from '../../../src/utils/project/updateFields';
import { createProject } from '../../../src/utils/project/create';
import { getProjectById } from '../../../src/utils/project/getById';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';

describe('Project updateFields', () => {
  beforeAll(async () => {
    await waitForDatabase();
    await initTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();
  });

  test('should update project name', async () => {
    const created = await createProject({ name: 'Old Name' });
    const updated = await updateProjectFields(created.id, { name: 'New Name' });
    
    expect(updated).not.toBeNull();
    expect(updated?.name).toBe('New Name');
    
    const retrieved = await getProjectById(created.id);
    expect(retrieved?.name).toBe('New Name');
  });

  test('should return null for non-existent project', async () => {
    const updated = await updateProjectFields(99999, { name: 'New Name' });
    expect(updated).toBeNull();
  });
});

