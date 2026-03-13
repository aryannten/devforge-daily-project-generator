/**
 * StorageManager - Handles all localStorage operations with Result type pattern
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 14.1, 14.2, 14.3, 14.4, 14.5
 */

import { ProjectBriefing, UserSettings, StorageError, Result } from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from './constants';

export class StorageManager {
  /**
   * Save a project idea to localStorage
   * Requirement 5.1: Persist complete briefing to localStorage
   * Requirement 5.5: Store ideas in JSON format with unique identifier
   */
  saveIdea(idea: ProjectBriefing): Result<void, StorageError> {
    try {
      const savedIdeasResult = this.getSavedIdeas();
      const savedIdeas = savedIdeasResult.ok ? savedIdeasResult.value : [];

      // Check if idea already exists
      const existingIndex = savedIdeas.findIndex(i => i.id === idea.id);
      if (existingIndex >= 0) {
        savedIdeas[existingIndex] = idea;
      } else {
        savedIdeas.push(idea);
      }

      const serialized = JSON.stringify(savedIdeas);
      localStorage.setItem(STORAGE_KEYS.SAVED_IDEAS, serialized);

      return { ok: true, value: undefined };
    } catch (error) {
      if (error instanceof Error) {
        // Check for quota exceeded error
        if (error.name === 'QuotaExceededError' || 
            (error as any).code === 22 || 
            (error as any).code === 1014) {
          return {
            ok: false,
            error: {
              type: 'quota_exceeded',
              message: 'Storage capacity reached. Delete saved ideas to free space.'
            }
          };
        }
        
        return {
          ok: false,
          error: {
            type: 'parse_error',
            message: `Failed to save idea: ${error.message}`
          }
        };
      }

      return {
        ok: false,
        error: {
          type: 'parse_error',
          message: 'Unknown error occurred while saving idea'
        }
      };
    }
  }

  /**
   * Retrieve all saved ideas from localStorage
   * Requirement 5.2: Maintain all saved ideas across browser sessions
   * Requirement 5.4: Retrieve and display complete ProjectBriefing
   */
  getSavedIdeas(): Result<ProjectBriefing[], StorageError> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_IDEAS);
      
      if (data === null) {
        return { ok: true, value: [] };
      }

      const parsed = JSON.parse(data);
      
      if (!Array.isArray(parsed)) {
        return {
          ok: false,
          error: {
            type: 'parse_error',
            message: 'Saved ideas data is corrupted'
          }
        };
      }

      return { ok: true, value: parsed };
    } catch (error) {
      if (error instanceof SyntaxError) {
        return {
          ok: false,
          error: {
            type: 'parse_error',
            message: 'Failed to parse saved ideas data'
          }
        };
      }

      return {
        ok: false,
        error: {
          type: 'parse_error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Delete a saved idea by ID
   * Requirement 13.2: Remove idea from localStorage
   */
  deleteIdea(id: string): Result<void, StorageError> {
    try {
      const savedIdeasResult = this.getSavedIdeas();
      
      if (!savedIdeasResult.ok) {
        return savedIdeasResult;
      }

      const savedIdeas = savedIdeasResult.value;
      const filteredIdeas = savedIdeas.filter(idea => idea.id !== id);

      if (filteredIdeas.length === savedIdeas.length) {
        return {
          ok: false,
          error: {
            type: 'not_found',
            message: `Idea with id ${id} not found`
          }
        };
      }

      const serialized = JSON.stringify(filteredIdeas);
      localStorage.setItem(STORAGE_KEYS.SAVED_IDEAS, serialized);

      return { ok: true, value: undefined };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'parse_error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Save user settings to localStorage
   * Requirement 14.1: Persist all user settings to localStorage when changed
   * Requirement 14.3: Persist Category_Preference selections across sessions
   * Requirement 14.4: Persist API key configurations across sessions
   * Requirement 14.5: Persist AI generation enable/disable state across sessions
   */
  saveSettings(settings: UserSettings): Result<void, StorageError> {
    try {
      const serialized = JSON.stringify(settings);
      localStorage.setItem(STORAGE_KEYS.SETTINGS, serialized);

      return { ok: true, value: undefined };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'QuotaExceededError' || 
            (error as any).code === 22 || 
            (error as any).code === 1014) {
          return {
            ok: false,
            error: {
              type: 'quota_exceeded',
              message: 'Storage capacity reached'
            }
          };
        }
        
        return {
          ok: false,
          error: {
            type: 'parse_error',
            message: `Failed to save settings: ${error.message}`
          }
        };
      }

      return {
        ok: false,
        error: {
          type: 'parse_error',
          message: 'Unknown error occurred while saving settings'
        }
      };
    }
  }

  /**
   * Retrieve user settings from localStorage
   * Requirement 14.2: Load all settings from localStorage within 100ms
   */
  getSettings(): Result<UserSettings, StorageError> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      
      if (data === null) {
        return { ok: true, value: DEFAULT_SETTINGS };
      }

      const parsed = JSON.parse(data);
      
      // Validate settings structure
      if (typeof parsed !== 'object' || parsed === null) {
        return {
          ok: false,
          error: {
            type: 'parse_error',
            message: 'Settings data is corrupted'
          }
        };
      }

      return { ok: true, value: parsed };
    } catch (error) {
      if (error instanceof SyntaxError) {
        return {
          ok: false,
          error: {
            type: 'parse_error',
            message: 'Failed to parse settings data'
          }
        };
      }

      return {
        ok: false,
        error: {
          type: 'parse_error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Clear all settings (reset to defaults)
   * Requirement 14.6: Provide reset settings option that clears all stored preferences except saved ideas
   */
  clearSettings(): Result<void, StorageError> {
    try {
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      return { ok: true, value: undefined };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'parse_error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get storage usage information for capacity monitoring
   * Requirement 5.6: Display error when localStorage is full
   */
  getStorageUsage(): { used: number; available: number } {
    try {
      // Calculate used storage
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // Most browsers have 5-10MB limit, we'll use 5MB as conservative estimate
      const totalAvailable = 5 * 1024 * 1024; // 5MB in bytes
      const available = totalAvailable - used;

      return {
        used,
        available: Math.max(0, available)
      };
    } catch (error) {
      // If we can't calculate, return safe defaults
      return {
        used: 0,
        available: 5 * 1024 * 1024
      };
    }
  }
}
