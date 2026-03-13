/**
 * DevForge - Daily Project Idea Generator
 * Entry point for the application
 */

import { CATEGORIES, DEFAULT_SETTINGS, STORAGE_KEYS } from './utils/constants';
import type { ProjectBriefing, UserSettings } from './types';

// Export types and constants for use throughout the application
export type { ProjectBriefing, UserSettings };
export { CATEGORIES, DEFAULT_SETTINGS, STORAGE_KEYS };

console.log('DevForge initialized');
console.log('Supported categories:', CATEGORIES);
