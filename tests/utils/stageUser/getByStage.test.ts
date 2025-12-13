// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { getUsersByStage } from '../../../src/utils/stageUser/getByStage';
import { assignUserToStage } from '../../../src/utils/stageUser/assign';
import { createStage } from '../../../src/utils/stage/create';
import { createProject } from '../../../src/utils/project/create';
import { getOrCreate } from '../../../src/utils/user/getOrCreate';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';
import { clearTestKeys, waitForRedis } from '../../helpers/redis';

describe('StageUser getByStage', () => {
  let projectId: number;
  let stageId: number;

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
    const stage = await createStage({ name: 'Test Stage', projectId });
    stageId = stage.id;
  });

  test('should get users for stage with username', async () => {
    await getOrCreate('Bulygin_Nik');
    await assignUserToStage(stageId, 'Bulygin_Nik');
    
    const users = await getUsersByStage(stageId);
    
    expect(users.length).toBeGreaterThan(0);
    const user = users.find(u => u.username === 'Bulygin_Nik');
    expect(user).toBeDefined();
    expect(user?.username).toBe('Bulygin_Nik');
    expect(user?.telegramUserId).toBeGreaterThan(0);
  });

  test('should return empty array when no users', async () => {
    const users = await getUsersByStage(stageId);
    expect(users).toEqual([]);
  });
});

