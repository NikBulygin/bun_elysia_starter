// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { getManagersByProject } from '../../../src/utils/manager/getByProject';
import { assignManager } from '../../../src/utils/manager/assign';
import { createProject } from '../../../src/utils/project/create';
import { getOrCreate } from '../../../src/utils/user/getOrCreate';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';
import { clearTestKeys, waitForRedis } from '../../helpers/redis';

describe('Manager getByProject', () => {
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

  test('should get managers for project with username', async () => {
    await getOrCreate('Bulygin_Nik');
    await assignManager(projectId, 'Bulygin_Nik');
    
    const managers = await getManagersByProject(projectId);
    
    expect(managers.length).toBeGreaterThan(0);
    const manager = managers.find(m => m.username === 'Bulygin_Nik');
    expect(manager).toBeDefined();
    expect(manager?.username).toBe('Bulygin_Nik');
    expect(manager?.telegramUserId).toBeGreaterThan(0);
  });

  test('should return empty array when no managers', async () => {
    const managers = await getManagersByProject(projectId);
    expect(managers).toEqual([]);
  });
});

