// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { assignUserToStage } from '../../../src/utils/stageUser/assign';
import { removeUserFromStage } from '../../../src/utils/stageUser/remove';
import { getUsersByStage } from '../../../src/utils/stageUser/getByStage';
import { createStage } from '../../../src/utils/stage/create';
import { createProject } from '../../../src/utils/project/create';
import { getOrCreate } from '../../../src/utils/user/getOrCreate';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';
import { clearTestKeys, waitForRedis } from '../../helpers/redis';

describe('StageUser remove', () => {
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

  test('should remove user from stage', async () => {
    await getOrCreate('Bulygin_Nik');
    await assignUserToStage(stageId, 'Bulygin_Nik');
    
    const beforeRemove = await getUsersByStage(stageId);
    expect(beforeRemove.some(u => u.username === 'Bulygin_Nik')).toBe(true);
    
    const removed = await removeUserFromStage(stageId, 'Bulygin_Nik');
    expect(removed).toBe(true);
    
    const afterRemove = await getUsersByStage(stageId);
    expect(afterRemove.some(u => u.username === 'Bulygin_Nik')).toBe(false);
  });

  test('should return false for non-assigned user', async () => {
    await getOrCreate('Bulygin_Nik');
    const removed = await removeUserFromStage(stageId, 'Bulygin_Nik');
    expect(removed).toBe(false);
  });
});

