// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { assignManager } from '../../../src/utils/manager/assign';
import { removeManager } from '../../../src/utils/manager/remove';
import { getManagersByProject } from '../../../src/utils/manager/getByProject';
import { createProject } from '../../../src/utils/project/create';
import { getOrCreate } from '../../../src/utils/user/getOrCreate';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';
import { clearTestKeys, waitForRedis } from '../../helpers/redis';

describe('Manager remove', () => {
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

  test('should remove manager from project', async () => {
    await getOrCreate('Bulygin_Nik');
    await assignManager(projectId, 'Bulygin_Nik');
    
    const beforeRemove = await getManagersByProject(projectId);
    expect(beforeRemove.some(m => m.username === 'Bulygin_Nik')).toBe(true);
    
    const removed = await removeManager(projectId, 'Bulygin_Nik');
    expect(removed).toBe(true);
    
    const afterRemove = await getManagersByProject(projectId);
    expect(afterRemove.some(m => m.username === 'Bulygin_Nik')).toBe(false);
  });

  test('should return false for non-assigned manager', async () => {
    await getOrCreate('Bulygin_Nik');
    const removed = await removeManager(projectId, 'Bulygin_Nik');
    expect(removed).toBe(false);
  });
});

