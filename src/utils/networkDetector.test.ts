/**
 * NetworkDetector Tests
 * Requirements: 12.5, 12.6
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { NetworkDetector } from './networkDetector';

describe('NetworkDetector', () => {
  let networkDetector: NetworkDetector;
  let onlineListeners: Array<() => void> = [];
  let offlineListeners: Array<() => void> = [];

  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });

    // Mock window event listeners
    onlineListeners = [];
    offlineListeners = [];

    const originalAddEventListener = window.addEventListener;
    vi.spyOn(window, 'addEventListener').mockImplementation((event: string, handler: any) => {
      if (event === 'online') {
        onlineListeners.push(handler);
      } else if (event === 'offline') {
        offlineListeners.push(handler);
      } else {
        originalAddEventListener.call(window, event, handler);
      }
    });

    networkDetector = new NetworkDetector();
  });

  afterEach(() => {
    networkDetector.destroy();
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    test('initializes with current online status', () => {
      expect(networkDetector.getIsOnline()).toBe(true);
    });

    test('initializes with offline status when navigator.onLine is false', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      const detector = new NetworkDetector();
      expect(detector.getIsOnline()).toBe(false);
      detector.destroy();
    });

    test('sets up event listeners for online and offline events', () => {
      expect(onlineListeners.length).toBeGreaterThan(0);
      expect(offlineListeners.length).toBeGreaterThan(0);
    });
  });

  describe('Online/Offline Detection', () => {
    test('updates status when going offline', () => {
      // Simulate offline event
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      offlineListeners.forEach(listener => listener());

      expect(networkDetector.getIsOnline()).toBe(false);
    });

    test('updates status when going online', () => {
      // First go offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      offlineListeners.forEach(listener => listener());

      // Then go online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
      onlineListeners.forEach(listener => listener());

      expect(networkDetector.getIsOnline()).toBe(true);
    });
  });

  describe('Subscription', () => {
    test('notifies listeners when status changes to offline', () => {
      const listener = vi.fn();
      networkDetector.subscribe(listener);

      // Simulate offline event
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      offlineListeners.forEach(l => l());

      expect(listener).toHaveBeenCalledWith(false);
    });

    test('notifies listeners when status changes to online', () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      offlineListeners.forEach(l => l());

      const listener = vi.fn();
      networkDetector.subscribe(listener);

      // Go online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
      onlineListeners.forEach(l => l());

      expect(listener).toHaveBeenCalledWith(true);
    });

    test('supports multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      networkDetector.subscribe(listener1);
      networkDetector.subscribe(listener2);
      networkDetector.subscribe(listener3);

      // Simulate offline event
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      offlineListeners.forEach(l => l());

      expect(listener1).toHaveBeenCalledWith(false);
      expect(listener2).toHaveBeenCalledWith(false);
      expect(listener3).toHaveBeenCalledWith(false);
    });

    test('unsubscribe removes listener', () => {
      const listener = vi.fn();
      const unsubscribe = networkDetector.subscribe(listener);

      unsubscribe();

      // Simulate offline event
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      offlineListeners.forEach(l => l());

      expect(listener).not.toHaveBeenCalled();
    });

    test('unsubscribe only removes specific listener', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = networkDetector.subscribe(listener1);
      networkDetector.subscribe(listener2);

      unsubscribe1();

      // Simulate offline event
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      offlineListeners.forEach(l => l());

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledWith(false);
    });
  });

  describe('Cleanup', () => {
    test('destroy removes event listeners', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      networkDetector.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    });

    test('destroy clears all listeners', () => {
      const listener = vi.fn();
      networkDetector.subscribe(listener);

      networkDetector.destroy();

      // Simulate offline event after destroy
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      offlineListeners.forEach(l => l());

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('handles rapid online/offline transitions', () => {
      const listener = vi.fn();
      networkDetector.subscribe(listener);

      // Rapid transitions
      for (let i = 0; i < 5; i++) {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: false
        });
        offlineListeners.forEach(l => l());

        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: true
        });
        onlineListeners.forEach(l => l());
      }

      expect(listener).toHaveBeenCalledTimes(10);
      expect(networkDetector.getIsOnline()).toBe(true);
    });

    test('maintains correct state after multiple subscriptions and unsubscriptions', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      const unsub1 = networkDetector.subscribe(listener1);
      const unsub2 = networkDetector.subscribe(listener2);
      networkDetector.subscribe(listener3);

      unsub1();
      unsub2();

      // Simulate offline event
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      offlineListeners.forEach(l => l());

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
      expect(listener3).toHaveBeenCalledWith(false);
      expect(networkDetector.getIsOnline()).toBe(false);
    });
  });
});
