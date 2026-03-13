/**
 * Tests for IdeaManager
 * Validates Requirements 3.1, 4.1, 4.2, 5.1, 6.1, 6.2, 13.1, 13.2
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { IdeaManager } from './ideaManager';
import { AIConfig } from '../types';

describe('IdeaManager', () => {
  let ideaManager: IdeaManager;
  let mockAIConfig: AIConfig;

  beforeEach(() => {
    ideaManager = new IdeaManager();
    mockAIConfig = {
      provider: 'openai',
      apiKey: '',
      enabled: false,
      timeout: 5000
    };

    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getCurrentIdea', () => {
    test('returns null when no idea has been generated', () => {
      const currentIdea = ideaManager.getCurrentIdea();
      expect(currentIdea).toBeNull();
    });

    test('returns the current idea after generation', async () => {
      await ideaManager.generateNewIdea(mockAIConfig, []);
      const currentIdea = ideaManager.getCurrentIdea();
      
      expect(currentIdea).not.toBeNull();
      expect(currentIdea).toHaveProperty('id');
      expect(currentIdea).toHaveProperty('title');
    });
  });

  describe('getDailyFeaturedIdea', () => {
    test('generates a valid project briefing', () => {
      const dailyIdea = ideaManager.getDailyFeaturedIdea();
      
      expect(dailyIdea).toHaveProperty('id');
      expect(dailyIdea).toHaveProperty('title');
      expect(dailyIdea).toHaveProperty('description');
      expect(dailyIdea).toHaveProperty('targetAudience');
      expect(dailyIdea).toHaveProperty('coreFeatures');
      expect(dailyIdea).toHaveProperty('technicalRequirements');
      expect(dailyIdea).toHaveProperty('difficultyLevel');
      expect(dailyIdea).toHaveProperty('estimatedTime');
      expect(dailyIdea).toHaveProperty('learningOutcomes');
      expect(dailyIdea).toHaveProperty('potentialExtensions');
      expect(dailyIdea).toHaveProperty('similarProjects');
      expect(dailyIdea).toHaveProperty('category');
      expect(dailyIdea).toHaveProperty('generatedAt');
      expect(dailyIdea).toHaveProperty('generationType');
    });

    test('returns the same idea when called multiple times on the same day', () => {
      const idea1 = ideaManager.getDailyFeaturedIdea();
      const idea2 = ideaManager.getDailyFeaturedIdea();
      
      expect(idea1.id).toBe(idea2.id);
      expect(idea1.title).toBe(idea2.title);
      expect(idea1.description).toBe(idea2.description);
      expect(idea1.category).toBe(idea2.category);
    });

    test('uses algorithmic generation type', () => {
      const dailyIdea = ideaManager.getDailyFeaturedIdea();
      expect(dailyIdea.generationType).toBe('algorithmic');
    });

    test('generates complete structure with all required fields', () => {
      const dailyIdea = ideaManager.getDailyFeaturedIdea();
      
      expect(dailyIdea.title).toBeTruthy();
      expect(dailyIdea.description).toBeTruthy();
      expect(dailyIdea.targetAudience).toBeTruthy();
      expect(dailyIdea.coreFeatures.length).toBeGreaterThanOrEqual(5);
      expect(dailyIdea.coreFeatures.length).toBeLessThanOrEqual(7);
      expect(dailyIdea.technicalRequirements.length).toBeGreaterThan(0);
      expect(['Beginner', 'Intermediate', 'Advanced']).toContain(dailyIdea.difficultyLevel);
      expect(dailyIdea.estimatedTime).toBeTruthy();
      expect(dailyIdea.learningOutcomes.length).toBeGreaterThanOrEqual(3);
      expect(dailyIdea.learningOutcomes.length).toBeLessThanOrEqual(5);
      expect(dailyIdea.potentialExtensions.length).toBeGreaterThanOrEqual(3);
      expect(dailyIdea.potentialExtensions.length).toBeLessThanOrEqual(5);
      expect(dailyIdea.similarProjects.length).toBeGreaterThanOrEqual(3);
      expect(dailyIdea.similarProjects.length).toBeLessThanOrEqual(5);
    });
  });

  describe('generateNewIdea', () => {
    test('generates a valid project briefing', async () => {
      const result = await ideaManager.generateNewIdea(mockAIConfig, []);
      
      expect(result.idea).toHaveProperty('id');
      expect(result.idea).toHaveProperty('title');
      expect(result.idea).toHaveProperty('description');
      expect(result.idea).toHaveProperty('targetAudience');
      expect(result.idea).toHaveProperty('coreFeatures');
      expect(result.idea).toHaveProperty('technicalRequirements');
      expect(result.idea).toHaveProperty('difficultyLevel');
      expect(result.idea).toHaveProperty('estimatedTime');
      expect(result.idea).toHaveProperty('learningOutcomes');
      expect(result.idea).toHaveProperty('potentialExtensions');
      expect(result.idea).toHaveProperty('similarProjects');
      expect(result.idea).toHaveProperty('category');
      expect(result.idea).toHaveProperty('generatedAt');
      expect(result.idea).toHaveProperty('generationType');
    });

    test('updates current idea after generation', async () => {
      await ideaManager.generateNewIdea(mockAIConfig, []);
      const currentIdea = ideaManager.getCurrentIdea();
      
      expect(currentIdea).not.toBeNull();
    });

    test('generates unique ideas in sequence', async () => {
      const result1 = await ideaManager.generateNewIdea(mockAIConfig, []);
      const result2 = await ideaManager.generateNewIdea(mockAIConfig, []);
      const result3 = await ideaManager.generateNewIdea(mockAIConfig, []);
      
      expect(result1.idea.id).not.toBe(result2.idea.id);
      expect(result2.idea.id).not.toBe(result3.idea.id);
      expect(result1.idea.id).not.toBe(result3.idea.id);
    });

    test('respects category filtering when provided', async () => {
      const categories = ['Web Development'];
      const result = await ideaManager.generateNewIdea(mockAIConfig, categories);
      
      expect(result.idea.category).toBe('Web Development');
    });

    test('generates from all categories when empty array provided', async () => {
      const result = await ideaManager.generateNewIdea(mockAIConfig, []);
      
      expect(result.idea.category).toBeTruthy();
    });

    test('updates session history after generation', async () => {
      const initialSize = ideaManager.getSessionHistorySize();
      await ideaManager.generateNewIdea(mockAIConfig, []);
      const newSize = ideaManager.getSessionHistorySize();
      
      expect(newSize).toBe(initialSize + 1);
    });

    test('limits session history to 50 entries', async () => {
      // Generate 55 ideas
      for (let i = 0; i < 55; i++) {
        await ideaManager.generateNewIdea(mockAIConfig, []);
      }
      
      const historySize = ideaManager.getSessionHistorySize();
      expect(historySize).toBe(50);
    });

    test('returns fallback information', async () => {
      const result = await ideaManager.generateNewIdea(mockAIConfig, []);
      
      expect(result).toHaveProperty('usedFallback');
      expect(result).toHaveProperty('generationTime');
      expect(typeof result.usedFallback).toBe('boolean');
      expect(typeof result.generationTime).toBe('number');
    });

    test('uses algorithmic generation when AI is disabled', async () => {
      const result = await ideaManager.generateNewIdea(mockAIConfig, []);
      
      expect(result.usedFallback).toBe(false);
      expect(result.idea.generationType).toBe('algorithmic');
    });
  });

  describe('saveCurrentIdea', () => {
    test('returns error when no current idea exists', () => {
      const result = ideaManager.saveCurrentIdea();
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('not_found');
        expect(result.error.message).toContain('No current idea');
      }
    });

    test('saves current idea to storage', async () => {
      await ideaManager.generateNewIdea(mockAIConfig, []);
      const result = ideaManager.saveCurrentIdea();
      
      expect(result.ok).toBe(true);
    });

    test('saved idea can be retrieved', async () => {
      await ideaManager.generateNewIdea(mockAIConfig, []);
      const currentIdea = ideaManager.getCurrentIdea();
      
      ideaManager.saveCurrentIdea();
      const savedIdeas = ideaManager.getSavedIdeas();
      
      expect(savedIdeas.ok).toBe(true);
      if (savedIdeas.ok) {
        expect(savedIdeas.value.length).toBe(1);
        expect(savedIdeas.value[0]!.id).toBe(currentIdea!.id);
      }
    });

    test('saves complete project briefing structure', async () => {
      await ideaManager.generateNewIdea(mockAIConfig, []);
      ideaManager.saveCurrentIdea();
      
      const savedIdeas = ideaManager.getSavedIdeas();
      
      expect(savedIdeas.ok).toBe(true);
      if (savedIdeas.ok) {
        const savedIdea = savedIdeas.value[0]!;
        expect(savedIdea).toHaveProperty('id');
        expect(savedIdea).toHaveProperty('title');
        expect(savedIdea).toHaveProperty('description');
        expect(savedIdea).toHaveProperty('targetAudience');
        expect(savedIdea).toHaveProperty('coreFeatures');
        expect(savedIdea).toHaveProperty('technicalRequirements');
        expect(savedIdea).toHaveProperty('difficultyLevel');
        expect(savedIdea).toHaveProperty('estimatedTime');
        expect(savedIdea).toHaveProperty('learningOutcomes');
        expect(savedIdea).toHaveProperty('potentialExtensions');
        expect(savedIdea).toHaveProperty('similarProjects');
      }
    });
  });

  describe('discardAndRegenerate', () => {
    test('generates a new idea after discarding', async () => {
      await ideaManager.generateNewIdea(mockAIConfig, []);
      const firstIdea = ideaManager.getCurrentIdea();
      
      await ideaManager.discardAndRegenerate(mockAIConfig, []);
      const newIdea = ideaManager.getCurrentIdea();
      
      expect(newIdea).not.toBeNull();
      expect(newIdea!.id).not.toBe(firstIdea!.id);
    });

    test('tracks discarded pattern in session history', async () => {
      await ideaManager.generateNewIdea(mockAIConfig, []);
      const initialSize = ideaManager.getSessionHistorySize();
      
      await ideaManager.discardAndRegenerate(mockAIConfig, []);
      const newSize = ideaManager.getSessionHistorySize();
      
      // Should add discarded pattern + new idea = +2
      expect(newSize).toBe(initialSize + 2);
    });

    test('returns valid fallback result', async () => {
      await ideaManager.generateNewIdea(mockAIConfig, []);
      const result = await ideaManager.discardAndRegenerate(mockAIConfig, []);
      
      expect(result).toHaveProperty('idea');
      expect(result).toHaveProperty('usedFallback');
      expect(result).toHaveProperty('generationTime');
    });

    test('handles discard when no current idea exists', async () => {
      const result = await ideaManager.discardAndRegenerate(mockAIConfig, []);
      
      expect(result.idea).toBeTruthy();
      expect(ideaManager.getCurrentIdea()).not.toBeNull();
    });
  });

  describe('getSavedIdeas', () => {
    test('returns empty array when no ideas are saved', () => {
      const result = ideaManager.getSavedIdeas();
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual([]);
      }
    });

    test('returns all saved ideas', async () => {
      // Generate and save 3 ideas
      await ideaManager.generateNewIdea(mockAIConfig, []);
      ideaManager.saveCurrentIdea();
      
      await ideaManager.generateNewIdea(mockAIConfig, []);
      ideaManager.saveCurrentIdea();
      
      await ideaManager.generateNewIdea(mockAIConfig, []);
      ideaManager.saveCurrentIdea();
      
      const result = ideaManager.getSavedIdeas();
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(3);
      }
    });

    test('returns ideas with complete structure', async () => {
      await ideaManager.generateNewIdea(mockAIConfig, []);
      ideaManager.saveCurrentIdea();
      
      const result = ideaManager.getSavedIdeas();
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        const idea = result.value[0]!;
        expect(idea.id).toBeTruthy();
        expect(idea.title).toBeTruthy();
        expect(idea.description).toBeTruthy();
        expect(idea.coreFeatures.length).toBeGreaterThan(0);
      }
    });
  });

  describe('deleteSavedIdea', () => {
    test('deletes idea by ID', async () => {
      await ideaManager.generateNewIdea(mockAIConfig, []);
      const currentIdea = ideaManager.getCurrentIdea();
      ideaManager.saveCurrentIdea();
      
      const deleteResult = ideaManager.deleteSavedIdea(currentIdea!.id);
      
      expect(deleteResult.ok).toBe(true);
      
      const savedIdeas = ideaManager.getSavedIdeas();
      expect(savedIdeas.ok).toBe(true);
      if (savedIdeas.ok) {
        expect(savedIdeas.value.length).toBe(0);
      }
    });

    test('returns error when idea not found', () => {
      const result = ideaManager.deleteSavedIdea('non-existent-id');
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('not_found');
      }
    });

    test('deletes only the specified idea', async () => {
      // Save 3 ideas
      await ideaManager.generateNewIdea(mockAIConfig, []);
      const idea1 = ideaManager.getCurrentIdea();
      ideaManager.saveCurrentIdea();
      
      await ideaManager.generateNewIdea(mockAIConfig, []);
      const idea2 = ideaManager.getCurrentIdea();
      ideaManager.saveCurrentIdea();
      
      await ideaManager.generateNewIdea(mockAIConfig, []);
      ideaManager.saveCurrentIdea();
      
      // Delete the second idea
      ideaManager.deleteSavedIdea(idea2!.id);
      
      const savedIdeas = ideaManager.getSavedIdeas();
      expect(savedIdeas.ok).toBe(true);
      if (savedIdeas.ok) {
        expect(savedIdeas.value.length).toBe(2);
        expect(savedIdeas.value.find(i => i.id === idea2!.id)).toBeUndefined();
        expect(savedIdeas.value.find(i => i.id === idea1!.id)).toBeDefined();
      }
    });
  });

  describe('clearSessionHistory', () => {
    test('clears all session history', async () => {
      await ideaManager.generateNewIdea(mockAIConfig, []);
      await ideaManager.generateNewIdea(mockAIConfig, []);
      await ideaManager.generateNewIdea(mockAIConfig, []);
      
      expect(ideaManager.getSessionHistorySize()).toBeGreaterThan(0);
      
      ideaManager.clearSessionHistory();
      
      expect(ideaManager.getSessionHistorySize()).toBe(0);
    });
  });

  describe('getSessionHistorySize', () => {
    test('returns 0 initially', () => {
      expect(ideaManager.getSessionHistorySize()).toBe(0);
    });

    test('increments with each generation', async () => {
      expect(ideaManager.getSessionHistorySize()).toBe(0);
      
      await ideaManager.generateNewIdea(mockAIConfig, []);
      expect(ideaManager.getSessionHistorySize()).toBe(1);
      
      await ideaManager.generateNewIdea(mockAIConfig, []);
      expect(ideaManager.getSessionHistorySize()).toBe(2);
    });
  });

  describe('Integration tests', () => {
    test('complete workflow: generate, save, retrieve, delete', async () => {
      // Generate idea
      await ideaManager.generateNewIdea(mockAIConfig, []);
      const generatedIdea = ideaManager.getCurrentIdea();
      expect(generatedIdea).not.toBeNull();
      
      // Save idea
      const saveResult = ideaManager.saveCurrentIdea();
      expect(saveResult.ok).toBe(true);
      
      // Retrieve saved ideas
      const retrieveResult = ideaManager.getSavedIdeas();
      expect(retrieveResult.ok).toBe(true);
      if (retrieveResult.ok) {
        expect(retrieveResult.value.length).toBe(1);
        expect(retrieveResult.value[0]!.id).toBe(generatedIdea!.id);
      }
      
      // Delete idea
      const deleteResult = ideaManager.deleteSavedIdea(generatedIdea!.id);
      expect(deleteResult.ok).toBe(true);
      
      // Verify deletion
      const finalResult = ideaManager.getSavedIdeas();
      expect(finalResult.ok).toBe(true);
      if (finalResult.ok) {
        expect(finalResult.value.length).toBe(0);
      }
    });

    test('discard workflow maintains session history', async () => {
      await ideaManager.generateNewIdea(mockAIConfig, []);
      const firstIdea = ideaManager.getCurrentIdea();
      
      await ideaManager.discardAndRegenerate(mockAIConfig, []);
      const secondIdea = ideaManager.getCurrentIdea();
      
      expect(firstIdea!.id).not.toBe(secondIdea!.id);
      expect(ideaManager.getSessionHistorySize()).toBeGreaterThan(1);
    });

    test('daily featured idea is independent of session state', async () => {
      // Generate some regular ideas
      await ideaManager.generateNewIdea(mockAIConfig, ['Web Development']);
      await ideaManager.generateNewIdea(mockAIConfig, ['Mobile Development']);
      
      // Daily featured idea should be consistent
      const daily1 = ideaManager.getDailyFeaturedIdea();
      const daily2 = ideaManager.getDailyFeaturedIdea();
      
      expect(daily1.id).toBe(daily2.id);
      expect(daily1.title).toBe(daily2.title);
    });
  });
});
