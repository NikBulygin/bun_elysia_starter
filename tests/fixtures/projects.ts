import { NewProject } from '../../src/db/schema/projects';

/**
 * Test project fixtures
 */

export const testProject1: NewProject = {
  name: 'Test Project 1',
};

export const testProject2: NewProject = {
  name: 'Test Project 2',
};

export const testProjects: NewProject[] = [testProject1, testProject2];

