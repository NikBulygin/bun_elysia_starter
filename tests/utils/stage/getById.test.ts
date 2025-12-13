// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { getStageById } from '../../../src/utils/stage/getById';
import { createStage } from '../../../src/utils/stage/create';
import { createProject } from '../../../src/utils/project/create';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';

describe('Stage getById', () => {
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

  test('should get stage by id', async () => {
    const created = await createStage({ name: 'Test Stage', projectId });
    const stage = await getStageById(created.id);
    
    expect(stage).not.toBeNull();
    expect(stage?.id).toBe(created.id);
    expect(stage?.name).toBe('Test Stage');
  });

  test('should return null for non-existent stage', async () => {
    const stage = await getStageById(99999);
    expect(stage).toBeNull();
  });
});

