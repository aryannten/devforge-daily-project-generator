/**
 * App Component - Main Application Container
 * Initializes all managers and coordinates UI state
 * Requirements: 12.1, 12.4, 14.2
 */

import React, { useEffect, useState } from 'react';
import { AppStateManager, ViewType, FeedbackMessage } from './utils/appStateManager';
import { MainView } from './components/MainView';
import { SavedIdeasView } from './components/SavedIdeasView';
import { SettingsView } from './components/SettingsView';
import { ProjectBriefing, AIConfig } from './types';
import './App.css';

// Initialize AppStateManager singleton
const appStateManager = new AppStateManager();

export const App: React.FC = () => {
  // Subscribe to app state changes
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [currentIdea, setCurrentIdea] = useState<ProjectBriefing | null>(null);
  const [isDailyFeatured, setIsDailyFeatured] = useState(false);
  const [savedIdeas, setSavedIdeas] = useState<ProjectBriefing[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [aiConfig, setAIConfig] = useState<AIConfig>({
    provider: 'openai',
    apiKey: '',
    enabled: false,
    timeout: 5000
  });
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  // Initialize app and subscribe to state changes
  useEffect(() => {
    // Subscribe to state manager
    const unsubscribe = appStateManager.subscribe((state) => {
      setCurrentView(state.currentView);
      setCurrentIdea(state.currentIdea);
      setIsDailyFeatured(state.isDailyFeatured);
      setSavedIdeas(state.savedIdeas);
      setCategories(state.settings.categories);
      setAIConfig(state.settings.aiConfig);
      setIsLoading(state.isLoading);
      setMessages(state.messages);
      setIsOnline(state.isOnline);
    });

    // Load initial state
    const initialState = appStateManager.getState();
    setCurrentView(initialState.currentView);
    setCurrentIdea(initialState.currentIdea);
    setIsDailyFeatured(initialState.isDailyFeatured);
    setSavedIdeas(initialState.savedIdeas);
    setCategories(initialState.settings.categories);
    setAIConfig(initialState.settings.aiConfig);
    setIsLoading(initialState.isLoading);
    setMessages(initialState.messages);
    setIsOnline(initialState.isOnline);

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Event handlers
  const handleSaveIdea = () => {
    appStateManager.saveCurrentIdea();
  };

  const handleDiscardIdea = () => {
    appStateManager.discardAndRegenerate();
  };

  const handleGenerateNewIdea = () => {
    appStateManager.generateNewIdea();
  };

  const handleDeleteSavedIdea = (id: string) => {
    appStateManager.deleteSavedIdea(id);
  };

  const handleViewSavedIdea = (id: string) => {
    appStateManager.viewSavedIdea(id);
  };

  const handleCategoriesChange = (newCategories: string[]) => {
    appStateManager.updateCategories(newCategories);
  };

  const handleAIConfigChange = (newConfig: AIConfig) => {
    appStateManager.updateAIConfig(newConfig);
  };

  const handleResetSettings = () => {
    appStateManager.resetSettings();
  };

  const handleDismissMessage = (messageId: string) => {
    appStateManager.dismissMessage(messageId);
  };

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'main':
        return (
          <MainView
            currentIdea={currentIdea}
            isDailyFeatured={isDailyFeatured}
            onSave={handleSaveIdea}
            onDiscard={handleDiscardIdea}
            onGenerate={handleGenerateNewIdea}
            isLoading={isLoading}
          />
        );
      
      case 'saved':
        return (
          <SavedIdeasView
            savedIdeas={savedIdeas}
            onDelete={handleDeleteSavedIdea}
            onView={handleViewSavedIdea}
          />
        );
      
      case 'settings':
        return (
          <SettingsView
            categories={categories}
            aiConfig={aiConfig}
            onCategoriesChange={handleCategoriesChange}
            onAIConfigChange={handleAIConfigChange}
            onReset={handleResetSettings}
            isOnline={isOnline}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="app-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <span className="brand-icon">⚡</span>
            <span className="brand-name">DevForge</span>
          </div>
          
          <div className="nav-links">
            <button
              className={`nav-link ${currentView === 'main' ? 'active' : ''}`}
              onClick={() => appStateManager.navigateToView('main')}
              aria-label="Navigate to main view"
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-text">Home</span>
            </button>
            
            <button
              className={`nav-link ${currentView === 'saved' ? 'active' : ''}`}
              onClick={() => appStateManager.navigateToView('saved')}
              aria-label="Navigate to saved ideas"
            >
              <span className="nav-icon">📋</span>
              <span className="nav-text">Saved</span>
              {savedIdeas.length > 0 && (
                <span className="nav-badge">{savedIdeas.length}</span>
              )}
            </button>
            
            <button
              className={`nav-link ${currentView === 'settings' ? 'active' : ''}`}
              onClick={() => appStateManager.navigateToView('settings')}
              aria-label="Navigate to settings"
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Settings</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        {renderView()}
      </main>

      {/* Feedback Messages */}
      {messages.length > 0 && (
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message message-${message.severity}`}
              role="alert"
            >
              <span className="message-text">{message.message}</span>
              {!message.autoDismiss && (
                <button
                  className="message-dismiss"
                  onClick={() => handleDismissMessage(message.id)}
                  aria-label="Dismiss message"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
