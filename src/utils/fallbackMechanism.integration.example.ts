/**
 * Integration Example: How FallbackMechanism will be used in IdeaManager
 * This file demonstrates the intended usage pattern for Task 9.1
 */

import { FallbackMechanism } from './fallbackMechanism';
import { AIConfig } from '../types';

/**
 * Example: IdeaManager integration (to be implemented in Task 9.1)
 */
export class IdeaManagerExample {
  private fallbackMechanism: FallbackMechanism;

  constructor() {
    this.fallbackMechanism = new FallbackMechanism();
  }

  /**
   * Generate a new idea with automatic fallback
   * This is how IdeaManager will use FallbackMechanism
   */
  async generateNewIdea(
    aiConfig: AIConfig,
    categories: string[],
    sessionHistory: string[]
  ) {
    // Use FallbackMechanism to handle AI generation with automatic fallback
    const result = await this.fallbackMechanism.generateWithFallback(
      aiConfig,
      categories,
      sessionHistory
    );

    // Display user-friendly error message if fallback was used
    if (result.usedFallback && result.error) {
      const errorMessage = this.fallbackMechanism.getUserFriendlyErrorMessage(result.error);
      console.info(errorMessage); // In real app, this would be shown in UI
    }

    // Log generation time for monitoring
    console.log(`Idea generated in ${result.generationTime.toFixed(2)}ms`);

    // Return the generated idea
    return result.idea;
  }
}

/**
 * Example usage scenarios
 */

// Scenario 1: AI enabled and succeeds
// @ts-expect-error - Example code, function not called
async function exampleAISuccess() {
  const manager = new IdeaManagerExample();
  
  const aiConfig: AIConfig = {
    provider: 'openai',
    apiKey: 'sk-valid-key',
    enabled: true,
    timeout: 5000
  };

  const idea = await manager.generateNewIdea(aiConfig, [], []);
  console.log('Generated idea:', idea.title);
  console.log('Generation type:', idea.generationType); // 'ai'
}

// Scenario 2: AI fails, automatic fallback to algorithmic
// @ts-expect-error - Example code, function not called
async function exampleAIFailure() {
  const manager = new IdeaManagerExample();
  
  const aiConfig: AIConfig = {
    provider: 'openai',
    apiKey: 'sk-invalid-key',
    enabled: true,
    timeout: 5000
  };

  const idea = await manager.generateNewIdea(aiConfig, [], []);
  console.log('Generated idea:', idea.title);
  console.log('Generation type:', idea.generationType); // 'algorithmic'
  // User sees: "Invalid API key. Check your key and try again. Using algorithmic generation."
}

// Scenario 3: AI disabled, direct algorithmic generation
// @ts-expect-error - Example code, function not called
async function exampleAIDisabled() {
  const manager = new IdeaManagerExample();
  
  const aiConfig: AIConfig = {
    provider: 'openai',
    apiKey: '',
    enabled: false,
    timeout: 5000
  };

  const idea = await manager.generateNewIdea(aiConfig, [], []);
  console.log('Generated idea:', idea.title);
  console.log('Generation type:', idea.generationType); // 'algorithmic'
  // No error message shown, direct algorithmic generation
}

// Scenario 4: Category filtering with fallback
// @ts-expect-error - Example code, function not called
async function exampleCategoryFiltering() {
  const manager = new IdeaManagerExample();
  
  const aiConfig: AIConfig = {
    provider: 'gemini',
    apiKey: 'valid-key',
    enabled: true,
    timeout: 5000
  };

  const categories = ['Web Development', 'Mobile Development'];
  const idea = await manager.generateNewIdea(aiConfig, categories, []);
  
  console.log('Generated idea:', idea.title);
  console.log('Category:', idea.category); // Will be one of the selected categories
}

/**
 * Key Benefits of FallbackMechanism:
 * 
 * 1. Automatic Error Handling: All AI error types are caught and handled
 * 2. Guaranteed Delivery: User always gets an idea within 6 seconds
 * 3. Transparent Fallback: User is informed when fallback occurs
 * 4. Timing Guarantees: Enforces 5s AI timeout + 1s fallback = 6s total
 * 5. Clean Integration: Single method call handles entire flow
 * 6. Error Context: Provides detailed error information for debugging
 * 7. User-Friendly Messages: Converts technical errors to actionable messages
 */
