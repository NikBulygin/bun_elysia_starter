// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { getAllProjects } from '../../../src/utils/project/getAll';
import { createProject } from '../../../src/utils/project/create';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';

describe('Project getAll', () => {
  beforeAll(async () => {
    await waitForDatabase();
    await initTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();
  });

  test('should get all projects', async () => {
    await createProject({ name: 'Project 1' });
    await createProject({ name: 'Project 2' });
    
    const projects = await getAllProjects();
    
    expect(projects.length).toBeGreaterThanOrEqual(2);
    expect(projects.some(p => p.name === 'Project 1')).toBe(true);
    expect(projects.some(p => p.name === 'Project 2')).toBe(true);
  });

  test('should return empty array when no projects', async () => {
    const projects = await getAllProjects();
    expect(projects).toEqual([]);
  });
});

