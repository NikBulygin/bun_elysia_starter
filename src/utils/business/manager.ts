import { assignManager } from '../manager/assign';
import { removeManager } from '../manager/remove';
import { getManagersByProject } from '../manager/getByProject';

/**
 * Business logic for manager operations
 */

export async function assignManagerToProject(projectId: number, username: string): Promise<boolean> {
  return await assignManager(projectId, username);
}

export async function removeManagerFromProject(projectId: number, username: string): Promise<boolean> {
  return await removeManager(projectId, username);
}

export async function getProjectManagers(projectId: number) {
  return await getManagersByProject(projectId);
}

