/**
 * Unit tests for APIKeyManager
 * Requirements: 8.1, 8.2, 8.6
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { APIKeyManager } from './apiKeyManager';

describe('APIKeyManager', () => {
  let apiKeyManager: APIKeyManager;

  beforeEach(() => {
    apiKeyManager = new APIKeyManager();
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('setKey and getKey', () => {
    test('stores and retrieves valid OpenAI API key', () => {
      const validKey = 'sk-' + 'a'.repeat(48);
      
      const setResult = apiKeyManager.setKey('openai', validKey);
      expect(setResult.ok).toBe(true);

      const getResult = apiKeyManager.getKey('openai');
      expect(getResult.ok).toBe(true);
      if (getResult.ok) {
        expect(getResult.value).toBe(validKey);
      }
    });

    test('stores and retrieves valid Gemini API key', () => {
      const validKey = 'A'.repeat(39);
      
      const setResult = apiKeyManager.setKey('gemini', validKey);
      expect(setResult.ok).toBe(true);

      const getResult = apiKeyManager.getKey('gemini');
      expect(getResult.ok).toBe(true);
      if (getResult.ok) {
        expect(getResult.value).toBe(validKey);
      }
    });

    test('stores and retrieves valid Groq API key', () => {
      const validKey = 'gsk_' + 'b'.repeat(52);
      
      const setResult = apiKeyManager.setKey('groq', validKey);
      expect(setResult.ok).toBe(true);

      const getResult = apiKeyManager.getKey('groq');
      expect(getResult.ok).toBe(true);
      if (getResult.ok) {
        expect(getResult.value).toBe(validKey);
      }
    });

    test('rejects invalid OpenAI API key format', () => {
      const invalidKey = 'invalid-key';
      
      const result = apiKeyManager.setKey('openai', invalidKey);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('parse_error');
        expect(result.error.message).toContain('Invalid API key format');
      }
    });

    test('rejects OpenAI key with wrong prefix', () => {
      const invalidKey = 'pk-' + 'a'.repeat(48);
      
      const result = apiKeyManager.setKey('openai', invalidKey);
      expect(result.ok).toBe(false);
    });

    test('rejects OpenAI key with wrong length', () => {
      const invalidKey = 'sk-' + 'a'.repeat(30);
      
      const result = apiKeyManager.setKey('openai', invalidKey);
      expect(result.ok).toBe(false);
    });

    test('rejects invalid Gemini API key format', () => {
      const invalidKey = 'A'.repeat(20); // Too short
      
      const result = apiKeyManager.setKey('gemini', invalidKey);
      expect(result.ok).toBe(false);
    });

    test('rejects invalid Groq API key format', () => {
      const invalidKey = 'gsk_' + 'b'.repeat(30); // Too short
      
      const result = apiKeyManager.setKey('groq', invalidKey);
      expect(result.ok).toBe(false);
    });

    test('returns not_found error when key does not exist', () => {
      const result = apiKeyManager.getKey('openai');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('not_found');
        expect(result.error.message).toContain('No API key found');
      }
    });
  });

  describe('key isolation by provider', () => {
    test('stores keys for different providers independently', () => {
      const openaiKey = 'sk-' + 'a'.repeat(48);
      const geminiKey = 'B'.repeat(39);
      const groqKey = 'gsk_' + 'c'.repeat(52);

      apiKeyManager.setKey('openai', openaiKey);
      apiKeyManager.setKey('gemini', geminiKey);
      apiKeyManager.setKey('groq', groqKey);

      const openaiResult = apiKeyManager.getKey('openai');
      const geminiResult = apiKeyManager.getKey('gemini');
      const groqResult = apiKeyManager.getKey('groq');

      expect(openaiResult.ok).toBe(true);
      expect(geminiResult.ok).toBe(true);
      expect(groqResult.ok).toBe(true);

      if (openaiResult.ok) expect(openaiResult.value).toBe(openaiKey);
      if (geminiResult.ok) expect(geminiResult.value).toBe(geminiKey);
      if (groqResult.ok) expect(groqResult.value).toBe(groqKey);
    });

    test('clearing one provider key does not affect others', () => {
      const openaiKey = 'sk-' + 'a'.repeat(48);
      const geminiKey = 'B'.repeat(39);

      apiKeyManager.setKey('openai', openaiKey);
      apiKeyManager.setKey('gemini', geminiKey);

      const clearResult = apiKeyManager.clearKey('openai');
      expect(clearResult.ok).toBe(true);

      const openaiResult = apiKeyManager.getKey('openai');
      const geminiResult = apiKeyManager.getKey('gemini');

      expect(openaiResult.ok).toBe(false);
      expect(geminiResult.ok).toBe(true);
      if (geminiResult.ok) {
        expect(geminiResult.value).toBe(geminiKey);
      }
    });
  });

  describe('clearKey', () => {
    test('removes stored API key', () => {
      const validKey = 'sk-' + 'a'.repeat(48);
      
      apiKeyManager.setKey('openai', validKey);
      
      const clearResult = apiKeyManager.clearKey('openai');
      expect(clearResult.ok).toBe(true);

      const getResult = apiKeyManager.getKey('openai');
      expect(getResult.ok).toBe(false);
      if (!getResult.ok) {
        expect(getResult.error.type).toBe('not_found');
      }
    });

    test('clearing non-existent key succeeds', () => {
      const result = apiKeyManager.clearKey('openai');
      expect(result.ok).toBe(true);
    });
  });

  describe('hasKey', () => {
    test('returns true when key exists', () => {
      const validKey = 'sk-' + 'a'.repeat(48);
      apiKeyManager.setKey('openai', validKey);

      expect(apiKeyManager.hasKey('openai')).toBe(true);
    });

    test('returns false when key does not exist', () => {
      expect(apiKeyManager.hasKey('openai')).toBe(false);
    });

    test('returns false after key is cleared', () => {
      const validKey = 'sk-' + 'a'.repeat(48);
      apiKeyManager.setKey('openai', validKey);
      apiKeyManager.clearKey('openai');

      expect(apiKeyManager.hasKey('openai')).toBe(false);
    });
  });

  describe('clearAllKeys', () => {
    test('removes all API keys for all providers', () => {
      const openaiKey = 'sk-' + 'a'.repeat(48);
      const geminiKey = 'B'.repeat(39);
      const groqKey = 'gsk_' + 'c'.repeat(52);

      apiKeyManager.setKey('openai', openaiKey);
      apiKeyManager.setKey('gemini', geminiKey);
      apiKeyManager.setKey('groq', groqKey);

      const clearResult = apiKeyManager.clearAllKeys();
      expect(clearResult.ok).toBe(true);

      expect(apiKeyManager.hasKey('openai')).toBe(false);
      expect(apiKeyManager.hasKey('gemini')).toBe(false);
      expect(apiKeyManager.hasKey('groq')).toBe(false);
    });

    test('succeeds when no keys exist', () => {
      const result = apiKeyManager.clearAllKeys();
      expect(result.ok).toBe(true);
    });
  });

  describe('key format validation', () => {
    test('accepts OpenAI keys with alphanumeric characters', () => {
      const validKey = 'sk-' + 'aB1'.repeat(16); // 48 chars
      const result = apiKeyManager.setKey('openai', validKey);
      expect(result.ok).toBe(true);
    });

    test('accepts Gemini keys with alphanumeric, underscore, and dash', () => {
      const validKey = 'aB1_-'.repeat(7) + 'aB1_'; // 39 chars
      const result = apiKeyManager.setKey('gemini', validKey);
      expect(result.ok).toBe(true);
    });

    test('accepts Groq keys with correct prefix and length', () => {
      const validKey = 'gsk_' + 'aB1'.repeat(17) + 'a'; // gsk_ + 52 chars
      const result = apiKeyManager.setKey('groq', validKey);
      expect(result.ok).toBe(true);
    });

    test('rejects keys with special characters not in pattern', () => {
      const invalidKey = 'sk-' + 'a'.repeat(46) + '@!';
      const result = apiKeyManager.setKey('openai', invalidKey);
      expect(result.ok).toBe(false);
    });
  });

  describe('key update', () => {
    test('updates existing key with new value', () => {
      const oldKey = 'sk-' + 'a'.repeat(48);
      const newKey = 'sk-' + 'b'.repeat(48);

      apiKeyManager.setKey('openai', oldKey);
      apiKeyManager.setKey('openai', newKey);

      const result = apiKeyManager.getKey('openai');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(newKey);
      }
    });
  });
});
