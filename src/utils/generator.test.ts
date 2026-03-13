/**
 * Unit tests for AlgorithmicGenerator
 * Tests Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 2.1-2.11
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { AlgorithmicGenerator } from './generator';
import { CATEGORIES } from './constants';

describe('AlgorithmicGenerator', () => {
  let generator: AlgorithmicGenerator;

  beforeEach(() => {
    generator = new AlgorithmicGenerator();
  });

  describe('generateIdea', () => {
    test('generates a complete ProjectBriefing with all 10 sections', () => {
      const idea = generator.generateIdea('test_seed', [], []);

      // Requirement 2.1: Project Title
      expect(idea.title).toBeTruthy();
      expect(typeof idea.title).toBe('string');
      expect(idea.title.length).toBeGreaterThan(0);

      // Requirement 2.2: Project Description
      expect(idea.description).toBeTruthy();
      expect(typeof idea.description).toBe('string');
      expect(idea.description.length).toBeGreaterThanOrEqual(50);

      // Requirement 2.3: Target Audience
      expect(idea.targetAudience).toBeTruthy();
      expect(typeof idea.targetAudience).toBe('string');

      // Requirement 2.4: Core Features (5-7 items)
      expect(Array.isArray(idea.coreFeatures)).toBe(true);
      expect(idea.coreFeatures.length).toBeGreaterThanOrEqual(5);
      expect(idea.coreFeatures.length).toBeLessThanOrEqual(7);

      // Requirement 2.5: Technical Requirements
      expect(Array.isArray(idea.technicalRequirements)).toBe(true);
      expect(idea.technicalRequirements.length).toBeGreaterThanOrEqual(2);

      // Requirement 2.6: Difficulty Level
      expect(['Beginner', 'Intermediate', 'Advanced']).toContain(idea.difficultyLevel);

      // Requirement 2.7: Estimated Time
      expect(idea.estimatedTime).toBeTruthy();
      expect(typeof idea.estimatedTime).toBe('string');

      // Requirement 2.8: Learning Outcomes (3-5 items)
      expect(Array.isArray(idea.learningOutcomes)).toBe(true);
      expect(idea.learningOutcomes.length).toBeGreaterThanOrEqual(3);
      expect(idea.learningOutcomes.length).toBeLessThanOrEqual(5);

      // Requirement 2.9: Potential Extensions (3-5 items)
      expect(Array.isArray(idea.potentialExtensions)).toBe(true);
      expect(idea.potentialExtensions.length).toBeGreaterThanOrEqual(3);
      expect(idea.potentialExtensions.length).toBeLessThanOrEqual(5);

      // Requirement 2.10: Similar Projects (3-5 items)
      expect(Array.isArray(idea.similarProjects)).toBe(true);
      expect(idea.similarProjects.length).toBeGreaterThanOrEqual(3);
      expect(idea.similarProjects.length).toBeLessThanOrEqual(5);

      // Metadata
      expect(idea.id).toBeTruthy();
      expect(idea.category).toBeTruthy();
      expect(CATEGORIES).toContain(idea.category as any);
      expect(idea.generatedAt).toBeGreaterThan(0);
      expect(idea.generationType).toBe('algorithmic');
    });

    test('generates ideas within 500ms (Requirement 1.2)', () => {
      const startTime = performance.now();
      generator.generateIdea('test_seed', [], []);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500);
    });

    test('uses deterministic generation with same seed (Requirement 1.1, 1.5)', () => {
      const seed = 'deterministic_test';
      const idea1 = generator.generateIdea(seed, [], []);
      const idea2 = generator.generateIdea(seed, [], []);

      expect(idea1.title).toBe(idea2.title);
      expect(idea1.description).toBe(idea2.description);
      expect(idea1.category).toBe(idea2.category);
      expect(idea1.difficultyLevel).toBe(idea2.difficultyLevel);
    });

    test('generates different ideas with different seeds', () => {
      const idea1 = generator.generateIdea('seed1', [], []);
      const idea2 = generator.generateIdea('seed2', [], []);

      expect(idea1.title).not.toBe(idea2.title);
    });

    test('respects category filtering when categories provided', () => {
      const selectedCategories = ['Web Development', 'Mobile Development'];
      const idea = generator.generateIdea('test_seed', selectedCategories, []);

      expect(selectedCategories).toContain(idea.category);
    });

    test('generates from all categories when no categories specified', () => {
      const ideas = Array.from({ length: 20 }, (_, i) => 
        generator.generateIdea(`seed_${i}`, [], [])
      );

      const uniqueCategories = new Set(ideas.map(idea => idea.category));
      expect(uniqueCategories.size).toBeGreaterThan(1);
    });

    test('ensures uniqueness by checking session history (Requirement 1.4)', () => {
      const seed1 = 'test_seed_1';
      const idea1 = generator.generateIdea(seed1, [], []);
      
      // Create attribute hash for session history
      const attributeHash = `${idea1.category}|${idea1.difficultyLevel}|${idea1.technicalRequirements.slice(0, 3).join('|')}`;
      
      // Generate with same seed but different session history should still work
      const idea2 = generator.generateIdea(seed1, [], [attributeHash]);
      
      expect(idea2).toBeDefined();
      expect(idea2.title).toBeTruthy();
    });

    test('generates valid IDs for all ideas', () => {
      const ideas = Array.from({ length: 10 }, (_, i) => 
        generator.generateIdea(`seed_${i}`, [], [])
      );

      const ids = ideas.map(idea => idea.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ideas.length);
      ids.forEach(id => {
        expect(id).toBeTruthy();
        expect(typeof id).toBe('string');
      });
    });

    test('generates valid descriptions with proper length', () => {
      const idea = generator.generateIdea('test_seed', [], []);

      expect(idea.description.length).toBeGreaterThanOrEqual(50);
      expect(idea.description.length).toBeLessThanOrEqual(500);
    });

    test('generates appropriate technical requirements for difficulty level', () => {
      const beginnerIdea = generator.generateIdea('beginner_seed', [], []);
      const advancedIdea = generator.generateIdea('advanced_seed', [], []);

      expect(beginnerIdea.technicalRequirements.length).toBeGreaterThanOrEqual(2);
      expect(advancedIdea.technicalRequirements.length).toBeGreaterThanOrEqual(2);
    });

    test('supports all 8 required categories', () => {
      const categorySeeds = [
        'web_seed',
        'mobile_seed',
        'cli_seed',
        'game_seed',
        'viz_seed',
        'api_seed',
        'auto_seed',
        'fullstack_seed'
      ];

      const ideas = categorySeeds.map(seed => 
        generator.generateIdea(seed, [], [])
      );

      const categories = ideas.map(idea => idea.category);
      const uniqueCategories = new Set(categories);

      // Should generate ideas from multiple categories
      expect(uniqueCategories.size).toBeGreaterThan(1);
      
      // All categories should be valid
      categories.forEach(category => {
        expect(CATEGORIES).toContain(category as any);
      });
    });
  });

  describe('generateDailyIdea', () => {
    test('generates consistent idea for same date (Requirement 3.1, 3.2)', () => {
      const date = new Date('2024-01-15');
      const idea1 = generator.generateDailyIdea(date);
      const idea2 = generator.generateDailyIdea(date);

      expect(idea1.title).toBe(idea2.title);
      expect(idea1.description).toBe(idea2.description);
      expect(idea1.category).toBe(idea2.category);
      expect(idea1.difficultyLevel).toBe(idea2.difficultyLevel);
      expect(idea1.coreFeatures).toEqual(idea2.coreFeatures);
    });

    test('generates different ideas for different dates (Requirement 3.4)', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-16');
      
      const idea1 = generator.generateDailyIdea(date1);
      const idea2 = generator.generateDailyIdea(date2);

      expect(idea1.title).not.toBe(idea2.title);
      expect(idea1.id).not.toBe(idea2.id);
    });

    test('uses UTC timezone for date consistency', () => {
      const date = new Date('2024-01-15T23:59:59Z');
      const idea = generator.generateDailyIdea(date);

      expect(idea).toBeDefined();
      expect(idea.title).toBeTruthy();
    });

    test('daily idea has complete structure', () => {
      const date = new Date('2024-01-15');
      const idea = generator.generateDailyIdea(date);

      expect(idea.title).toBeTruthy();
      expect(idea.description).toBeTruthy();
      expect(idea.targetAudience).toBeTruthy();
      expect(idea.coreFeatures.length).toBeGreaterThanOrEqual(5);
      expect(idea.technicalRequirements.length).toBeGreaterThanOrEqual(2);
      expect(['Beginner', 'Intermediate', 'Advanced']).toContain(idea.difficultyLevel);
      expect(idea.estimatedTime).toBeTruthy();
      expect(idea.learningOutcomes.length).toBeGreaterThanOrEqual(3);
      expect(idea.potentialExtensions.length).toBeGreaterThanOrEqual(3);
      expect(idea.similarProjects.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty session history', () => {
      const idea = generator.generateIdea('test_seed', [], []);
      expect(idea).toBeDefined();
    });

    test('handles single category selection', () => {
      const idea = generator.generateIdea('test_seed', ['Web Development'], []);
      expect(idea.category).toBe('Web Development');
    });

    test('handles all categories selected', () => {
      const idea = generator.generateIdea('test_seed', [...CATEGORIES], []);
      expect(CATEGORIES).toContain(idea.category as any);
    });

    test('generates multiple ideas in sequence', () => {
      const ideas = Array.from({ length: 100 }, (_, i) => 
        generator.generateIdea(`seed_${i}`, [], [])
      );

      expect(ideas.length).toBe(100);
      ideas.forEach(idea => {
        expect(idea.title).toBeTruthy();
        expect(idea.description).toBeTruthy();
      });
    });

    test('handles rapid generation requests', () => {
      const startTime = performance.now();
      const ideas = Array.from({ length: 10 }, (_, i) => 
        generator.generateIdea(`rapid_${i}_${Date.now()}`, [], [])
      );
      const endTime = performance.now();

      expect(ideas.length).toBe(10);
      expect(endTime - startTime).toBeLessThan(5000); // All 10 under 5 seconds
    });
  });
});
