/**
 * AppStateManager - Coordinates communication between UI and business logic
 * Manages view transitions, error handling, and user feedback
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6
 */

import { ProjectBriefing, AIConfig, UserSettings, StorageError } from '../types';
import { IdeaManager } from './ideaManager';
import { SettingsManager } from './settings';
import { StorageManager } from './storage';
import { NetworkDetector } from './networkDetector';

/**
 * View types for navigation
 */
export type ViewType = 'main' | 'saved' | 'settings';

/**
 * Message severity levels
 */
export type MessageSeverity = 'info' | 'error' | 'success';

/**
 * User feedback message
 */
export interface FeedbackMessage {
  id: string;
  message: string;
  severity: MessageSeverity;
  timestamp: number;
  autoDismiss: boolean;
}

/**
 * Application state
 */
export interface AppState {
  currentView: ViewType;
  currentIdea: ProjectBriefing | null;
  isDailyFeatured: boolean;
  savedIdeas: ProjectBriefing[];
  settings: UserSettings;
  isLoading: boolean;
  messages: FeedbackMessage[];
  isOnline: boolean;
}

/**
 * State change listener callback
 */
export type StateChangeListener = (state: AppState) => void;

/**
 * AppStateManager class
 * Orchestrates all application state and coordinates between components
 */
export class AppStateManager {
  private state: AppState;
  private listeners: StateChangeListener[] = [];
  private ideaManager: IdeaManager;
  private settingsManager: SettingsManager;
  private storageManager: StorageManager;
  private networkDetector: NetworkDetector;
  private messageIdCounter = 0;

  constructor() {
    this.storageManager = new StorageManager();
    this.settingsManager = new SettingsManager(this.storageManager);
    this.ideaManager = new IdeaManager();
    this.networkDetector = new NetworkDetector();

    // Initialize state
    const settingsResult = this.storageManager.getSettings();
    const savedIdeasResult = this.storageManager.getSavedIdeas();

    this.state = {
      currentView: 'main',
      currentIdea: null,
      isDailyFeatured: false,
      savedIdeas: savedIdeasResult.ok ? savedIdeasResult.value : [],
      settings: settingsResult.ok ? settingsResult.value : this.getDefaultSettings(),
      isLoading: false,
      messages: [],
      isOnline: this.networkDetector.getIsOnline()
    };

    // Subscribe to network status changes
    // Requirement 12.5: Continue to function when offline
    // Requirement 12.6: Only require internet for AI generation
    this.networkDetector.subscribe((isOnline) => {
      this.handleNetworkStatusChange(isOnline);
    });

    // Load daily featured idea on startup
    this.loadDailyFeaturedIdea();
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): UserSettings {
    return {
      categories: [],
      aiConfig: {
        provider: 'openai',
        apiKey: '',
        enabled: false,
        timeout: 5000
      },
      version: '1.0.0'
    };
  }

  /**
   * Get current application state
   */
  getState(): AppState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   * @param listener - Callback function to be called on state changes
   * @returns Unsubscribe function
   */
  subscribe(listener: StateChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Update state and notify listeners
   */
  private setState(updates: Partial<AppState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const currentState = this.getState();
    this.listeners.forEach(listener => listener(currentState));
  }

  /**
   * Navigate to a different view
   * @param view - Target view type
   */
  navigateToView(view: ViewType): void {
    this.setState({ currentView: view });
    
    // Reload saved ideas when navigating to saved view
    if (view === 'saved') {
      this.refreshSavedIdeas();
    }
  }

  /**
   * Load the daily featured idea
   */
  loadDailyFeaturedIdea(): void {
    try {
      const dailyIdea = this.ideaManager.getDailyFeaturedIdea();
      this.setState({
        currentIdea: dailyIdea,
        isDailyFeatured: true
      });
    } catch (error) {
      this.handleError('Failed to load daily featured idea', error);
    }
  }

  /**
   * Generate a new project idea
   * Requirement 12.5: Continue to function when offline using algorithmic generation
   * Requirement 12.6: Only require internet for AI generation
   * Requirement 15.3: Display specific error type for AI failures
   */
  async generateNewIdea(): Promise<void> {
    this.setState({ isLoading: true });

    try {
      // Check if AI is enabled and we're offline
      // Requirement 12.6: Only require internet for AI generation
      if (this.state.settings.aiConfig.enabled && !this.state.isOnline) {
        // Show offline message and use algorithmic generation
        this.showMessage(
          'You are offline. AI generation is disabled. Using algorithmic generation.',
          'info',
          true
        );
        
        // Force algorithmic generation by temporarily disabling AI
        const result = await this.ideaManager.generateNewIdea(
          { ...this.state.settings.aiConfig, enabled: false },
          this.state.settings.categories
        );

        this.setState({
          currentIdea: result.idea,
          isDailyFeatured: false,
          isLoading: false
        });
        return;
      }

      const result = await this.ideaManager.generateNewIdea(
        this.state.settings.aiConfig,
        this.state.settings.categories
      );

      this.setState({
        currentIdea: result.idea,
        isDailyFeatured: false,
        isLoading: false
      });

      // Show fallback message if AI generation failed
      // Requirement 15.3: Display specific error type
      if (result.usedFallback && result.error) {
        const errorMessage = this.getAIErrorMessage(result.error.type);
        this.showMessage(errorMessage, 'info', true);
      }
    } catch (error) {
      this.setState({ isLoading: false });
      this.handleError('Failed to generate idea', error);
    }
  }

  /**
   * Get user-friendly AI error message
   * Requirement 15.3: Display specific error type
   */
  private getAIErrorMessage(errorType: string): string {
    switch (errorType) {
      case 'invalid_key':
        return 'Invalid API key. Check your key and try again. Using algorithmic generation.';
      case 'rate_limit':
        return 'API rate limit reached. Using algorithmic generation.';
      case 'network_error':
        return 'Network error. Using algorithmic generation.';
      case 'timeout':
        return 'AI request timed out. Using algorithmic generation.';
      case 'parse_error':
        return 'AI response was invalid. Using algorithmic generation.';
      default:
        return 'AI generation failed. Using algorithmic generation.';
    }
  }

  /**
   * Save the current idea
   * Requirement 15.2: Display error for storage issues
   */
  saveCurrentIdea(): void {
    const result = this.ideaManager.saveCurrentIdea();

    if (result.ok) {
      this.showMessage('Idea saved successfully!', 'success', true);
      this.refreshSavedIdeas();
    } else {
      // Requirement 15.2: Display storage error message
      this.handleStorageError(result.error);
    }
  }

  /**
   * Discard current idea and generate a new one
   */
  async discardAndRegenerate(): Promise<void> {
    this.setState({ isLoading: true });

    try {
      // Check if AI is enabled and we're offline
      // Requirement 12.6: Only require internet for AI generation
      if (this.state.settings.aiConfig.enabled && !this.state.isOnline) {
        // Show offline message and use algorithmic generation
        this.showMessage(
          'You are offline. AI generation is disabled. Using algorithmic generation.',
          'info',
          true
        );
        
        // Force algorithmic generation by temporarily disabling AI
        const result = await this.ideaManager.discardAndRegenerate(
          { ...this.state.settings.aiConfig, enabled: false },
          this.state.settings.categories
        );

        this.setState({
          currentIdea: result.idea,
          isDailyFeatured: false,
          isLoading: false
        });
        return;
      }

      const result = await this.ideaManager.discardAndRegenerate(
        this.state.settings.aiConfig,
        this.state.settings.categories
      );

      this.setState({
        currentIdea: result.idea,
        isDailyFeatured: false,
        isLoading: false
      });

      if (result.usedFallback && result.error) {
        const errorMessage = this.getAIErrorMessage(result.error.type);
        this.showMessage(errorMessage, 'info', true);
      }
    } catch (error) {
      this.setState({ isLoading: false });
      this.handleError('Failed to generate new idea', error);
    }
  }

  /**
   * Delete a saved idea
   * Requirement 15.2: Display error for storage issues
   */
  deleteSavedIdea(id: string): void {
    const result = this.ideaManager.deleteSavedIdea(id);

    if (result.ok) {
      this.showMessage('Idea deleted successfully', 'success', true);
      this.refreshSavedIdeas();
    } else {
      this.handleStorageError(result.error);
    }
  }

  /**
   * View a saved idea (navigate to main view with the idea)
   */
  viewSavedIdea(id: string): void {
    const savedIdea = this.state.savedIdeas.find(idea => idea.id === id);
    
    if (savedIdea) {
      this.setState({
        currentView: 'main',
        currentIdea: savedIdea,
        isDailyFeatured: false
      });
    } else {
      this.showMessage('Idea not found', 'error', false);
    }
  }

  /**
   * Refresh saved ideas from storage
   */
  private refreshSavedIdeas(): void {
    const result = this.ideaManager.getSavedIdeas();
    
    if (result.ok) {
      this.setState({ savedIdeas: result.value });
    } else {
      this.handleStorageError(result.error);
    }
  }

  /**
   * Update category preferences
   * Requirement 15.2: Display error for storage issues
   */
  updateCategories(categories: string[]): void {
    const result = this.settingsManager.setCategories(categories);

    if (result.ok) {
      const settingsResult = this.storageManager.getSettings();
      if (settingsResult.ok) {
        this.setState({ settings: settingsResult.value });
      }
    } else {
      this.handleStorageError(result.error);
    }
  }

  /**
   * Update AI configuration
   * Requirement 15.2: Display error for storage issues
   */
  updateAIConfig(config: AIConfig): void {
    const result = this.settingsManager.setAIConfig(config);

    if (result.ok) {
      const settingsResult = this.storageManager.getSettings();
      if (settingsResult.ok) {
        this.setState({ settings: settingsResult.value });
      }
    } else {
      this.handleStorageError(result.error);
    }
  }

  /**
   * Reset settings to defaults
   */
  resetSettings(): void {
    const result = this.settingsManager.resetSettings();

    if (result.ok) {
      const settingsResult = this.storageManager.getSettings();
      if (settingsResult.ok) {
        this.setState({ settings: settingsResult.value });
        this.showMessage('Settings reset successfully', 'success', true);
      }
    } else {
      this.handleStorageError(result.error);
    }
  }

  /**
   * Show a feedback message to the user
   * Requirement 15.4: Auto-dismiss informational messages after 5 seconds
   * Requirement 15.5: Require user action to dismiss error messages
   * 
   * @param message - Message text
   * @param severity - Message severity level
   * @param autoDismiss - Whether to auto-dismiss (true for info/success, false for errors)
   */
  showMessage(message: string, severity: MessageSeverity, autoDismiss: boolean): void {
    const feedbackMessage: FeedbackMessage = {
      id: `msg_${this.messageIdCounter++}`,
      message,
      severity,
      timestamp: Date.now(),
      autoDismiss
    };

    this.setState({
      messages: [...this.state.messages, feedbackMessage]
    });

    // Auto-dismiss after 5 seconds if enabled
    // Requirement 15.4: Auto-dismiss informational messages after 5 seconds
    if (autoDismiss) {
      setTimeout(() => {
        this.dismissMessage(feedbackMessage.id);
      }, 5000);
    }
  }

  /**
   * Dismiss a feedback message
   * @param messageId - ID of the message to dismiss
   */
  dismissMessage(messageId: string): void {
    this.setState({
      messages: this.state.messages.filter(msg => msg.id !== messageId)
    });
  }

  /**
   * Handle storage errors
   * Requirement 15.2: Display error for storage issues
   * Requirement 15.6: Log detailed error information to console
   */
  private handleStorageError(error: StorageError): void {
    // Requirement 15.6: Log detailed error to console
    console.error('Storage error:', {
      type: error.type,
      message: error.message,
      timestamp: new Date().toISOString()
    });

    // Display user-friendly error message
    // Requirement 15.5: Require user action to dismiss error messages
    let userMessage = error.message;
    
    if (error.type === 'quota_exceeded') {
      userMessage = 'Storage capacity reached. Delete saved ideas to free space.';
    } else if (error.type === 'parse_error') {
      userMessage = 'Data corruption detected. Some data may be lost.';
    } else if (error.type === 'not_found') {
      userMessage = 'Requested item not found.';
    }

    this.showMessage(userMessage, 'error', false);
  }

  /**
   * Handle general errors
   * Requirement 15.1: Display user-friendly error message
   * Requirement 15.6: Log detailed error information to console
   */
  private handleError(context: string, error: unknown): void {
    // Requirement 15.6: Log detailed error to console
    console.error(`Error in ${context}:`, {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      state: {
        currentView: this.state.currentView,
        hasCurrentIdea: !!this.state.currentIdea,
        savedIdeasCount: this.state.savedIdeas.length
      }
    });

    // Display user-friendly error message
    // Requirement 15.1: Display user-friendly error message
    // Requirement 15.5: Require user action to dismiss error messages
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    this.showMessage(`${context}: ${message}`, 'error', false);
  }

  /**
   * Clear all messages
   */
  clearAllMessages(): void {
    this.setState({ messages: [] });
  }

  /**
   * Handle network status changes
   * Requirement 12.5: Display appropriate messaging when offline
   * @param isOnline - New online status
   */
  private handleNetworkStatusChange(isOnline: boolean): void {
    this.setState({ isOnline });

    // Show appropriate message based on status
    if (!isOnline) {
      // Requirement 12.5: Display appropriate messaging when offline
      this.showMessage(
        'You are offline. Algorithmic generation will continue to work. AI generation is disabled.',
        'info',
        true
      );
    } else {
      this.showMessage(
        'You are back online. AI generation is now available.',
        'success',
        true
      );
    }
  }

  /**
   * Get storage usage information
   */
  getStorageUsage(): { used: number; available: number } {
    return this.storageManager.getStorageUsage();
  }
}
