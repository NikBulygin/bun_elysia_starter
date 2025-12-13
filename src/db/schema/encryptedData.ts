import { pgTable, serial, timestamp, customType } from 'drizzle-orm/pg-core';

const bytea = customType<{ data: Uint8Array; driverData: Uint8Array }>({
  dataType: () => 'bytea',
  toDriver: (value) => value,
  fromDriver: (value) => value,
});

export const encryptedData = pgTable('encrypted_data', {
  id: serial('id').primaryKey(),
  encryptedValue: bytea('encrypted_value').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type EncryptedData = typeof encryptedData.$inferSelect;
export type NewEncryptedData = typeof encryptedData.$inferInsert;

