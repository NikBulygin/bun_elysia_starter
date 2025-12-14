import { pgTable, serial, varchar, pgEnum, jsonb } from 'drizzle-orm/pg-core';

export const providerTypeEnum = pgEnum('provider_type', ['time', 'tasks']);

export const providers = pgTable('providers', {
  id: serial('id').primaryKey(),
  type: providerTypeEnum('type').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  credentials: jsonb('credentials').$type<Record<string, unknown>>().notNull(),
});

export type Provider = typeof providers.$inferSelect;
export type NewProvider = typeof providers.$inferInsert;

