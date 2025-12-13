// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { updateStageFields } from '../../../src/utils/stage/updateFields';
import { createStage } from '../../../src/utils/stage/create';
import { getStageById } from '../../../src/utils/stage/getById';
import { createProject } from '../../../src/utils/project/create';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';

describe('Stage updateFields', () => {
  let projectId: number;

  beforeAll(async () => {
    await waitForDatabase();
    await initTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();
    const project = await createProject({ name: 'Test Project' });
    projectId = project.id;
  });

  test('should update stage name', async () => {
    const created = await createStage({ name: 'Old Name', projectId });
    const updated = await updateStageFields(created.id, { name: 'New Name' });
    
    expect(updated).not.toBeNull();
    expect(updated?.name).toBe('New Name');
    
    const retrieved = await getStageById(created.id);
    expect(retrieved?.name).toBe('New Name');
  });

  test('should return null for non-existent stage', async () => {
    const updated = await updateStageFields(99999, { name: 'New Name' });
    expect(updated).toBeNull();
  });
});

