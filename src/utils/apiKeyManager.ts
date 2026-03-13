/**
 * APIKeyManager - Handles secure storage and validation of API keys
 * Requirements: 8.1, 8.2, 8.6
 */

import { Result, StorageError } from '../types';

/**
 * Supported AI providers
 */
export type AIProvider = 'openai' | 'gemini' | 'groq';

/**
 * API key validation patterns for each provider
 */
const API_KEY_PATTERNS: Record<AIProvider, RegExp> = {
  openai: /^sk-[A-Za-z0-9]{48}$/,
  gemini: /^[A-Za-z0-9_-]{39}$/,
  groq: /^gsk_[A-Za-z0-9]{52}$/
};

/**
 * localStorage key prefix for API keys
 */
const API_KEY_PREFIX = 'devforge_api_key_';

export class APIKeyManager {
  /**
   * Validate API key format for a specific provider
   * Requirement 8.1: Validate key format before storage
   */
  private validateKeyFormat(provider: AIProvider, apiKey: string): boolean {
    const pattern = API_KEY_PATTERNS[provider];
    return pattern.test(apiKey);
  }

  /**
   * Get the storage key for a specific provider
   * Requirement 8.6: Provide isolation by provider
   */
  private getStorageKey(provider: AIProvider): string {
    return `${API_KEY_PREFIX}${provider}`;
  }

  /**
   * Store an API key for a specific provider
   * Requirement 8.2: Store keys securely in localStorage
   * Requirement 8.1: Validate key format before storage
   * Requirement 8.6: Provide isolation by provider
   */
  setKey(provider: AIProvider, apiKey: string): Result<void, StorageError> {
    try {
      // Validate key format before storage
      if (!this.validateKeyFormat(provider, apiKey)) {
        return {
          ok: false,
          error: {
            type: 'parse_error',
            message: `Invalid API key format for ${provider}`
          }
        };
      }

      // Store key in localStorage with provider-specific key
      const storageKey = this.getStorageKey(provider);
      localStorage.setItem(storageKey, apiKey);

      return { ok: true, value: undefined };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'QuotaExceededError' || 
            (error as any).code === 22 || 
            (error as any).code === 1014) {
          return {
            ok: false,
            error: {
              type: 'quota_exceeded',
              message: 'Storage capacity reached'
            }
          };
        }
        
        return {
          ok: false,
          error: {
            type: 'parse_error',
            message: `Failed to store API key: ${error.message}`
          }
        };
      }

      return {
        ok: false,
        error: {
          type: 'parse_error',
          message: 'Unknown error occurred while storing API key'
        }
      };
    }
  }

  /**
   * Retrieve an API key for a specific provider
   * Requirement 8.2: Store keys securely in localStorage
   * Requirement 8.6: Provide isolation by provider
   */
  getKey(provider: AIProvider): Result<string, StorageError> {
    try {
      const storageKey = this.getStorageKey(provider);
      const apiKey = localStorage.getItem(storageKey);

      if (apiKey === null) {
        return {
          ok: false,
          error: {
            type: 'not_found',
            message: `No API key found for ${provider}`
          }
        };
      }

      return { ok: true, value: apiKey };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'parse_error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Remove an API key for a specific provider
   * Requirement 8.6: Provide isolation by provider
   */
  clearKey(provider: AIProvider): Result<void, StorageError> {
    try {
      const storageKey = this.getStorageKey(provider);
      localStorage.removeItem(storageKey);

      return { ok: true, value: undefined };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'parse_error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Check if an API key exists for a specific provider
   * Requirement 8.6: Provide isolation by provider
   */
  hasKey(provider: AIProvider): boolean {
    const storageKey = this.getStorageKey(provider);
    return localStorage.getItem(storageKey) !== null;
  }

  /**
   * Clear all API keys for all providers
   */
  clearAllKeys(): Result<void, StorageError> {
    try {
      const providers: AIProvider[] = ['openai', 'gemini', 'groq'];
      
      for (const provider of providers) {
        const storageKey = this.getStorageKey(provider);
        localStorage.removeItem(storageKey);
      }

      return { ok: true, value: undefined };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'parse_error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}
