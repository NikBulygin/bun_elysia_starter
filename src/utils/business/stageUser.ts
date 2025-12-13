import { assignUserToStage } from '../stageUser/assign';
import { removeUserFromStage } from '../stageUser/remove';
import { getUsersByStage } from '../stageUser/getByStage';

/**
 * Business logic for stage-user operations
 */

export async function assignUserToStageWithValidation(stageId: number, username: string): Promise<boolean> {
  return await assignUserToStage(stageId, username);
}

export async function removeUserFromStageWithValidation(stageId: number, username: string): Promise<boolean> {
  return await removeUserFromStage(stageId, username);
}

export async function getStageUsers(stageId: number) {
  return await getUsersByStage(stageId);
}

