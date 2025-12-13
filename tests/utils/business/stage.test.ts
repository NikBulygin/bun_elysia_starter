// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import * as businessStage from '../../../src/utils/business/stage';
import * as businessProject from '../../../src/utils/business/project';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';

describe('Business Stage Utils', () => {
  let projectId: number;

  beforeAll(async () => {
    await waitForDatabase();
    await initTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();
    const project = await businessProject.createProjectWithValidation({ name: 'Test Project' });
    projectId = project.id;
  });

  test('should create stage', async () => {
    const stage = await businessStage.createStageWithValidation({ name: 'Test Stage', projectId });
    expect(stage).not.toBeNull();
    expect(stage.name).toBe('Test Stage');
  });

  test('should get stage with users', async () => {
    const created = await businessStage.createStageWithValidation({ name: 'Test Stage', projectId });
    const stage = await businessStage.getStageWithUsers(created.id);
    
    expect(stage).not.toBeNull();
    expect(stage?.name).toBe('Test Stage');
    expect(stage?.users).toBeDefined();
    expect(Array.isArray(stage?.users)).toBe(true);
  });

  test('should update stage', async () => {
    const created = await businessStage.createStageWithValidation({ name: 'Old Name', projectId });
    const updated = await businessStage.updateStageWithValidation(created.id, { name: 'New Name' });
    expect(updated?.name).toBe('New Name');
  });

  test('should delete stage', async () => {
    const created = await businessStage.createStageWithValidation({ name: 'Test Stage', projectId });
    const deleted = await businessStage.deleteStageWithValidation(created.id);
    expect(deleted).toBe(true);
  });
});

