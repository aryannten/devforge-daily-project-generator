/**
 * Core data models for DevForge - Daily Project Idea Generator
 */

/**
 * ProjectBriefing - The core data structure representing a generated project idea
 * Contains 10 sections as specified in requirements 2.1-2.11
 */
export interface ProjectBriefing {
  // Unique identifier (UUID v4)
  id: string;
  
  // Section 1: Project Title
  title: string;
  
  // Section 2: Project Description
  description: string;
  
  // Section 3: Target Audience
  targetAudience: string;
  
  // Section 4: Core Features (5-7 items)
  coreFeatures: string[];
  
  // Section 5: Technical Requirements
  technicalRequirements: string[];
  
  // Section 6: Difficulty Level
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  
  // Section 7: Estimated Time
  estimatedTime: string; // e.g., "2-3 weeks", "1 weekend"
  
  // Section 8: Learning Outcomes (3-5 items)
  learningOutcomes: string[];
  
  // Section 9: Potential Extensions (3-5 items)
  potentialExtensions: string[];
  
  // Section 10: Similar Projects (3-5 items)
  similarProjects: string[];
  
  // Metadata
  category: string;
  generatedAt: number; // Unix timestamp
  generationType: 'algorithmic' | 'ai';
}

/**
 * UserSettings - Persisted user configuration
 */
export interface UserSettings {
  // Category preferences (empty array = all categories enabled)
  categories: string[];
  
  // AI configuration
  aiConfig: AIConfig;
  
  // Settings version for migration
  version: string;
}

/**
 * AIConfig - Configuration for AI-powered generation
 */
export interface AIConfig {
  provider: 'openai' | 'gemini' | 'groq';
  apiKey: string;
  enabled: boolean;
  timeout: number; // milliseconds
}

/**
 * SessionHistory - Temporary data for avoiding duplicates within a session
 */
export interface SessionHistory {
  generatedIds: string[];
  attributeHashes: string[]; // Hashes of key attribute combinations
  discardedPatterns: DiscardedPattern[];
  sessionStart: number;
}

/**
 * DiscardedPattern - Pattern of discarded ideas for filtering
 */
export interface DiscardedPattern {
  category: string;
  titleWords: string[];
  featureKeywords: string[];
}

/**
 * StorageSchema - Complete localStorage structure
 */
export interface StorageSchema {
  devforge_saved_ideas: ProjectBriefing[];
  devforge_settings: UserSettings;
  devforge_session_history: SessionHistory;
}

/**
 * StorageError - Error types for storage operations
 */
export type StorageError = 
  | { type: 'quota_exceeded'; message: string }
  | { type: 'parse_error'; message: string }
  | { type: 'not_found'; message: string };

/**
 * Result - Type-safe result pattern for operations that can fail
 */
export type Result<T, E> = 
  | { ok: true; value: T } 
  | { ok: false; error: E };
