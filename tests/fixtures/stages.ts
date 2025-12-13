import { NewStage } from '../../src/db/schema/stages';

/**
 * Test stage fixtures
 */

export const testStage1: NewStage = {
  name: 'Stage 1',
  projectId: 1, // Will be set dynamically in tests
};

export const testStage2: NewStage = {
  name: 'Stage 2',
  projectId: 1, // Will be set dynamically in tests
};

export const testStages: NewStage[] = [testStage1, testStage2];

