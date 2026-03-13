/**
 * Offline Functionality Integration Tests
 * Requirements: 12.5, 12.6
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { AppStateManager } from './appStateManager';

describe('Offline Functionality Integration', () => {
  let appStateManager: AppStateManager;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Mock navigator.onLine as true initially
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });

    appStateManager = new AppStateManager();
  });

  describe('Requirement 12.5: Continue to function when offline', () => {
    test('algorithmic generation works without network', async () => {
      // Simulate offline mode
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      // Trigger offline event
      window.dispatchEvent(new Event('offline'));

      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate idea while offline
      await appStateManager.generateNewIdea();

      const state = appStateManager.getState();
      
      // Should have generated an idea
      expect(state.currentIdea).not.toBeNull();
      expect(state.currentIdea?.title).toBeTruthy();
      expect(state.currentIdea?.generationType).toBe('algorithmic');
    });

    test('daily featured idea works offline', () => {
      // Simulate offline mode
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      // Load daily featured idea
      appStateManager.loadDailyFeaturedIdea();

      const state = appStateManager.getState();
      
      // Should have loaded daily idea
      expect(state.currentIdea).not.toBeNull();
      expect(state.isDailyFeatured).toBe(true);
      expect(state.currentIdea?.generationType).toBe('algorithmic');
    });

    test('saved ideas can be accessed offline', () => {
      // Save an idea while online
      const state = appStateManager.getState();
      if (state.currentIdea) {
        appStateManager.saveCurrentIdea();
      }

      // Go offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      window.dispatchEvent(new Event('offline'));

      // Navigate to saved view
      appStateManager.navigateToView('saved');

      const newState = appStateManager.getState();
      
      // Should be able to access saved ideas
      expect(newState.currentView).toBe('saved');
      expect(Array.isArray(newState.savedIdeas)).toBe(true);
    });

    test('discard and regenerate works offline', async () => {
      // Go offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      window.dispatchEvent(new Event('offline'));

      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Discard and regenerate
      await appStateManager.discardAndRegenerate();

      const state = appStateManager.getState();
      
      // Should have generated a new idea
      expect(state.currentIdea).not.toBeNull();
      expect(state.currentIdea?.generationType).toBe('algorithmic');
    });
  });

  describe('Requirement 12.6: Only require internet for AI generation', () => {
    test('displays offline message when AI is enabled and offline', async () => {
      // Enable AI
      appStateManager.updateAIConfig({
        provider: 'openai',
        apiKey: 'test-key',
        enabled: true,
        timeout: 5000
      });

      // Go offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      window.dispatchEvent(new Event('offline'));

      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Clear messages from offline notification
      appStateManager.clearAllMessages();

      // Try to generate idea
      await appStateManager.generateNewIdea();

      const state = appStateManager.getState();
      
      // Should show offline message
      const offlineMessage = state.messages.find(msg => 
        msg.message.includes('offline') && msg.message.includes('AI generation is disabled')
      );
      expect(offlineMessage).toBeDefined();
      
      // Should still generate idea using algorithmic method
      expect(state.currentIdea).not.toBeNull();
      expect(state.currentIdea?.generationType).toBe('algorithmic');
    });

    test('AI generation is disabled when offline', async () => {
      // Enable AI
      appStateManager.updateAIConfig({
        provider: 'openai',
        apiKey: 'test-key',
        enabled: true,
        timeout: 5000
      });

      // Go offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      window.dispatchEvent(new Event('offline'));

      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate idea
      await appStateManager.generateNewIdea();

      const state = appStateManager.getState();
      
      // Should use algorithmic generation even though AI is enabled
      expect(state.currentIdea?.generationType).toBe('algorithmic');
    });

    test('shows online message when connection is restored', async () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      window.dispatchEvent(new Event('offline'));

      // Wait for offline message
      await new Promise(resolve => setTimeout(resolve, 100));

      // Clear messages
      appStateManager.clearAllMessages();

      // Go online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
      window.dispatchEvent(new Event('online'));

      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));

      const state = appStateManager.getState();
      
      // Should show online message
      const onlineMessage = state.messages.find(msg => 
        msg.message.includes('back online') && msg.message.includes('AI generation is now available')
      );
      expect(onlineMessage).toBeDefined();
      expect(state.isOnline).toBe(true);
    });

    test('algorithmic generation works regardless of online status', async () => {
      // Disable AI (use algorithmic only)
      appStateManager.updateAIConfig({
        provider: 'openai',
        apiKey: '',
        enabled: false,
        timeout: 5000
      });

      // Test online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
      await appStateManager.generateNewIdea();
      let state = appStateManager.getState();
      expect(state.currentIdea?.generationType).toBe('algorithmic');

      // Test offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      await appStateManager.generateNewIdea();
      state = appStateManager.getState();
      expect(state.currentIdea?.generationType).toBe('algorithmic');
    });
  });

  describe('Network Status Tracking', () => {
    test('tracks online status in state', () => {
      const state = appStateManager.getState();
      expect(state.isOnline).toBe(true);
    });

    test('updates state when going offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      window.dispatchEvent(new Event('offline'));

      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));

      const state = appStateManager.getState();
      expect(state.isOnline).toBe(false);
    });

    test('updates state when going online', async () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      window.dispatchEvent(new Event('offline'));
      await new Promise(resolve => setTimeout(resolve, 100));

      // Go online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
      window.dispatchEvent(new Event('online'));
      await new Promise(resolve => setTimeout(resolve, 100));

      const state = appStateManager.getState();
      expect(state.isOnline).toBe(true);
    });
  });

  describe('User Feedback', () => {
    test('shows appropriate offline message', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      window.dispatchEvent(new Event('offline'));

      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));

      const state = appStateManager.getState();
      
      const offlineMessage = state.messages.find(msg => 
        msg.message.includes('offline') && 
        msg.message.includes('Algorithmic generation will continue to work')
      );
      expect(offlineMessage).toBeDefined();
      expect(offlineMessage?.severity).toBe('info');
      expect(offlineMessage?.autoDismiss).toBe(true);
    });

    test('offline messages auto-dismiss', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      window.dispatchEvent(new Event('offline'));

      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));

      const state = appStateManager.getState();
      const offlineMessage = state.messages.find(msg => msg.message.includes('offline'));
      expect(offlineMessage?.autoDismiss).toBe(true);
    });
  });
});
