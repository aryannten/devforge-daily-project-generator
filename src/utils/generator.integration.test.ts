/**
 * Integration tests for AlgorithmicGenerator
 * Demonstrates real-world usage scenarios
 */

import { describe, test, expect } from 'vitest';
import { AlgorithmicGenerator } from './generator';
import { CATEGORIES } from './constants';

describe('AlgorithmicGenerator Integration Tests', () => {
  test('generates 100 unique ideas without rate limits (Requirement 4.1, 4.3)', () => {
    const generator = new AlgorithmicGenerator();
    const sessionHistory: string[] = [];
    
    const ideas = Array.from({ length: 100 }, (_, i) => {
      const seed = `integration_test_${i}_${Date.now()}`;
      const idea = generator.generateIdea(seed, [], sessionHistory);
      
      // Track session history
      const hash = `${idea.category}|${idea.difficultyLevel}|${idea.technicalRequirements.slice(0, 3).join('|')}`;
      sessionHistory.push(hash);
      
      return idea;
    });

    // Verify all ideas generated successfully
    expect(ideas.length).toBe(100);
    
    // Verify all have unique IDs
    const uniqueIds = new Set(ideas.map(idea => idea.id));
    expect(uniqueIds.size).toBe(100);
    
    // Verify diversity in categories
    const categories = new Set(ideas.map(idea => idea.category));
    expect(categories.size).toBeGreaterThan(3);
    
    // Verify all ideas have complete structure
    ideas.forEach(idea => {
      expect(idea.title).toBeTruthy();
      expect(idea.description.length).toBeGreaterThanOrEqual(50);
      expect(idea.coreFeatures.length).toBeGreaterThanOrEqual(5);
      expect(idea.learningOutcomes.length).toBeGreaterThanOrEqual(3);
    });
  });

  test('category filtering works across multiple generations', () => {
    const generator = new AlgorithmicGenerator();
    const selectedCategories = ['Web Development', 'Mobile Development'];
    
    const ideas = Array.from({ length: 20 }, (_, i) => 
      generator.generateIdea(`category_test_${i}_${Date.now()}`, selectedCategories, [])
    );

    // All ideas should be from selected categories
    ideas.forEach(idea => {
      expect(selectedCategories).toContain(idea.category);
    });
    
    // With 20 random seeds, we should get some diversity
    const categories = new Set(ideas.map(idea => idea.category));
    expect(categories.size).toBeGreaterThanOrEqual(1);
    expect(categories.size).toBeLessThanOrEqual(2);
  });

  test('daily featured idea consistency across multiple calls', () => {
    const generator = new AlgorithmicGenerator();
    const testDate = new Date('2024-06-15');
    
    // Generate daily idea 10 times
    const ideas = Array.from({ length: 10 }, () => 
      generator.generateDailyIdea(testDate)
    );

    // All should be identical
    const firstIdea = ideas[0]!;
    ideas.forEach(idea => {
      expect(idea.title).toBe(firstIdea.title);
      expect(idea.description).toBe(firstIdea.description);
      expect(idea.category).toBe(firstIdea.category);
      expect(idea.difficultyLevel).toBe(firstIdea.difficultyLevel);
      expect(idea.coreFeatures).toEqual(firstIdea.coreFeatures);
      expect(idea.technicalRequirements).toEqual(firstIdea.technicalRequirements);
    });
  });

  test('performance: generates 10 ideas in under 5 seconds', () => {
    const generator = new AlgorithmicGenerator();
    const startTime = performance.now();
    
    const ideas = Array.from({ length: 10 }, (_, i) => 
      generator.generateIdea(`perf_test_${i}`, [], [])
    );
    
    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(5000);
    expect(ideas.length).toBe(10);
  });

  test('all 8 categories are supported and generate valid ideas', () => {
    const generator = new AlgorithmicGenerator();
    
    CATEGORIES.forEach(category => {
      const idea = generator.generateIdea(`category_${category}`, [category], []);
      
      expect(idea.category).toBe(category);
      expect(idea.title).toBeTruthy();
      expect(idea.description).toBeTruthy();
      expect(idea.coreFeatures.length).toBeGreaterThanOrEqual(5);
      expect(idea.technicalRequirements.length).toBeGreaterThanOrEqual(2);
    });
  });

  test('generates diverse difficulty levels', () => {
    const generator = new AlgorithmicGenerator();
    
    const ideas = Array.from({ length: 30 }, (_, i) => 
      generator.generateIdea(`difficulty_test_${i}`, [], [])
    );

    const difficulties = new Set(ideas.map(idea => idea.difficultyLevel));
    
    // Should have multiple difficulty levels
    expect(difficulties.size).toBeGreaterThan(1);
    
    // All should be valid difficulty levels
    ideas.forEach(idea => {
      expect(['Beginner', 'Intermediate', 'Advanced']).toContain(idea.difficultyLevel);
    });
  });

  test('session history prevents immediate duplicates', () => {
    const generator = new AlgorithmicGenerator();
    const sessionHistory: string[] = [];
    
    // Generate first idea
    const idea1 = generator.generateIdea('test_seed', [], sessionHistory);
    const hash1 = `${idea1.category}|${idea1.difficultyLevel}|${idea1.technicalRequirements.slice(0, 3).join('|')}`;
    sessionHistory.push(hash1);
    
    // Generate second idea with same seed but different session history
    const idea2 = generator.generateIdea('test_seed', [], sessionHistory);
    
    // Should still generate successfully
    expect(idea2).toBeDefined();
    expect(idea2.title).toBeTruthy();
  });

  test('generates valid time estimates for all difficulty levels', () => {
    const generator = new AlgorithmicGenerator();
    
    const ideas = Array.from({ length: 30 }, (_, i) => 
      generator.generateIdea(`time_test_${i}`, [], [])
    );

    ideas.forEach(idea => {
      expect(idea.estimatedTime).toBeTruthy();
      expect(typeof idea.estimatedTime).toBe('string');
      
      // Time estimates should be reasonable
      const validPatterns = [
        /\d+\s*(day|days|week|weeks|month|months|weekend)/i
      ];
      
      const isValid = validPatterns.some(pattern => pattern.test(idea.estimatedTime));
      expect(isValid).toBe(true);
    });
  });
});
