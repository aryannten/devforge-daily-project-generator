/**
 * Unit tests for SettingsManager
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { SettingsManager } from './settings';
import { StorageManager } from './storage';
import { UserSettings, AIConfig } from '../types';
import { DEFAULT_SETTINGS, CATEGORIES } from './constants';

describe('SettingsManager', () => {
  let storageManager: StorageManager;
  let settingsManager: SettingsManager;

  beforeEach(() => {
    localStorage.clear();
    storageManager = new StorageManager();
    settingsManager = new SettingsManager(storageManager);
  });

  describe('getCategories', () => {
    test('returns empty array when no settings exist', () => {
      const categories = settingsManager.getCategories();
      expect(categories).toEqual([]);
    });

    test('returns saved categories', () => {
      const testCategories = ['Web Development', 'Mobile Development'];
      settingsManager.setCategories(testCategories);
      
      const categories = settingsManager.getCategories();
      expect(categories).toEqual(testCategories);
    });

    test('returns default categories on storage error', () => {
      // Corrupt the settings in storage
      localStorage.setItem('devforge_settings', 'invalid json');
      
      const categories = settingsManager.getCategories();
      expect(categories).toEqual(DEFAULT_SETTINGS.categories);
    });
  });

  describe('setCategories', () => {
    test('saves categories successfully', () => {
      const testCategories = ['CLI Tools', 'Games'];
      const result = settingsManager.setCategories(testCategories);
      
      expect(result.ok).toBe(true);
      expect(settingsManager.getCategories()).toEqual(testCategories);
    });

    test('saves empty array for all categories', () => {
      const result = settingsManager.setCategories([]);
      
      expect(result.ok).toBe(true);
      expect(settingsManager.getCategories()).toEqual([]);
    });

    test('preserves AI config when updating categories', () => {
      const aiConfig: AIConfig = {
        provider: 'openai',
        apiKey: 'test-key',
        enabled: true,
        timeout: 5000
      };
      
      settingsManager.setAIConfig(aiConfig);
      settingsManager.setCategories(['Web Development']);
      
      expect(settingsManager.getAIConfig()).toEqual(aiConfig);
    });

    test('supports all 8 required categories', () => {
      const allCategories = Array.from(CATEGORIES);
      const result = settingsManager.setCategories(allCategories);
      
      expect(result.ok).toBe(true);
      expect(settingsManager.getCategories()).toEqual(allCategories);
    });
  });

  describe('getAIConfig', () => {
    test('returns default AI config when no settings exist', () => {
      const config = settingsManager.getAIConfig();
      expect(config).toEqual(DEFAULT_SETTINGS.aiConfig);
    });

    test('returns saved AI config', () => {
      const testConfig: AIConfig = {
        provider: 'gemini',
        apiKey: 'test-api-key',
        enabled: true,
        timeout: 3000
      };
      
      settingsManager.setAIConfig(testConfig);
      
      const config = settingsManager.getAIConfig();
      expect(config).toEqual(testConfig);
    });

    test('returns default config on storage error', () => {
      localStorage.setItem('devforge_settings', 'invalid json');
      
      const config = settingsManager.getAIConfig();
      expect(config).toEqual(DEFAULT_SETTINGS.aiConfig);
    });
  });

  describe('setAIConfig', () => {
    test('saves AI config successfully', () => {
      const testConfig: AIConfig = {
        provider: 'groq',
        apiKey: 'groq-key',
        enabled: false,
        timeout: 5000
      };
      
      const result = settingsManager.setAIConfig(testConfig);
      
      expect(result.ok).toBe(true);
      expect(settingsManager.getAIConfig()).toEqual(testConfig);
    });

    test('preserves categories when updating AI config', () => {
      const testCategories = ['Data Visualization', 'APIs & Backend'];
      
      settingsManager.setCategories(testCategories);
      settingsManager.setAIConfig({
        provider: 'openai',
        apiKey: 'new-key',
        enabled: true,
        timeout: 5000
      });
      
      expect(settingsManager.getCategories()).toEqual(testCategories);
    });

    test('supports all three AI providers', () => {
      const providers: Array<'openai' | 'gemini' | 'groq'> = ['openai', 'gemini', 'groq'];
      
      for (const provider of providers) {
        const config: AIConfig = {
          provider,
          apiKey: `${provider}-key`,
          enabled: true,
          timeout: 5000
        };
        
        const result = settingsManager.setAIConfig(config);
        expect(result.ok).toBe(true);
        expect(settingsManager.getAIConfig().provider).toBe(provider);
      }
    });

    test('stores API key securely in localStorage', () => {
      const testConfig: AIConfig = {
        provider: 'openai',
        apiKey: 'secret-api-key-12345',
        enabled: true,
        timeout: 5000
      };
      
      settingsManager.setAIConfig(testConfig);
      
      const stored = localStorage.getItem('devforge_settings');
      expect(stored).toBeTruthy();
      expect(stored).toContain('secret-api-key-12345');
    });
  });

  describe('resetSettings', () => {
    test('resets settings to defaults', () => {
      // Set custom settings
      settingsManager.setCategories(['Web Development']);
      settingsManager.setAIConfig({
        provider: 'gemini',
        apiKey: 'test-key',
        enabled: true,
        timeout: 3000
      });
      
      // Reset
      const result = settingsManager.resetSettings();
      
      expect(result.ok).toBe(true);
      expect(settingsManager.getCategories()).toEqual(DEFAULT_SETTINGS.categories);
      expect(settingsManager.getAIConfig()).toEqual(DEFAULT_SETTINGS.aiConfig);
    });

    test('preserves saved ideas when resetting settings', () => {
      // Save an idea
      const testIdea = {
        id: 'test-id',
        title: 'Test Project',
        description: 'A test project description that is long enough to meet requirements',
        targetAudience: 'Test audience',
        coreFeatures: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5'],
        technicalRequirements: ['Tech 1', 'Tech 2'],
        difficultyLevel: 'Beginner' as const,
        estimatedTime: '1 week',
        learningOutcomes: ['Outcome 1', 'Outcome 2', 'Outcome 3'],
        potentialExtensions: ['Extension 1', 'Extension 2', 'Extension 3'],
        similarProjects: ['Project 1', 'Project 2', 'Project 3'],
        category: 'Web Development',
        generatedAt: Date.now(),
        generationType: 'algorithmic' as const
      };
      
      storageManager.saveIdea(testIdea);
      
      // Reset settings
      settingsManager.resetSettings();
      
      // Verify idea is still saved
      const savedIdeas = storageManager.getSavedIdeas();
      expect(savedIdeas.ok).toBe(true);
      if (savedIdeas.ok) {
        expect(savedIdeas.value).toHaveLength(1);
        expect(savedIdeas.value[0]?.id).toBe('test-id');
      }
    });
  });

  describe('exportSettings', () => {
    test('exports settings as JSON string', () => {
      const testCategories = ['Web Development', 'Mobile Development'];
      const testConfig: AIConfig = {
        provider: 'openai',
        apiKey: 'export-test-key',
        enabled: true,
        timeout: 5000
      };
      
      settingsManager.setCategories(testCategories);
      settingsManager.setAIConfig(testConfig);
      
      const exported = settingsManager.exportSettings();
      
      expect(typeof exported).toBe('string');
      const parsed = JSON.parse(exported);
      expect(parsed.categories).toEqual(testCategories);
      expect(parsed.aiConfig).toEqual(testConfig);
    });

    test('exports default settings when no custom settings exist', () => {
      const exported = settingsManager.exportSettings();
      
      const parsed = JSON.parse(exported);
      expect(parsed).toEqual(DEFAULT_SETTINGS);
    });

    test('exported JSON is formatted with indentation', () => {
      const exported = settingsManager.exportSettings();
      
      // Check for newlines and indentation
      expect(exported).toContain('\n');
      expect(exported).toContain('  ');
    });
  });

  describe('importSettings', () => {
    test('imports valid settings successfully', () => {
      const settingsToImport: UserSettings = {
        categories: ['CLI Tools', 'Games'],
        aiConfig: {
          provider: 'gemini',
          apiKey: 'imported-key',
          enabled: true,
          timeout: 4000
        },
        version: '1.0.0'
      };
      
      const json = JSON.stringify(settingsToImport);
      const result = settingsManager.importSettings(json);
      
      expect(result.ok).toBe(true);
      expect(settingsManager.getCategories()).toEqual(settingsToImport.categories);
      expect(settingsManager.getAIConfig()).toEqual(settingsToImport.aiConfig);
    });

    test('rejects invalid JSON', () => {
      const result = settingsManager.importSettings('invalid json {');
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('parse_error');
        expect(result.error.message).toContain('Invalid JSON');
      }
    });

    test('rejects non-object JSON', () => {
      const result = settingsManager.importSettings('"just a string"');
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('parse_error');
        expect(result.error.message).toContain('Invalid settings format');
      }
    });

    test('rejects settings with missing aiConfig', () => {
      const invalid = JSON.stringify({
        categories: [],
        version: '1.0.0'
      });
      
      const result = settingsManager.importSettings(invalid);
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('aiConfig');
      }
    });

    test('rejects settings with invalid categories array', () => {
      const invalid = JSON.stringify({
        categories: 'not an array',
        aiConfig: DEFAULT_SETTINGS.aiConfig,
        version: '1.0.0'
      });
      
      const result = settingsManager.importSettings(invalid);
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('array');
      }
    });

    test('rejects settings with invalid category names', () => {
      const invalid = JSON.stringify({
        categories: ['Invalid Category Name'],
        aiConfig: DEFAULT_SETTINGS.aiConfig,
        version: '1.0.0'
      });
      
      const result = settingsManager.importSettings(invalid);
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Invalid category');
      }
    });

    test('rejects settings with invalid AI provider', () => {
      const invalid = JSON.stringify({
        categories: [],
        aiConfig: {
          provider: 'invalid-provider',
          apiKey: 'key',
          enabled: true,
          timeout: 5000
        },
        version: '1.0.0'
      });
      
      const result = settingsManager.importSettings(invalid);
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Invalid AI provider');
      }
    });

    test('rejects settings with non-string API key', () => {
      const invalid = JSON.stringify({
        categories: [],
        aiConfig: {
          provider: 'openai',
          apiKey: 12345,
          enabled: true,
          timeout: 5000
        },
        version: '1.0.0'
      });
      
      const result = settingsManager.importSettings(invalid);
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('API key must be a string');
      }
    });

    test('rejects settings with non-boolean enabled flag', () => {
      const invalid = JSON.stringify({
        categories: [],
        aiConfig: {
          provider: 'openai',
          apiKey: 'key',
          enabled: 'true',
          timeout: 5000
        },
        version: '1.0.0'
      });
      
      const result = settingsManager.importSettings(invalid);
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('boolean');
      }
    });

    test('rejects settings with non-number timeout', () => {
      const invalid = JSON.stringify({
        categories: [],
        aiConfig: {
          provider: 'openai',
          apiKey: 'key',
          enabled: true,
          timeout: '5000'
        },
        version: '1.0.0'
      });
      
      const result = settingsManager.importSettings(invalid);
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('Timeout must be a number');
      }
    });

    test('uses default version if not provided', () => {
      const settingsWithoutVersion = {
        categories: [],
        aiConfig: DEFAULT_SETTINGS.aiConfig
      };
      
      const result = settingsManager.importSettings(JSON.stringify(settingsWithoutVersion));
      
      expect(result.ok).toBe(true);
      
      const exported = settingsManager.exportSettings();
      const parsed = JSON.parse(exported);
      expect(parsed.version).toBe(DEFAULT_SETTINGS.version);
    });
  });

  describe('export and import round-trip', () => {
    test('preserves all settings through export/import cycle', () => {
      const originalCategories = ['Web Development', 'Mobile Development', 'CLI Tools'];
      const originalConfig: AIConfig = {
        provider: 'groq',
        apiKey: 'round-trip-key',
        enabled: true,
        timeout: 4500
      };
      
      settingsManager.setCategories(originalCategories);
      settingsManager.setAIConfig(originalConfig);
      
      const exported = settingsManager.exportSettings();
      
      // Clear and import
      settingsManager.resetSettings();
      const importResult = settingsManager.importSettings(exported);
      
      expect(importResult.ok).toBe(true);
      expect(settingsManager.getCategories()).toEqual(originalCategories);
      expect(settingsManager.getAIConfig()).toEqual(originalConfig);
    });
  });
});
