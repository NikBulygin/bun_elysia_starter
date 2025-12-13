// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { createStage } from '../../../src/utils/stage/create';
import { getStageById } from '../../../src/utils/stage/getById';
import { createProject } from '../../../src/utils/project/create';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';

describe('Stage create', () => {
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

  test('should create stage', async () => {
    const stage = await createStage({ name: 'Test Stage', projectId });
    
    expect(stage).not.toBeNull();
    expect(stage.id).toBeGreaterThan(0);
    expect(stage.name).toBe('Test Stage');
    expect(stage.projectId).toBe(projectId);
  });

  test('should create stage and retrieve it', async () => {
    const created = await createStage({ name: 'Test Stage 2', projectId });
    const retrieved = await getStageById(created.id);
    
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(created.id);
    expect(retrieved?.name).toBe('Test Stage 2');
  });
});

