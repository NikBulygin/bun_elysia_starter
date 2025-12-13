// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import * as businessProject from '../../../src/utils/business/project';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';

describe('Business Project Utils', () => {
  beforeAll(async () => {
    await waitForDatabase();
    await initTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();
  });

  test('should create project', async () => {
    const project = await businessProject.createProjectWithValidation({ name: 'Test Project' });
    expect(project).not.toBeNull();
    expect(project.name).toBe('Test Project');
  });

  test('should get project with managers', async () => {
    const created = await businessProject.createProjectWithValidation({ name: 'Test Project' });
    const project = await businessProject.getProjectWithManagers(created.id);
    
    expect(project).not.toBeNull();
    expect(project?.name).toBe('Test Project');
    expect(project?.managers).toBeDefined();
    expect(Array.isArray(project?.managers)).toBe(true);
  });

  test('should update project', async () => {
    const created = await businessProject.createProjectWithValidation({ name: 'Old Name' });
    const updated = await businessProject.updateProjectWithValidation(created.id, { name: 'New Name' });
    expect(updated?.name).toBe('New Name');
  });

  test('should delete project', async () => {
    const created = await businessProject.createProjectWithValidation({ name: 'Test Project' });
    const deleted = await businessProject.deleteProjectWithValidation(created.id);
    expect(deleted).toBe(true);
  });
});

