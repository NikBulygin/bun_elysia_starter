// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { assignManager } from '../../../src/utils/manager/assign';
import { getManagersByProject } from '../../../src/utils/manager/getByProject';
import { createProject } from '../../../src/utils/project/create';
import { getOrCreate } from '../../../src/utils/user/getOrCreate';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';
import { clearTestKeys, waitForRedis } from '../../helpers/redis';

describe('Manager assign', () => {
  let projectId: number;

  beforeAll(async () => {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is required for tests');
    }
    
    await waitForDatabase();
    await waitForRedis();
    await initTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();
    await clearTestKeys();
    const project = await createProject({ name: 'Test Project' });
    projectId = project.id;
  });

  test('should assign manager to project', async () => {
    await getOrCreate('Bulygin_Nik');
    
    const assigned = await assignManager(projectId, 'Bulygin_Nik');
    expect(assigned).toBe(true);
    
    const managers = await getManagersByProject(projectId);
    expect(managers.length).toBeGreaterThan(0);
    expect(managers.some(m => m.username === 'Bulygin_Nik')).toBe(true);
  });

  test('should return false for non-existent user', async () => {
    const randomUsername = `nonexistent_${Date.now()}`;
    const assigned = await assignManager(projectId, randomUsername);
    expect(assigned).toBe(false);
  });
});

