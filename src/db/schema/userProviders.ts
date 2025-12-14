import { pgTable, bigint, integer, jsonb, primaryKey } from 'drizzle-orm/pg-core';
import { users } from './users';
import { providers } from './providers';

export const userProviders = pgTable('user_providers', {
  telegramUserId: bigint('telegram_user_id', { mode: 'number' })
    .references(() => users.telegramUserId)
    .notNull(),
  providerId: integer('provider_id')
    .references(() => providers.id)
    .notNull(),
  credentials: jsonb('credentials').$type<Record<string, unknown>>().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.telegramUserId, table.providerId] }),
}));

export type UserProvider = typeof userProviders.$inferSelect;
export type NewUserProvider = typeof userProviders.$inferInsert;

