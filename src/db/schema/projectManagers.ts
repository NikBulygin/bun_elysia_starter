import { pgTable, integer, bigint } from 'drizzle-orm/pg-core';
import { projects } from './projects';
import { users } from './users';

export const projectManagers = pgTable('project_managers', {
  projectId: integer('project_id').references(() => projects.id).notNull(),
  telegramUserId: bigint('telegram_user_id', { mode: 'number' }).references(() => users.telegramUserId).notNull(),
});

export type ProjectManager = typeof projectManagers.$inferSelect;
export type NewProjectManager = typeof projectManagers.$inferInsert;

