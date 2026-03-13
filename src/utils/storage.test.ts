/**
 * Tests for StorageManager
 * Includes both unit tests and property-based tests
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { StorageManager } from './storage';
import { ProjectBriefing, UserSettings } from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS, CATEGORIES } from './constants';

describe('StorageManager', () => {
  let storageManager: StorageManager;

  beforeEach(() => {
    storageManager = new StorageManager();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ===== Unit Tests =====

  describe('saveIdea', () => {
    test('saves a new idea to localStorage', () => {
      const idea: ProjectBriefing = createMockIdea('test-id-1');
      
      const result = storageManager.saveIdea(idea);
      
      expect(result.ok).toBe(true);
      
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_IDEAS);
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe('test-id-1');
    });

    test('updates existing idea with same ID', () => {
      const idea1: ProjectBriefing = createMockIdea('test-id-1');
      const idea2: ProjectBriefing = { ...createMockIdea('test-id-1'), title: 'Updated Title' };
      
      storageManager.saveIdea(idea1);
      const result = storageManager.saveIdea(idea2);
      
      expect(result.ok).toBe(true);
      
      const savedResult = storageManager.getSavedIdeas();
      expect(savedResult.ok).toBe(true);
      if (savedResult.ok) {
        expect(savedResult.value).toHaveLength(1);
        const firstIdea = savedResult.value[0];
        if (firstIdea) {
          expect(firstIdea.title).toBe('Updated Title');
        }
      }
    });

    test('handles quota exceeded error', () => {
      // Mock localStorage to throw quota exceeded error
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        const error: any = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      };

      const idea: ProjectBriefing = createMockIdea('test-id-1');
      const result = storageManager.saveIdea(idea);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('quota_exceeded');
        expect(result.error.message).toContain('Storage capacity reached');
      }

      // Restore original
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('getSavedIdeas', () => {
    test('returns empty array when no ideas saved', () => {
      const result = storageManager.getSavedIdeas();
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    test('retrieves all saved ideas', () => {
      const idea1 = createMockIdea('id-1');
      const idea2 = createMockIdea('id-2');
      
      storageManager.saveIdea(idea1);
      storageManager.saveIdea(idea2);
      
      const result = storageManager.getSavedIdeas();
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value.map((i: ProjectBriefing) => i.id)).toContain('id-1');
        expect(result.value.map((i: ProjectBriefing) => i.id)).toContain('id-2');
      }
    });

    test('handles corrupted data', () => {
      localStorage.setItem(STORAGE_KEYS.SAVED_IDEAS, 'invalid json');
      
      const result = storageManager.getSavedIdeas();
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('parse_error');
      }
    });

    test('handles non-array data', () => {
      localStorage.setItem(STORAGE_KEYS.SAVED_IDEAS, JSON.stringify({ not: 'array' }));
      
      const result = storageManager.getSavedIdeas();
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('parse_error');
        expect(result.error.message).toContain('corrupted');
      }
    });
  });

  describe('deleteIdea', () => {
    test('deletes idea by ID', () => {
      const idea1 = createMockIdea('id-1');
      const idea2 = createMockIdea('id-2');
      
      storageManager.saveIdea(idea1);
      storageManager.saveIdea(idea2);
      
      const result = storageManager.deleteIdea('id-1');
      
      expect(result.ok).toBe(true);
      
      const savedResult = storageManager.getSavedIdeas();
      expect(savedResult.ok).toBe(true);
      if (savedResult.ok) {
        expect(savedResult.value).toHaveLength(1);
        const firstIdea = savedResult.value[0];
        if (firstIdea) {
          expect(firstIdea.id).toBe('id-2');
        }
      }
    });

    test('returns not_found error for non-existent ID', () => {
      const result = storageManager.deleteIdea('non-existent');
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('not_found');
        expect(result.error.message).toContain('not found');
      }
    });

    test('handles corrupted storage during delete', () => {
      localStorage.setItem(STORAGE_KEYS.SAVED_IDEAS, 'invalid json');
      
      const result = storageManager.deleteIdea('any-id');
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('parse_error');
      }
    });
  });

  describe('saveSettings', () => {
    test('saves settings to localStorage', () => {
      const settings: UserSettings = {
        categories: ['Web Development'],
        aiConfig: {
          provider: 'openai',
          apiKey: 'test-key',
          enabled: true,
          timeout: 5000
        },
        version: '1.0.0'
      };
      
      const result = storageManager.saveSettings(settings);
      
      expect(result.ok).toBe(true);
      
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed.categories).toEqual(['Web Development']);
      expect(parsed.aiConfig.apiKey).toBe('test-key');
    });

    test('handles quota exceeded error', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = () => {
        const error: any = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      };

      const result = storageManager.saveSettings(DEFAULT_SETTINGS);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('quota_exceeded');
      }

      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('getSettings', () => {
    test('returns default settings when none saved', () => {
      const result = storageManager.getSettings();
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(DEFAULT_SETTINGS);
      }
    });

    test('retrieves saved settings', () => {
      const settings: UserSettings = {
        categories: ['Games', 'CLI Tools'],
        aiConfig: {
          provider: 'gemini',
          apiKey: 'my-key',
          enabled: false,
          timeout: 5000
        },
        version: '1.0.0'
      };
      
      storageManager.saveSettings(settings);
      const result = storageManager.getSettings();
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(settings);
      }
    });

    test('handles corrupted settings data', () => {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, 'invalid json');
      
      const result = storageManager.getSettings();
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('parse_error');
      }
    });

    test('handles non-object settings data', () => {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify('not an object'));
      
      const result = storageManager.getSettings();
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('parse_error');
        expect(result.error.message).toContain('corrupted');
      }
    });
  });

  describe('clearSettings', () => {
    test('removes settings from localStorage', () => {
      const settings: UserSettings = {
        categories: ['Web Development'],
        aiConfig: {
          provider: 'openai',
          apiKey: 'test-key',
          enabled: true,
          timeout: 5000
        },
        version: '1.0.0'
      };
      
      storageManager.saveSettings(settings);
      expect(localStorage.getItem(STORAGE_KEYS.SETTINGS)).toBeTruthy();
      
      const result = storageManager.clearSettings();
      
      expect(result.ok).toBe(true);
      expect(localStorage.getItem(STORAGE_KEYS.SETTINGS)).toBeNull();
    });

    test('preserves saved ideas when clearing settings', () => {
      const idea = createMockIdea('test-id');
      storageManager.saveIdea(idea);
      
      const settings: UserSettings = {
        categories: ['Web Development'],
        aiConfig: {
          provider: 'openai',
          apiKey: 'test-key',
          enabled: true,
          timeout: 5000
        },
        version: '1.0.0'
      };
      storageManager.saveSettings(settings);
      
      storageManager.clearSettings();
      
      const ideasResult = storageManager.getSavedIdeas();
      expect(ideasResult.ok).toBe(true);
      if (ideasResult.ok) {
        expect(ideasResult.value).toHaveLength(1);
        const firstIdea = ideasResult.value[0];
        if (firstIdea) {
          expect(firstIdea.id).toBe('test-id');
        }
      }
    });
  });

  describe('getStorageUsage', () => {
    test('returns usage information', () => {
      const usage = storageManager.getStorageUsage();
      
      expect(usage).toHaveProperty('used');
      expect(usage).toHaveProperty('available');
      expect(typeof usage.used).toBe('number');
      expect(typeof usage.available).toBe('number');
      expect(usage.used).toBeGreaterThanOrEqual(0);
      expect(usage.available).toBeGreaterThanOrEqual(0);
    });

    test('reflects increased usage after saving data', () => {
      const usageBefore = storageManager.getStorageUsage();
      
      const idea = createMockIdea('test-id');
      storageManager.saveIdea(idea);
      
      const usageAfter = storageManager.getStorageUsage();
      
      expect(usageAfter.used).toBeGreaterThan(usageBefore.used);
      expect(usageAfter.available).toBeLessThan(usageBefore.available);
    });
  });

  // ===== Property-Based Tests =====

  // Feature: devforge-daily-project-generator, Property 6: Save and retrieve round-trip preserves ideas
  test('save and retrieve preserves all idea fields', () => {
    fc.assert(
      fc.property(
        projectBriefingArbitrary(),
        (idea: ProjectBriefing) => {
          const saveResult = storageManager.saveIdea(idea);
          expect(saveResult.ok).toBe(true);
          
          const retrieveResult = storageManager.getSavedIdeas();
          expect(retrieveResult.ok).toBe(true);
          
          if (retrieveResult.ok) {
            const savedIdea = retrieveResult.value.find((i: ProjectBriefing) => i.id === idea.id);
            expect(savedIdea).toEqual(idea);
          }
          
          // Cleanup
          storageManager.deleteIdea(idea.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: devforge-daily-project-generator, Property 10: Settings persistence round-trip
  test('save and retrieve settings preserves all fields', () => {
    fc.assert(
      fc.property(
        userSettingsArbitrary(),
        (settings: UserSettings) => {
          const saveResult = storageManager.saveSettings(settings);
          expect(saveResult.ok).toBe(true);
          
          const retrieveResult = storageManager.getSettings();
          expect(retrieveResult.ok).toBe(true);
          if (retrieveResult.ok) {
            expect(retrieveResult.value).toEqual(settings);
          }
          
          // Cleanup
          storageManager.clearSettings();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: devforge-daily-project-generator, Property 13: Deletion removes ideas from storage
  test('deletion removes ideas from storage', () => {
    fc.assert(
      fc.property(
        fc.array(projectBriefingArbitrary(), { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 0, max: 9 }),
        (ideas: ProjectBriefing[], indexToDelete: number) => {
          // Save all ideas
          ideas.forEach((idea: ProjectBriefing) => {
            storageManager.saveIdea(idea);
          });
          
          // Delete one idea
          const actualIndex = indexToDelete % ideas.length;
          const ideaToDelete = ideas[actualIndex];
          if (!ideaToDelete) return; // Skip if undefined
          
          const idToDelete = ideaToDelete.id;
          const deleteResult = storageManager.deleteIdea(idToDelete);
          expect(deleteResult.ok).toBe(true);
          
          // Verify it's gone
          const retrieveResult = storageManager.getSavedIdeas();
          expect(retrieveResult.ok).toBe(true);
          
          if (retrieveResult.ok) {
            const foundIdea = retrieveResult.value.find((i: ProjectBriefing) => i.id === idToDelete);
            expect(foundIdea).toBeUndefined();
            
            // Verify others remain
            expect(retrieveResult.value.length).toBe(ideas.length - 1);
            
            // Cleanup
            retrieveResult.value.forEach((idea: ProjectBriefing) => {
              storageManager.deleteIdea(idea.id);
            });
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('multiple save operations maintain data integrity', () => {
    fc.assert(
      fc.property(
        fc.array(projectBriefingArbitrary(), { minLength: 1, maxLength: 20 }),
        (ideas: ProjectBriefing[]) => {
          // Save all ideas
          ideas.forEach((idea: ProjectBriefing) => {
            const result = storageManager.saveIdea(idea);
            expect(result.ok).toBe(true);
          });
          
          // Retrieve and verify all are present
          const retrieveResult = storageManager.getSavedIdeas();
          expect(retrieveResult.ok).toBe(true);
          
          if (retrieveResult.ok) {
            expect(retrieveResult.value.length).toBe(ideas.length);
            
            // Verify each idea is present
            ideas.forEach((idea: ProjectBriefing) => {
              const found = retrieveResult.value.find((i: ProjectBriefing) => i.id === idea.id);
              expect(found).toEqual(idea);
            });
            
            // Cleanup
            ideas.forEach((idea: ProjectBriefing) => {
              storageManager.deleteIdea(idea.id);
            });
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ===== Test Data Generators =====

function createMockIdea(id: string): ProjectBriefing {
  return {
    id,
    title: 'Test Project',
    description: 'A test project description that is long enough to meet the minimum requirements',
    targetAudience: 'Developers learning new skills',
    coreFeatures: [
      'Feature 1',
      'Feature 2',
      'Feature 3',
      'Feature 4',
      'Feature 5'
    ],
    technicalRequirements: ['TypeScript', 'React'],
    difficultyLevel: 'Intermediate',
    estimatedTime: '2-3 weeks',
    learningOutcomes: [
      'Learn TypeScript',
      'Learn React',
      'Learn Testing'
    ],
    potentialExtensions: [
      'Add authentication',
      'Add database',
      'Add API'
    ],
    similarProjects: [
      'Project A',
      'Project B',
      'Project C'
    ],
    category: 'Web Development',
    generatedAt: Date.now(),
    generationType: 'algorithmic'
  };
}

function projectBriefingArbitrary(): fc.Arbitrary<ProjectBriefing> {
  return fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 5, maxLength: 80 }),
    description: fc.string({ minLength: 50, maxLength: 500 }),
    targetAudience: fc.string({ minLength: 10, maxLength: 200 }),
    coreFeatures: fc.array(
      fc.string({ minLength: 10, maxLength: 100 }),
      { minLength: 5, maxLength: 7 }
    ),
    technicalRequirements: fc.array(
      fc.string({ minLength: 2, maxLength: 50 }),
      { minLength: 2, maxLength: 10 }
    ),
    difficultyLevel: fc.constantFrom('Beginner' as const, 'Intermediate' as const, 'Advanced' as const),
    estimatedTime: fc.constantFrom('1 weekend', '1-2 weeks', '2-3 weeks', '1 month'),
    learningOutcomes: fc.array(
      fc.string({ minLength: 5, maxLength: 100 }),
      { minLength: 3, maxLength: 5 }
    ),
    potentialExtensions: fc.array(
      fc.string({ minLength: 5, maxLength: 100 }),
      { minLength: 3, maxLength: 5 }
    ),
    similarProjects: fc.array(
      fc.string({ minLength: 5, maxLength: 100 }),
      { minLength: 3, maxLength: 5 }
    ),
    category: fc.constantFrom(...CATEGORIES),
    generatedAt: fc.integer({ min: 0 }),
    generationType: fc.constantFrom('algorithmic' as const, 'ai' as const)
  });
}

function userSettingsArbitrary(): fc.Arbitrary<UserSettings> {
  return fc.record({
    categories: fc.array(fc.constantFrom(...CATEGORIES)),
    aiConfig: fc.record({
      provider: fc.constantFrom('openai' as const, 'gemini' as const, 'groq' as const),
      apiKey: fc.string(),
      enabled: fc.boolean(),
      timeout: fc.constant(5000)
    }),
    version: fc.constant('1.0.0')
  });
}
