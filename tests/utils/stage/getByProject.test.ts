// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { getStagesByProject } from '../../../src/utils/stage/getByProject';
import { createStage } from '../../../src/utils/stage/create';
import { createProject } from '../../../src/utils/project/create';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';

describe('Stage getByProject', () => {
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

  test('should get all stages for project', async () => {
    await createStage({ name: 'Stage 1', projectId });
    await createStage({ name: 'Stage 2', projectId });
    
    const stages = await getStagesByProject(projectId);
    
    expect(stages.length).toBeGreaterThanOrEqual(2);
    expect(stages.some(s => s.name === 'Stage 1')).toBe(true);
    expect(stages.some(s => s.name === 'Stage 2')).toBe(true);
  });

  test('should return empty array when no stages', async () => {
    const stages = await getStagesByProject(projectId);
    expect(stages).toEqual([]);
  });
});

