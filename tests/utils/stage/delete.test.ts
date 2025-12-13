// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { deleteStage } from '../../../src/utils/stage/delete';
import { createStage } from '../../../src/utils/stage/create';
import { getStageById } from '../../../src/utils/stage/getById';
import { createProject } from '../../../src/utils/project/create';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';

describe('Stage delete', () => {
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

  test('should delete stage', async () => {
    const created = await createStage({ name: 'Test Stage', projectId });
    const beforeDelete = await getStageById(created.id);
    expect(beforeDelete).not.toBeNull();
    
    const deleted = await deleteStage(created.id);
    expect(deleted).toBe(true);
    
    const afterDelete = await getStageById(created.id);
    expect(afterDelete).toBeNull();
  });

  test('should return false for non-existent stage', async () => {
    const deleted = await deleteStage(99999);
    expect(deleted).toBe(false);
  });
});

