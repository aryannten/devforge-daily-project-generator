/**
 * NetworkDetector - Detects and monitors network connectivity status
 * Requirements: 12.5, 12.6
 */

/**
 * Network status change listener callback
 */
export type NetworkStatusListener = (isOnline: boolean) => void;

/**
 * NetworkDetector class
 * Monitors browser online/offline status and notifies listeners
 */
export class NetworkDetector {
  private listeners: NetworkStatusListener[] = [];
  private isOnline: boolean;

  constructor() {
    // Initialize with current online status
    this.isOnline = navigator.onLine;

    // Set up event listeners for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  /**
   * Get current online status
   * @returns true if online, false if offline
   */
  getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Subscribe to network status changes
   * @param listener - Callback function to be called on status changes
   * @returns Unsubscribe function
   */
  subscribe(listener: NetworkStatusListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Handle online event
   */
  private handleOnline = (): void => {
    this.isOnline = true;
    this.notifyListeners();
  };

  /**
   * Handle offline event
   */
  private handleOffline = (): void => {
    this.isOnline = false;
    this.notifyListeners();
  };

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.listeners = [];
  }
}
