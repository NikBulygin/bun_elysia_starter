// @ts-ignore
import { describe, test, expect, beforeEach } from 'bun:test';
import { validateInitData } from '../../../src/utils/telegram/validateInitData';
import { createHmac } from 'crypto';

describe('validateInitData', () => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || 'test_bot_token_1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  beforeEach(() => {
    // Ensure bot token is set
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      process.env.TELEGRAM_BOT_TOKEN = botToken;
    }
  });

  test('should validate correct initData', () => {
    // Create valid initData
    const user = {
      id: 123456789,
      first_name: 'Test',
      username: 'testuser',
    };
    
    const authDate = Math.floor(Date.now() / 1000);
    const queryId = 'test_query_id';
    
    // Build data_check_string
    const params = new URLSearchParams();
    params.set('auth_date', String(authDate));
    params.set('query_id', queryId);
    params.set('user', JSON.stringify(user));
    
    const dataCheckPairs: string[] = [];
    const sortedKeys = Array.from(params.keys()).sort();
    for (const key of sortedKeys) {
      const value = params.get(key);
      if (value !== null) {
        dataCheckPairs.push(`${key}=${value}`);
      }
    }
    const dataCheckString = dataCheckPairs.join('\n');
    
    // Calculate hash
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    const hash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    params.set('hash', hash);
    const initData = params.toString();
    
    const result = validateInitData(initData);
    
    expect(result.isValid).toBe(true);
    expect(result.telegramUserId).toBe(123456789);
    expect(result.user).toEqual(user);
    expect(result.authDate).toBe(authDate);
  });

  test('should reject invalid hash', () => {
    const user = {
      id: 123456789,
      first_name: 'Test',
    };
    
    const params = new URLSearchParams();
    params.set('auth_date', String(Math.floor(Date.now() / 1000)));
    params.set('user', JSON.stringify(user));
    params.set('hash', 'invalid_hash');
    
    const initData = params.toString();
    
    const result = validateInitData(initData);
    
    expect(result.isValid).toBe(false);
  });

  test('should reject missing hash', () => {
    const params = new URLSearchParams();
    params.set('auth_date', String(Math.floor(Date.now() / 1000)));
    params.set('user', JSON.stringify({ id: 123456789 }));
    
    const initData = params.toString();
    
    const result = validateInitData(initData);
    
    expect(result.isValid).toBe(false);
  });

  test('should reject empty initData', () => {
    const result = validateInitData('');
    
    expect(result.isValid).toBe(false);
  });

  test('should reject old auth_date (more than 24 hours)', () => {
    const user = {
      id: 123456789,
      first_name: 'Test',
    };
    
    // Create auth_date from 25 hours ago
    const oldAuthDate = Math.floor(Date.now() / 1000) - (25 * 60 * 60);
    
    const params = new URLSearchParams();
    params.set('auth_date', String(oldAuthDate));
    params.set('user', JSON.stringify(user));
    
    // Build data_check_string
    const dataCheckPairs: string[] = [];
    const sortedKeys = Array.from(params.keys()).sort();
    for (const key of sortedKeys) {
      const value = params.get(key);
      if (value !== null) {
        dataCheckPairs.push(`${key}=${value}`);
      }
    }
    const dataCheckString = dataCheckPairs.join('\n');
    
    // Calculate hash
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    const hash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    params.set('hash', hash);
    const initData = params.toString();
    
    const result = validateInitData(initData);
    
    expect(result.isValid).toBe(false);
  });
});

