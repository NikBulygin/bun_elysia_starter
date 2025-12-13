// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import * as businessManager from '../../../src/utils/business/manager';
import * as businessProject from '../../../src/utils/business/project';
import * as businessUser from '../../../src/utils/business/user';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';
import { clearTestKeys, waitForRedis } from '../../helpers/redis';

describe('Business Manager Utils', () => {
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
    const project = await businessProject.createProjectWithValidation({ name: 'Test Project' });
    projectId = project.id;
  });

  test('should assign manager to project', async () => {
    await businessUser.getUserOrCreate('Bulygin_Nik');
    const assigned = await businessManager.assignManagerToProject(projectId, 'Bulygin_Nik');
    expect(assigned).toBe(true);
  });

  test('should remove manager from project', async () => {
    await businessUser.getUserOrCreate('Bulygin_Nik');
    await businessManager.assignManagerToProject(projectId, 'Bulygin_Nik');
    const removed = await businessManager.removeManagerFromProject(projectId, 'Bulygin_Nik');
    expect(removed).toBe(true);
  });

  test('should get project managers', async () => {
    await businessUser.getUserOrCreate('Bulygin_Nik');
    await businessManager.assignManagerToProject(projectId, 'Bulygin_Nik');
    const managers = await businessManager.getProjectManagers(projectId);
    expect(managers.length).toBeGreaterThan(0);
  });
});

