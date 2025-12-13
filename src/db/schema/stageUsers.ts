import { pgTable, integer, bigint } from 'drizzle-orm/pg-core';
import { stages } from './stages';
import { users } from './users';

export const stageUsers = pgTable('stage_users', {
  stageId: integer('stage_id').references(() => stages.id).notNull(),
  telegramUserId: bigint('telegram_user_id', { mode: 'number' }).references(() => users.telegramUserId).notNull(),
});

export type StageUser = typeof stageUsers.$inferSelect;
export type NewStageUser = typeof stageUsers.$inferInsert;

