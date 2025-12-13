// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { 
  testConnection, 
  insertEncryptedData, 
  getDecryptedData, 
  getRawEncryptedData
} from '../src/utils/db';
import { db } from '../src/db';
import { sql } from 'drizzle-orm';
import { initDatabase } from '../src/db/migrate';

// Helper to convert Uint8Array to string for comparison
function uint8ArrayToString(data: Uint8Array | null): string {
  if (!data) return '';
  // @ts-ignore - Buffer is available in Bun runtime
  const buffer = typeof Buffer !== 'undefined' ? Buffer.from(data) : new TextDecoder().decode(data);
  return buffer.toString ? buffer.toString('utf8') : new TextDecoder().decode(data);
}

describe('Database Tests', () => {
  beforeAll(async () => {
    // Wait for database to be ready
    let retries = 10;
    while (retries > 0) {
      const connected = await testConnection();
      if (connected) break;
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries--;
    }
    
    // Initialize database (create extension and tables)
    await initDatabase();
  });

  afterAll(async () => {
    await db.execute(sql`TRUNCATE TABLE encrypted_data RESTART IDENTITY`);
  });

  test('should connect to database', async () => {
    const connected = await testConnection();
    expect(connected).toBe(true);
  });

  test('should encrypt and store data in database', async () => {
    const testData = 'sensitive information 123';
    const id = await insertEncryptedData(testData);
    
    expect(id).toBeGreaterThan(0);
    
    // Verify data is stored (encrypted)
    const rawData = await getRawEncryptedData(id);
    expect(rawData).not.toBeNull();
    expect(rawData instanceof Uint8Array).toBe(true);
    
    // Verify encrypted data is different from original
    const rawString = uint8ArrayToString(rawData);
    expect(rawString).not.toBe(testData);
    expect(rawString).not.toContain('sensitive');
  });

  test('should decrypt data from database', async () => {
    const testData = 'another secret message';
    const id = await insertEncryptedData(testData);
    
    const decrypted = await getDecryptedData(id);
    expect(decrypted).toBe(testData);
  });

  test('should verify encryption in database', async () => {
    const testData = 'test encryption verification';
    const id = await insertEncryptedData(testData);
    
    // Get raw encrypted value from database
    const rawEncrypted = await getRawEncryptedData(id);
    expect(rawEncrypted).not.toBeNull();
    
    // Verify it's encrypted (not plain text)
    const rawString = uint8ArrayToString(rawEncrypted);
    expect(rawString).not.toBe(testData);
    
    // Verify we can decrypt it back
    const decrypted = await getDecryptedData(id);
    expect(decrypted).toBe(testData);
  });

  test('application should access decrypted data', async () => {
    const originalData = 'application access test data';
    const id = await insertEncryptedData(originalData);
    
    // Application retrieves decrypted data
    const decryptedData = await getDecryptedData(id);
    
    expect(decryptedData).toBe(originalData);
    expect(decryptedData).not.toBeNull();
    expect(typeof decryptedData).toBe('string');
  });
});

