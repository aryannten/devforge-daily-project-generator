/**
 * Example usage of AppStateManager
 * Demonstrates how to integrate the state management layer with UI components
 */

import { AppStateManager } from './appStateManager';

// Example 1: Basic initialization and subscription
function basicUsageExample() {
  // Create the state manager
  const stateManager = new AppStateManager();

  // Subscribe to state changes
  // @ts-expect-error - Example code, unsubscribe not used
  const unsubscribe = stateManager.subscribe((state) => {
    console.log('State updated:', {
      view: state.currentView,
      hasIdea: !!state.currentIdea,
      savedCount: state.savedIdeas.length,
      messages: state.messages.length
    });
  });

  // Get current state
  const currentState = stateManager.getState();
  console.log('Current idea:', currentState.currentIdea?.title);

  // Clean up when done
  // unsubscribe();
}

// Example 2: Generating and saving ideas
async function ideaGenerationExample() {
  const stateManager = new AppStateManager();

  // Generate a new idea
  await stateManager.generateNewIdea();
  
  const state = stateManager.getState();
  console.log('Generated idea:', state.currentIdea?.title);

  // Save the current idea
  stateManager.saveCurrentIdea();
  console.log('Saved ideas count:', stateManager.getState().savedIdeas.length);

  // Discard and generate a new one
  await stateManager.discardAndRegenerate();
  console.log('New idea:', stateManager.getState().currentIdea?.title);
}

// Example 3: View navigation
function navigationExample() {
  const stateManager = new AppStateManager();

  // Navigate to different views
  stateManager.navigateToView('main');
  stateManager.navigateToView('saved');
  stateManager.navigateToView('settings');

  // View a saved idea
  const state = stateManager.getState();
  if (state.savedIdeas.length > 0) {
    const firstIdea = state.savedIdeas[0];
    if (firstIdea) {
      stateManager.viewSavedIdea(firstIdea.id);
    }
  }
}

// Example 4: Settings management
function settingsExample() {
  const stateManager = new AppStateManager();

  // Update category preferences
  stateManager.updateCategories(['Web Development', 'Mobile Development']);

  // Update AI configuration
  stateManager.updateAIConfig({
    provider: 'openai',
    apiKey: 'your-api-key-here',
    enabled: true,
    timeout: 5000
  });

  // Reset settings
  stateManager.resetSettings();
}

// Example 5: Message handling
function messageHandlingExample() {
  const stateManager = new AppStateManager();

  // Show different types of messages
  stateManager.showMessage('Idea saved successfully!', 'success', true);
  stateManager.showMessage('API rate limit reached', 'info', true);
  stateManager.showMessage('Storage capacity exceeded', 'error', false);

  // Dismiss a specific message
  const state = stateManager.getState();
  if (state.messages.length > 0 && state.messages[0]) {
    stateManager.dismissMessage(state.messages[0].id);
  }

  // Clear all messages
  stateManager.clearAllMessages();
}

// Example 6: React integration pattern
function reactIntegrationExample() {
  // In a React component:
  /*
  import { useEffect, useState } from 'react';
  import { AppStateManager, AppState } from './utils/appStateManager';

  function App() {
    const [stateManager] = useState(() => new AppStateManager());
    const [appState, setAppState] = useState<AppState>(stateManager.getState());

    useEffect(() => {
      // Subscribe to state changes
      const unsubscribe = stateManager.subscribe((newState) => {
        setAppState(newState);
      });

      // Cleanup on unmount
      return unsubscribe;
    }, [stateManager]);

    return (
      <div>
        {appState.currentView === 'main' && (
          <MainView
            currentIdea={appState.currentIdea}
            isDailyFeatured={appState.isDailyFeatured}
            onSave={() => stateManager.saveCurrentIdea()}
            onDiscard={() => stateManager.discardAndRegenerate()}
            onGenerate={() => stateManager.generateNewIdea()}
            isLoading={appState.isLoading}
          />
        )}

        {appState.currentView === 'saved' && (
          <SavedIdeasView
            savedIdeas={appState.savedIdeas}
            onDelete={(id) => stateManager.deleteSavedIdea(id)}
            onView={(id) => stateManager.viewSavedIdea(id)}
          />
        )}

        {appState.currentView === 'settings' && (
          <SettingsView
            categories={appState.settings.categories}
            aiConfig={appState.settings.aiConfig}
            onCategoriesChange={(cats) => stateManager.updateCategories(cats)}
            onAIConfigChange={(config) => stateManager.updateAIConfig(config)}
            onReset={() => stateManager.resetSettings()}
          />
        )}

        {appState.messages.map((message) => (
          <MessageToast
            key={message.id}
            message={message}
            onDismiss={() => stateManager.dismissMessage(message.id)}
          />
        ))}
      </div>
    );
  }
  */
}

// Example 7: Error handling
async function errorHandlingExample() {
  const stateManager = new AppStateManager();

  // Errors are automatically handled and displayed as messages
  try {
    // Try to save without a current idea
    stateManager.saveCurrentIdea();
    
    // Check for error messages
    const state = stateManager.getState();
    const errorMessages = state.messages.filter(m => m.severity === 'error');
    console.log('Error messages:', errorMessages);
  } catch (error) {
    // Errors are caught internally and converted to user messages
    console.error('Unexpected error:', error);
  }
}

// Example 8: Storage monitoring
function storageMonitoringExample() {
  const stateManager = new AppStateManager();

  // Check storage usage
  const usage = stateManager.getStorageUsage();
  console.log('Storage used:', usage.used, 'bytes');
  console.log('Storage available:', usage.available, 'bytes');

  // Calculate percentage
  const total = usage.used + usage.available;
  const percentage = (usage.used / total) * 100;
  console.log('Storage usage:', percentage.toFixed(2), '%');
}

// Export examples for documentation
export {
  basicUsageExample,
  ideaGenerationExample,
  navigationExample,
  settingsExample,
  messageHandlingExample,
  reactIntegrationExample,
  errorHandlingExample,
  storageMonitoringExample
};
