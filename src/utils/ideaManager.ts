/**
 * IdeaManager - Orchestrates idea generation, storage, and session management
 * Implements Requirements 3.1, 4.1, 4.2, 5.1, 6.1, 6.2, 13.1, 13.2
 */

import { ProjectBriefing, AIConfig, Result, StorageError } from '../types';
import { AlgorithmicGenerator } from './generator';
import { FallbackMechanism, FallbackResult } from './fallbackMechanism';
import { StorageManager } from './storage';

/**
 * IdeaManager class
 * Manages the current idea, daily featured idea, and orchestrates generation
 */
export class IdeaManager {
  private currentIdea: ProjectBriefing | null = null;
  private sessionHistory: string[] = [];
  private algorithmicGenerator: AlgorithmicGenerator;
  private fallbackMechanism: FallbackMechanism;
  private storageManager: StorageManager;

  constructor() {
    this.algorithmicGenerator = new AlgorithmicGenerator();
    this.fallbackMechanism = new FallbackMechanism();
    this.storageManager = new StorageManager();
  }

  /**
   * Get the current idea in memory
   * @returns Current ProjectBriefing or null if none exists
   */
  getCurrentIdea(): ProjectBriefing | null {
    return this.currentIdea;
  }

  /**
   * Get the daily featured idea for today
   * Uses current UTC date as seed for deterministic generation
   * Always uses AlgorithmicGenerator (not AI) for consistency
   * Requirement 3.1: Generate one Daily_Featured_Idea per calendar day based on UTC timezone
   * Requirement 3.2: Daily_Featured_Idea remains identical for all Users on the same calendar day
   * @returns ProjectBriefing for today's featured idea
   */
  getDailyFeaturedIdea(): ProjectBriefing {
    const today = new Date();
    return this.algorithmicGenerator.generateDailyIdea(today);
  }

  /**
   * Generate a new project idea
   * Uses FallbackMechanism for AI generation with automatic fallback
   * Requirement 4.1: Allow unlimited additional project ideas
   * Requirement 4.2: Generate and display new Project_Briefing within 500ms (or 6s with AI)
   * @param aiConfig - AI configuration (provider, apiKey, enabled, timeout)
   * @param categories - Selected categories for filtering
   * @returns Promise<FallbackResult> with generated idea and fallback information
   */
  async generateNewIdea(
    aiConfig: AIConfig,
    categories: string[]
  ): Promise<FallbackResult> {
    const result = await this.fallbackMechanism.generateWithFallback(
      aiConfig,
      categories,
      this.sessionHistory
    );

    // Update current idea
    this.currentIdea = result.idea;

    // Update session history with attribute hash
    const attributeHash = this.generateAttributeHash(result.idea);
    this.sessionHistory.push(attributeHash);

    // Keep session history limited to last 50 ideas
    if (this.sessionHistory.length > 50) {
      this.sessionHistory.shift();
    }

    return result;
  }

  /**
   * Save the current idea to storage
   * Requirement 5.1: Persist complete briefing to localStorage
   * @returns Result<void, StorageError>
   */
  saveCurrentIdea(): Result<void, StorageError> {
    if (!this.currentIdea) {
      return {
        ok: false,
        error: {
          type: 'not_found',
          message: 'No current idea to save'
        }
      };
    }

    return this.storageManager.saveIdea(this.currentIdea);
  }

  /**
   * Discard current idea and generate a new one
   * Requirement 6.1: Remove current idea from view when discarded
   * Requirement 6.2: Immediately generate new Project_Briefing to replace discarded idea
   * @param aiConfig - AI configuration
   * @param categories - Selected categories
   * @returns Promise<FallbackResult> with new idea
   */
  async discardAndRegenerate(
    aiConfig: AIConfig,
    categories: string[]
  ): Promise<FallbackResult> {
    // Track discarded idea pattern in session history
    if (this.currentIdea) {
      const discardedHash = this.generateAttributeHash(this.currentIdea);
      // Add to session history to avoid similar ideas
      this.sessionHistory.push(`discarded_${discardedHash}`);
    }

    // Generate new idea
    return this.generateNewIdea(aiConfig, categories);
  }

  /**
   * Get all saved ideas from storage
   * Requirement 13.1: Display all saved ideas in dedicated view
   * @returns Result<ProjectBriefing[], StorageError>
   */
  getSavedIdeas(): Result<ProjectBriefing[], StorageError> {
    return this.storageManager.getSavedIdeas();
  }

  /**
   * Delete a saved idea by ID
   * Requirement 13.2: Remove idea from localStorage when deleted
   * @param id - Unique identifier of the idea to delete
   * @returns Result<void, StorageError>
   */
  deleteSavedIdea(id: string): Result<void, StorageError> {
    return this.storageManager.deleteIdea(id);
  }

  /**
   * Generate attribute hash for uniqueness checking
   * Combines category, difficulty level, and first 3 technical requirements
   * @param idea - ProjectBriefing to hash
   * @returns Hash string for session history
   */
  private generateAttributeHash(idea: ProjectBriefing): string {
    const attributes = [
      idea.category,
      idea.difficultyLevel,
      ...idea.technicalRequirements.slice(0, 3)
    ].join('|');

    return this.hashString(attributes);
  }

  /**
   * Simple hash function for string hashing
   * @param str - String to hash
   * @returns Hash as base36 string
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Clear session history (useful for testing or manual reset)
   */
  clearSessionHistory(): void {
    this.sessionHistory = [];
  }

  /**
   * Get session history size (useful for debugging)
   */
  getSessionHistorySize(): number {
    return this.sessionHistory.length;
  }
}
