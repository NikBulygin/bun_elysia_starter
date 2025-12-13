// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { createProject } from '../../../src/utils/project/create';
import { getProjectById } from '../../../src/utils/project/getById';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';

describe('Project create', () => {
  beforeAll(async () => {
    await waitForDatabase();
    await initTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();
  });

  test('should create project', async () => {
    const project = await createProject({ name: 'Test Project' });
    
    expect(project).not.toBeNull();
    expect(project.id).toBeGreaterThan(0);
    expect(project.name).toBe('Test Project');
  });

  test('should create project and retrieve it', async () => {
    const created = await createProject({ name: 'Test Project 2' });
    const retrieved = await getProjectById(created.id);
    
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(created.id);
    expect(retrieved?.name).toBe('Test Project 2');
  });
});

