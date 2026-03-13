/**
 * Constants for DevForge - Daily Project Idea Generator
 */

import { UserSettings } from '../types';

/**
 * Supported project categories (Requirement 7.2)
 */
export const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'CLI Tools',
  'Games',
  'Data Visualization',
  'APIs & Backend',
  'Automation & Scripts',
  'Full-Stack Applications'
] as const;

/**
 * localStorage keys for data persistence
 */
export const STORAGE_KEYS = {
  SAVED_IDEAS: 'devforge_saved_ideas',
  SETTINGS: 'devforge_settings',
  SESSION_HISTORY: 'devforge_session_history'
} as const;

/**
 * Default user settings (Requirements 7.5, 8.2, 14.1)
 */
export const DEFAULT_SETTINGS: UserSettings = {
  categories: [], // Empty array = all categories enabled
  aiConfig: {
    provider: 'openai',
    apiKey: '',
    enabled: false,
    timeout: 5000
  },
  version: '1.0.0'
};

/**
 * Validation constraints for ProjectBriefing fields
 */
export const VALIDATION_RULES = {
  TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 80
  },
  DESCRIPTION: {
    MIN_LENGTH: 50,
    MAX_LENGTH: 500
  },
  CORE_FEATURES: {
    MIN_COUNT: 5,
    MAX_COUNT: 7,
    MIN_LENGTH: 10,
    MAX_LENGTH: 100
  },
  TECHNICAL_REQUIREMENTS: {
    MIN_COUNT: 2,
    MAX_COUNT: 10
  },
  LEARNING_OUTCOMES: {
    MIN_COUNT: 3,
    MAX_COUNT: 5
  },
  POTENTIAL_EXTENSIONS: {
    MIN_COUNT: 3,
    MAX_COUNT: 5
  },
  SIMILAR_PROJECTS: {
    MIN_COUNT: 3,
    MAX_COUNT: 5
  }
} as const;

/**
 * Generation timing constraints (Requirements 1.2, 9.2, 9.5)
 */
export const TIMING_CONSTRAINTS = {
  ALGORITHMIC_GENERATION_MAX_MS: 500,
  AI_TIMEOUT_MS: 5000,
  TOTAL_GENERATION_MAX_MS: 6000,
  SETTINGS_LOAD_MAX_MS: 100
} as const;

/**
 * Session management constants
 */
export const SESSION_CONFIG = {
  MAX_HISTORY_SIZE: 50,
  SESSION_TIMEOUT_MS: 24 * 60 * 60 * 1000, // 24 hours
  MIN_ATTRIBUTE_DIFFERENCE: 3 // Minimum Hamming distance between consecutive ideas
} as const;

/**
 * UI timing constants (Requirements 10.6, 15.4, 15.5)
 */
export const UI_TIMING = {
  TRANSITION_DURATION_MS: 200,
  INFO_MESSAGE_AUTO_DISMISS_MS: 5000,
  LAYOUT_ADAPTATION_MAX_MS: 300
} as const;

/**
 * Responsive breakpoints (Requirements 11.1, 11.2, 11.3)
 */
export const BREAKPOINTS = {
  MOBILE_MAX: 767,
  TABLET_MIN: 768,
  TABLET_MAX: 1023,
  DESKTOP_MIN: 1024
} as const;

/**
 * Accessibility constants (Requirement 11.5)
 */
export const ACCESSIBILITY = {
  MIN_TOUCH_TARGET_PX: 44
} as const;