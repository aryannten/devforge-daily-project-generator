/**
 * FallbackMechanism - Automatic fallback from AI to algorithmic generation
 * Implements Requirements 9.1, 9.2, 9.5, 15.3
 */

import { ProjectBriefing, AIConfig } from '../types';
import { AIGenerator, AIGenerationError } from './aiGenerator';
import { AlgorithmicGenerator } from './generator';

/**
 * FallbackResult - Result type that includes fallback information
 */
export interface FallbackResult {
  idea: ProjectBriefing;
  usedFallback: boolean;
  error?: AIGenerationError;
  generationTime: number;
}

/**
 * FallbackMechanism class
 * Wraps AI generation with automatic fallback to algorithmic generation
 */
export class FallbackMechanism {
  private aiGenerator: AIGenerator;
  private algorithmicGenerator: AlgorithmicGenerator;

  constructor() {
    this.aiGenerator = new AIGenerator();
    this.algorithmicGenerator = new AlgorithmicGenerator();
  }

  /**
   * Generate an idea with automatic fallback
   * @param aiConfig - AI configuration (provider, apiKey)
   * @param categories - Selected categories for filtering
   * @param sessionHistory - Session history for uniqueness
   * @returns FallbackResult with idea and fallback information
   */
  async generateWithFallback(
    aiConfig: AIConfig,
    categories: string[],
    sessionHistory: string[]
  ): Promise<FallbackResult> {
    const startTime = performance.now();

    // Attempt AI generation if enabled
    if (aiConfig.enabled && aiConfig.apiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), aiConfig.timeout);

        const result = await this.aiGenerator.generateIdea(
          aiConfig.provider,
          aiConfig.apiKey,
          categories,
          controller.signal
        );

        clearTimeout(timeoutId);

        if (result.ok) {
          const endTime = performance.now();
          const generationTime = endTime - startTime;

          return {
            idea: result.value,
            usedFallback: false,
            generationTime
          };
        }

        // AI generation failed, fall back to algorithmic
        return this.fallbackToAlgorithmic(
          categories,
          sessionHistory,
          startTime,
          result.error
        );
      } catch (error) {
        // Unexpected error, fall back to algorithmic
        const aiError: AIGenerationError = {
          type: 'network_error',
          message: error instanceof Error ? error.message : 'Unknown error'
        };

        return this.fallbackToAlgorithmic(
          categories,
          sessionHistory,
          startTime,
          aiError
        );
      }
    }

    // AI not enabled, use algorithmic generation directly
    return this.generateAlgorithmic(categories, sessionHistory, startTime);
  }

  /**
   * Fall back to algorithmic generation
   * @param categories - Selected categories
   * @param sessionHistory - Session history
   * @param startTime - Start time for timing calculation
   * @param error - AI error that triggered fallback
   * @returns FallbackResult with algorithmic idea
   */
  private fallbackToAlgorithmic(
    categories: string[],
    sessionHistory: string[],
    startTime: number,
    error: AIGenerationError
  ): FallbackResult {
    // Log fallback event for debugging
    console.warn('AI generation failed, falling back to algorithmic generation', {
      errorType: error.type,
      errorMessage: error.message,
      timestamp: new Date().toISOString()
    });

    // Generate algorithmic idea
    const seed = `fallback_${Date.now()}_${Math.random()}`;
    const idea = this.algorithmicGenerator.generateIdea(seed, categories, sessionHistory);

    const endTime = performance.now();
    const generationTime = endTime - startTime;

    // Ensure total time is under 6 seconds (Requirement 9.5)
    if (generationTime > 6000) {
      console.warn(`Fallback generation took ${generationTime.toFixed(2)}ms, exceeding 6s target`);
    }

    return {
      idea,
      usedFallback: true,
      error,
      generationTime
    };
  }

  /**
   * Generate idea using algorithmic generator directly
   * @param categories - Selected categories
   * @param sessionHistory - Session history
   * @param startTime - Start time for timing calculation
   * @returns FallbackResult with algorithmic idea
   */
  private generateAlgorithmic(
    categories: string[],
    sessionHistory: string[],
    startTime: number
  ): FallbackResult {
    const seed = `${Date.now()}_${Math.random()}`;
    const idea = this.algorithmicGenerator.generateIdea(seed, categories, sessionHistory);

    const endTime = performance.now();
    const generationTime = endTime - startTime;

    return {
      idea,
      usedFallback: false,
      generationTime
    };
  }

  /**
   * Get user-friendly error message for display
   * @param error - AI generation error
   * @returns User-friendly error message
   */
  getUserFriendlyErrorMessage(error: AIGenerationError): string {
    switch (error.type) {
      case 'invalid_key':
        return 'Invalid API key. Check your key and try again. Using algorithmic generation.';
      case 'rate_limit':
        return 'API rate limit reached. Using algorithmic generation.';
      case 'network_error':
        return 'Network error. Using algorithmic generation.';
      case 'timeout':
        return 'AI request timed out. Using algorithmic generation.';
      case 'parse_error':
        return 'Failed to parse AI response. Using algorithmic generation.';
      case 'validation_error':
        return 'AI response was invalid. Using algorithmic generation.';
      default:
        return 'AI generation failed. Using algorithmic generation.';
    }
  }
}
