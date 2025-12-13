import { createProject } from '../project/create';
import { getProjectById } from '../project/getById';
import { getAllProjects, getProjectsWithAccess } from '../project/getAll';
import { updateProjectFields } from '../project/updateFields';
import { deleteProject } from '../project/delete';
import { getManagersByProject } from '../manager/getByProject';
import { getByTelegramUserId } from '../user/getByTelegramUserId';
import type { Project } from '../../db/schema/projects';

/**
 * Business logic for project operations
 */

export async function createProjectWithValidation(data: { name: string }): Promise<Project> {
  return await createProject(data);
}

export async function getProjectWithManagers(id: number) {
  const project = await getProjectById(id);
  if (!project) {
    return null;
  }

  const managers = await getManagersByProject(id);
  return {
    ...project,
    managers,
  };
}

export async function getAllProjectsWithAccess(
  telegramUserId: number,
  offset: number = 0,
  limit: number = 10
): Promise<{ projects: Project[]; total: number; offset: number; limit: number }> {
  // Get user to determine role
  const user = await getByTelegramUserId(telegramUserId);
  if (!user) {
    return { projects: [], total: 0, offset, limit };
  }

  const result = await getProjectsWithAccess(telegramUserId, user.role, offset, limit);
  return {
    ...result,
    offset,
    limit,
  };
}

export async function updateProjectWithValidation(id: number, fields: { name?: string }): Promise<Project | null> {
  return await updateProjectFields(id, fields);
}

export async function deleteProjectWithValidation(id: number): Promise<boolean> {
  return await deleteProject(id);
}

