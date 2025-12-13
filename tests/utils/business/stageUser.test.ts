// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import * as businessStageUser from '../../../src/utils/business/stageUser';
import * as businessStage from '../../../src/utils/business/stage';
import * as businessProject from '../../../src/utils/business/project';
import * as businessUser from '../../../src/utils/business/user';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';
import { clearTestKeys, waitForRedis } from '../../helpers/redis';

describe('Business StageUser Utils', () => {
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
    const project = await businessProject.createProjectWithValidation({ name: 'Test Project' });
    projectId = project.id;
    const stage = await businessStage.createStageWithValidation({ name: 'Test Stage', projectId });
    stageId = stage.id;
  });

  test('should assign user to stage', async () => {
    await businessUser.getUserOrCreate('Bulygin_Nik');
    const assigned = await businessStageUser.assignUserToStageWithValidation(stageId, 'Bulygin_Nik');
    expect(assigned).toBe(true);
  });

  test('should remove user from stage', async () => {
    await businessUser.getUserOrCreate('Bulygin_Nik');
    await businessStageUser.assignUserToStageWithValidation(stageId, 'Bulygin_Nik');
    const removed = await businessStageUser.removeUserFromStageWithValidation(stageId, 'Bulygin_Nik');
    expect(removed).toBe(true);
  });

  test('should get stage users', async () => {
    await businessUser.getUserOrCreate('Bulygin_Nik');
    await businessStageUser.assignUserToStageWithValidation(stageId, 'Bulygin_Nik');
    const users = await businessStageUser.getStageUsers(stageId);
    expect(users.length).toBeGreaterThan(0);
  });
});

