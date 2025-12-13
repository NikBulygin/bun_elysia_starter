// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { assignUserToStage } from '../../../src/utils/stageUser/assign';
import { getUsersByStage } from '../../../src/utils/stageUser/getByStage';
import { createStage } from '../../../src/utils/stage/create';
import { createProject } from '../../../src/utils/project/create';
import { getOrCreate } from '../../../src/utils/user/getOrCreate';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';
import { clearTestKeys, waitForRedis } from '../../helpers/redis';

describe('StageUser assign', () => {
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

  test('should assign user to stage', async () => {
    await getOrCreate('Bulygin_Nik');
    
    const assigned = await assignUserToStage(stageId, 'Bulygin_Nik');
    expect(assigned).toBe(true);
    
    const users = await getUsersByStage(stageId);
    expect(users.length).toBeGreaterThan(0);
    expect(users.some(u => u.username === 'Bulygin_Nik')).toBe(true);
  });

  test('should return false for non-existent user', async () => {
    const randomUsername = `nonexistent_${Date.now()}`;
    const assigned = await assignUserToStage(stageId, randomUsername);
    expect(assigned).toBe(false);
  });
});

