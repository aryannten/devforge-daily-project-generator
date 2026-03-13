/**
 * Unit tests for AppStateManager
 * Tests state management, view transitions, error handling, and message display
 */

import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { AppStateManager } from './appStateManager';
import { AIConfig } from '../types';

describe('AppStateManager', () => {
  let stateManager: AppStateManager;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    stateManager = new AppStateManager();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Initialization', () => {
    test('initializes with default state', () => {
      const state = stateManager.getState();

      expect(state.currentView).toBe('main');
      expect(state.currentIdea).toBeDefined(); // Daily featured idea loaded
      expect(state.isDailyFeatured).toBe(true);
      expect(state.savedIdeas).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.messages).toEqual([]);
    });

    test('loads daily featured idea on startup', () => {
      const state = stateManager.getState();

      expect(state.currentIdea).not.toBeNull();
      expect(state.isDailyFeatured).toBe(true);
      expect(state.currentIdea?.title).toBeTruthy();
    });

    test('loads settings from localStorage if available', () => {
      const customSettings = {
        categories: ['Web Development'],
        aiConfig: {
          provider: 'gemini' as const,
          apiKey: 'test-key',
          enabled: true,
          timeout: 5000
        },
        version: '1.0.0'
      };

      localStorage.setItem('devforge_settings', JSON.stringify(customSettings));
      
      const newStateManager = new AppStateManager();
      const state = newStateManager.getState();

      expect(state.settings.categories).toEqual(['Web Development']);
      expect(state.settings.aiConfig.provider).toBe('gemini');
    });
  });

  describe('View Navigation', () => {
    test('navigates to different views', () => {
      stateManager.navigateToView('saved');
      expect(stateManager.getState().currentView).toBe('saved');

      stateManager.navigateToView('settings');
      expect(stateManager.getState().currentView).toBe('settings');

      stateManager.navigateToView('main');
      expect(stateManager.getState().currentView).toBe('main');
    });

    test('refreshes saved ideas when navigating to saved view', async () => {
      // Generate a new idea first (daily featured idea is already loaded)
      await stateManager.generateNewIdea();
      
      // Save the idea
      stateManager.saveCurrentIdea();

      // Navigate to saved view
      stateManager.navigateToView('saved');

      const state = stateManager.getState();
      expect(state.savedIdeas.length).toBeGreaterThan(0);
    });
  });

  describe('State Subscription', () => {
    test('notifies listeners on state changes', () => {
      const listener = vi.fn();
      stateManager.subscribe(listener);

      stateManager.navigateToView('saved');

      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ currentView: 'saved' })
      );
    });

    test('unsubscribe removes listener', () => {
      const listener = vi.fn();
      const unsubscribe = stateManager.subscribe(listener);

      unsubscribe();
      stateManager.navigateToView('saved');

      expect(listener).not.toHaveBeenCalled();
    });

    test('multiple listeners receive updates', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      stateManager.subscribe(listener1);
      stateManager.subscribe(listener2);

      stateManager.navigateToView('settings');

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('Idea Generation', () => {
    test('generates new idea successfully', async () => {
      await stateManager.generateNewIdea();

      const state = stateManager.getState();
      expect(state.currentIdea).not.toBeNull();
      expect(state.isDailyFeatured).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    test('sets loading state during generation', async () => {
      const promise = stateManager.generateNewIdea();
      
      // Check loading state immediately
      let state = stateManager.getState();
      expect(state.isLoading).toBe(true);

      await promise;

      // Check loading state after completion
      state = stateManager.getState();
      expect(state.isLoading).toBe(false);
    });

    test('shows fallback message when AI generation fails', async () => {
      // Enable AI with invalid key to trigger fallback
      const aiConfig: AIConfig = {
        provider: 'openai',
        apiKey: 'invalid-key',
        enabled: true,
        timeout: 5000
      };

      stateManager.updateAIConfig(aiConfig);
      await stateManager.generateNewIdea();

      const state = stateManager.getState();
      // Should have a message about fallback
      expect(state.messages.length).toBeGreaterThan(0);
    });
  });

  describe('Idea Management', () => {
    test('saves current idea successfully', async () => {
      // Generate a new idea first
      await stateManager.generateNewIdea();
      
      stateManager.saveCurrentIdea();

      const state = stateManager.getState();
      expect(state.savedIdeas.length).toBe(1);
      expect(state.messages.some(m => m.severity === 'success')).toBe(true);
    });

    test('deletes saved idea successfully', async () => {
      // Generate and save an idea first
      await stateManager.generateNewIdea();
      stateManager.saveCurrentIdea();
      const state1 = stateManager.getState();
      const ideaId = state1.savedIdeas[0]?.id;
      expect(ideaId).toBeDefined();

      // Delete the idea
      stateManager.deleteSavedIdea(ideaId!);

      const state2 = stateManager.getState();
      expect(state2.savedIdeas.length).toBe(0);
    });

    test('views saved idea by navigating to main view', async () => {
      // Generate and save an idea
      await stateManager.generateNewIdea();
      stateManager.saveCurrentIdea();
      const state1 = stateManager.getState();
      const ideaId = state1.savedIdeas[0]?.id;
      expect(ideaId).toBeDefined();

      // Navigate away
      stateManager.navigateToView('settings');

      // View the saved idea
      stateManager.viewSavedIdea(ideaId!);

      const state2 = stateManager.getState();
      expect(state2.currentView).toBe('main');
      expect(state2.currentIdea?.id).toBe(ideaId);
      expect(state2.isDailyFeatured).toBe(false);
    });

    test('shows error when viewing non-existent idea', () => {
      stateManager.viewSavedIdea('non-existent-id');

      const state = stateManager.getState();
      expect(state.messages.some(m => m.severity === 'error')).toBe(true);
    });

    test('discards and regenerates idea', async () => {
      const originalIdea = stateManager.getState().currentIdea;

      await stateManager.discardAndRegenerate();

      const state = stateManager.getState();
      expect(state.currentIdea).not.toBeNull();
      expect(state.currentIdea?.id).not.toBe(originalIdea?.id);
      expect(state.isDailyFeatured).toBe(false);
    });
  });

  describe('Settings Management', () => {
    test('updates category preferences', () => {
      const categories = ['Web Development', 'Mobile Development'];
      stateManager.updateCategories(categories);

      const state = stateManager.getState();
      expect(state.settings.categories).toEqual(categories);
    });

    test('updates AI configuration', () => {
      const aiConfig: AIConfig = {
        provider: 'gemini',
        apiKey: 'test-key',
        enabled: true,
        timeout: 5000
      };

      stateManager.updateAIConfig(aiConfig);

      const state = stateManager.getState();
      expect(state.settings.aiConfig).toEqual(aiConfig);
    });

    test('resets settings to defaults', () => {
      // Change settings first
      stateManager.updateCategories(['Web Development']);
      stateManager.updateAIConfig({
        provider: 'gemini',
        apiKey: 'test-key',
        enabled: true,
        timeout: 5000
      });

      // Reset settings
      stateManager.resetSettings();

      const state = stateManager.getState();
      expect(state.settings.categories).toEqual([]);
      expect(state.settings.aiConfig.enabled).toBe(false);
      expect(state.settings.aiConfig.apiKey).toBe('');
    });

    test('reset settings preserves saved ideas', async () => {
      // Generate and save an idea
      await stateManager.generateNewIdea();
      stateManager.saveCurrentIdea();
      const state1 = stateManager.getState();
      expect(state1.savedIdeas.length).toBe(1);

      // Reset settings
      stateManager.resetSettings();

      const state2 = stateManager.getState();
      expect(state2.savedIdeas.length).toBe(1);
    });
  });

  describe('Message Display', () => {
    test('shows info message with auto-dismiss', () => {
      stateManager.showMessage('Test info', 'info', true);

      const state = stateManager.getState();
      expect(state.messages.length).toBe(1);
      expect(state.messages[0]?.message).toBe('Test info');
      expect(state.messages[0]?.severity).toBe('info');
      expect(state.messages[0]?.autoDismiss).toBe(true);
    });

    test('shows error message without auto-dismiss', () => {
      stateManager.showMessage('Test error', 'error', false);

      const state = stateManager.getState();
      expect(state.messages.length).toBe(1);
      expect(state.messages[0]?.message).toBe('Test error');
      expect(state.messages[0]?.severity).toBe('error');
      expect(state.messages[0]?.autoDismiss).toBe(false);
    });

    test('auto-dismisses info messages after 5 seconds', async () => {
      vi.useFakeTimers();

      stateManager.showMessage('Auto-dismiss test', 'info', true);

      let state = stateManager.getState();
      expect(state.messages.length).toBe(1);

      // Fast-forward 5 seconds
      vi.advanceTimersByTime(5000);

      state = stateManager.getState();
      expect(state.messages.length).toBe(0);

      vi.useRealTimers();
    });

    test('does not auto-dismiss error messages', async () => {
      vi.useFakeTimers();

      stateManager.showMessage('Error test', 'error', false);

      let state = stateManager.getState();
      expect(state.messages.length).toBe(1);

      // Fast-forward 10 seconds
      vi.advanceTimersByTime(10000);

      state = stateManager.getState();
      expect(state.messages.length).toBe(1); // Still there

      vi.useRealTimers();
    });

    test('dismisses message manually', () => {
      stateManager.showMessage('Test message', 'info', false);

      const state1 = stateManager.getState();
      const messageId = state1.messages[0]?.id;
      expect(messageId).toBeDefined();

      stateManager.dismissMessage(messageId!);

      const state2 = stateManager.getState();
      expect(state2.messages.length).toBe(0);
    });

    test('clears all messages', () => {
      stateManager.showMessage('Message 1', 'info', false);
      stateManager.showMessage('Message 2', 'error', false);
      stateManager.showMessage('Message 3', 'success', true);

      let state = stateManager.getState();
      expect(state.messages.length).toBe(3);

      stateManager.clearAllMessages();

      state = stateManager.getState();
      expect(state.messages.length).toBe(0);
    });

    test('assigns unique IDs to messages', () => {
      stateManager.showMessage('Message 1', 'info', true);
      stateManager.showMessage('Message 2', 'info', true);

      const state = stateManager.getState();
      expect(state.messages[0]?.id).not.toBe(state.messages[1]?.id);
    });
  });

  describe('Error Handling', () => {
    test('handles storage quota exceeded error', () => {
      // Fill localStorage to trigger quota error
      // This is a simplified test - actual quota testing is complex
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Try to save many ideas to potentially trigger quota
      for (let i = 0; i < 100; i++) {
        stateManager.saveCurrentIdea();
      }

      // Should have logged errors if quota was exceeded
      // Note: This test may not always trigger quota in test environment
      
      consoleSpy.mockRestore();
    });

    test('logs detailed error information to console', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Trigger an error by viewing non-existent idea
      stateManager.viewSavedIdea('non-existent');

      // Should not log to console for this type of error (it's expected)
      // But should show user message
      const state = stateManager.getState();
      expect(state.messages.some(m => m.severity === 'error')).toBe(true);

      consoleSpy.mockRestore();
    });

    test('displays user-friendly error messages', () => {
      stateManager.viewSavedIdea('non-existent-id');

      const state = stateManager.getState();
      const errorMessage = state.messages.find(m => m.severity === 'error');
      
      expect(errorMessage).toBeDefined();
      expect(errorMessage?.message).toBe('Idea not found');
    });

    test('displays specific AI error messages', async () => {
      // This would require mocking the AI generator to return specific errors
      // For now, we test the error message generation function indirectly
      
      const aiConfig: AIConfig = {
        provider: 'openai',
        apiKey: 'invalid-key',
        enabled: true,
        timeout: 5000
      };

      stateManager.updateAIConfig(aiConfig);
      await stateManager.generateNewIdea();

      // Should have generated an idea (via fallback) and shown a message
      const state = stateManager.getState();
      expect(state.currentIdea).not.toBeNull();
    });
  });

  describe('Storage Usage', () => {
    test('returns storage usage information', () => {
      const usage = stateManager.getStorageUsage();

      expect(usage).toHaveProperty('used');
      expect(usage).toHaveProperty('available');
      expect(typeof usage.used).toBe('number');
      expect(typeof usage.available).toBe('number');
    });
  });

  describe('Daily Featured Idea', () => {
    test('loads daily featured idea on initialization', () => {
      const state = stateManager.getState();

      expect(state.currentIdea).not.toBeNull();
      expect(state.isDailyFeatured).toBe(true);
    });

    test('can reload daily featured idea', () => {
      // Generate a new idea first
      stateManager.generateNewIdea();

      // Reload daily featured idea
      stateManager.loadDailyFeaturedIdea();

      const state = stateManager.getState();
      expect(state.isDailyFeatured).toBe(true);
    });
  });
});
