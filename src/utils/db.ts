import { db } from '../db';
import { encryptedData } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

const encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

/**
 * Encrypt data using pgcrypto
 */
export async function encryptData(data: string): Promise<Buffer> {
  const result = await db.execute<{ encrypted: Buffer }>(
    sql`SELECT pgp_sym_encrypt(${data}, ${encryptionKey}) as encrypted`
  );
  return (result as any)[0].encrypted;
}

/**
 * Decrypt data using pgcrypto
 */
export async function decryptData(encrypted: Buffer): Promise<string> {
  const result = await db.execute<{ decrypted: string }>(
    sql`SELECT pgp_sym_decrypt(${encrypted}, ${encryptionKey}) as decrypted`
  );
  return (result as any)[0].decrypted;
}

/**
 * Insert encrypted data
 */
export async function insertEncryptedData(data: string): Promise<number> {
  const encrypted = await encryptData(data);
  const result = await db.insert(encryptedData).values({
    encryptedValue: encrypted,
  }).returning({ id: encryptedData.id });
  return result[0].id;
}

/**
 * Get and decrypt data by id
 */
export async function getDecryptedData(id: number): Promise<string | null> {
  const result = await db.select()
    .from(encryptedData)
    .where(eq(encryptedData.id, id))
    .limit(1);
  
  if (result.length === 0) {
    return null;
  }
  
  return await decryptData(result[0].encryptedValue);
}

/**
 * Get raw encrypted data (for testing encryption)
 */
export async function getRawEncryptedData(id: number): Promise<Buffer | null> {
  const result = await db.select({ encryptedValue: encryptedData.encryptedValue })
    .from(encryptedData)
    .where(eq(encryptedData.id, id))
    .limit(1);
  
  if (result.length === 0) {
    return null;
  }
  
  return result[0].encryptedValue;
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}
