import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';
import { projects } from './projects';

export const stages = pgTable('stages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  projectId: integer('project_id').references(() => projects.id).notNull(),
});

export type Stage = typeof stages.$inferSelect;
export type NewStage = typeof stages.$inferInsert;

