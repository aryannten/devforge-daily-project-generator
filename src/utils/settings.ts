/**
 * SettingsManager - Manages user settings and preferences
 * Requirements: 7.1, 7.5, 8.1, 8.2, 8.7, 14.6
 */

import { UserSettings, AIConfig, Result, StorageError } from '../types';
import { StorageManager } from './storage';
import { CATEGORIES, DEFAULT_SETTINGS } from './constants';

export class SettingsManager {
  private storageManager: StorageManager;

  constructor(storageManager: StorageManager) {
    this.storageManager = storageManager;
  }

  /**
   * Get current category preferences
   * Requirement 7.1: Provide settings interface for category selection
   * Requirement 7.5: Persist category preferences across sessions
   */
  getCategories(): string[] {
    const settingsResult = this.storageManager.getSettings();
    
    if (!settingsResult.ok) {
      return DEFAULT_SETTINGS.categories;
    }
    
    return settingsResult.value.categories;
  }

  /**
   * Set category preferences
   * Requirement 7.1: Provide settings interface for category selection
   * Requirement 7.5: Persist category preferences across sessions
   */
  setCategories(categories: string[]): Result<void, StorageError> {
    const settingsResult = this.storageManager.getSettings();
    const currentSettings = settingsResult.ok ? settingsResult.value : DEFAULT_SETTINGS;
    
    const updatedSettings: UserSettings = {
      ...currentSettings,
      categories
    };
    
    return this.storageManager.saveSettings(updatedSettings);
  }

  /**
   * Get current AI configuration
   * Requirement 8.1: Provide settings interface for API key input
   * Requirement 8.2: Store API key securely in localStorage
   */
  getAIConfig(): AIConfig {
    const settingsResult = this.storageManager.getSettings();
    
    if (!settingsResult.ok) {
      return DEFAULT_SETTINGS.aiConfig;
    }
    
    return settingsResult.value.aiConfig;
  }

  /**
   * Set AI configuration
   * Requirement 8.1: Provide settings interface for API key input
   * Requirement 8.2: Store API key securely in localStorage
   * Requirement 8.7: Provide toggle to enable/disable AI generation
   */
  setAIConfig(config: AIConfig): Result<void, StorageError> {
    const settingsResult = this.storageManager.getSettings();
    const currentSettings = settingsResult.ok ? settingsResult.value : DEFAULT_SETTINGS;
    
    const updatedSettings: UserSettings = {
      ...currentSettings,
      aiConfig: config
    };
    
    return this.storageManager.saveSettings(updatedSettings);
  }

  /**
   * Reset settings to defaults while preserving saved ideas
   * Requirement 14.6: Provide reset settings option that clears all stored preferences except saved ideas
   */
  resetSettings(): Result<void, StorageError> {
    return this.storageManager.saveSettings(DEFAULT_SETTINGS);
  }

  /**
   * Export settings as JSON string for backup
   * Requirement 14.6: Settings backup/restore functionality
   */
  exportSettings(): string {
    const settingsResult = this.storageManager.getSettings();
    const settings = settingsResult.ok ? settingsResult.value : DEFAULT_SETTINGS;
    
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import settings from JSON string
   * Requirement 14.6: Settings backup/restore functionality
   */
  importSettings(json: string): Result<void, StorageError> {
    try {
      const parsed = JSON.parse(json);
      
      // Validate settings structure
      if (typeof parsed !== 'object' || parsed === null) {
        return {
          ok: false,
          error: {
            type: 'parse_error',
            message: 'Invalid settings format'
          }
        };
      }
      
      // Validate required fields
      if (!parsed.aiConfig || typeof parsed.aiConfig !== 'object') {
        return {
          ok: false,
          error: {
            type: 'parse_error',
            message: 'Missing or invalid aiConfig'
          }
        };
      }
      
      // Validate categories is an array
      if (!Array.isArray(parsed.categories)) {
        return {
          ok: false,
          error: {
            type: 'parse_error',
            message: 'Categories must be an array'
          }
        };
      }
      
      // Validate all categories are valid
      const validCategories = CATEGORIES as readonly string[];
      for (const category of parsed.categories) {
        if (!validCategories.includes(category)) {
          return {
            ok: false,
            error: {
              type: 'parse_error',
              message: `Invalid category: ${category}`
            }
          };
        }
      }
      
      // Validate AI config fields
      const validProviders = ['openai', 'gemini', 'groq'];
      if (!validProviders.includes(parsed.aiConfig.provider)) {
        return {
          ok: false,
          error: {
            type: 'parse_error',
            message: 'Invalid AI provider'
          }
        };
      }
      
      if (typeof parsed.aiConfig.apiKey !== 'string') {
        return {
          ok: false,
          error: {
            type: 'parse_error',
            message: 'API key must be a string'
          }
        };
      }
      
      if (typeof parsed.aiConfig.enabled !== 'boolean') {
        return {
          ok: false,
          error: {
            type: 'parse_error',
            message: 'AI enabled must be a boolean'
          }
        };
      }
      
      if (typeof parsed.aiConfig.timeout !== 'number') {
        return {
          ok: false,
          error: {
            type: 'parse_error',
            message: 'Timeout must be a number'
          }
        };
      }
      
      // Construct valid UserSettings object
      const settings: UserSettings = {
        categories: parsed.categories,
        aiConfig: {
          provider: parsed.aiConfig.provider,
          apiKey: parsed.aiConfig.apiKey,
          enabled: parsed.aiConfig.enabled,
          timeout: parsed.aiConfig.timeout
        },
        version: parsed.version || DEFAULT_SETTINGS.version
      };
      
      return this.storageManager.saveSettings(settings);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return {
          ok: false,
          error: {
            type: 'parse_error',
            message: 'Invalid JSON format'
          }
        };
      }
      
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
