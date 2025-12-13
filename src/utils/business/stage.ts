import { createStage } from '../stage/create';
import { getStageById } from '../stage/getById';
import { getStagesByProject } from '../stage/getByProject';
import { updateStageFields } from '../stage/updateFields';
import { deleteStage } from '../stage/delete';
import { getUsersByStage } from '../stageUser/getByStage';
import type { Stage } from '../../db/schema/stages';

/**
 * Business logic for stage operations
 */

export async function createStageWithValidation(data: { name: string; projectId: number }): Promise<Stage> {
  return await createStage(data);
}

export async function getStageWithUsers(id: number) {
  const stage = await getStageById(id);
  if (!stage) {
    return null;
  }

  const users = await getUsersByStage(id);
  return {
    ...stage,
    users,
  };
}

export async function getStagesByProjectWithUsers(projectId: number) {
  return await getStagesByProject(projectId);
}

export async function updateStageWithValidation(id: number, fields: { name?: string; projectId?: number }): Promise<Stage | null> {
  return await updateStageFields(id, fields);
}

export async function deleteStageWithValidation(id: number): Promise<boolean> {
  return await deleteStage(id);
}

