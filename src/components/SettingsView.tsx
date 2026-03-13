/**
 * SettingsView Component
 * Provides settings interface for category preferences and AI configuration
 * Implements Requirements 7.1, 7.2, 8.1, 8.7, 14.6
 */

import React, { useState } from 'react';
import { AIConfig } from '../types';
import { CATEGORIES } from '../utils/constants';
import './SettingsView.css';

export interface SettingsViewProps {
  categories: string[];
  aiConfig: AIConfig;
  onCategoriesChange: (categories: string[]) => void;
  onAIConfigChange: (config: AIConfig) => void;
  onReset: () => void;
  isOnline: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  categories,
  aiConfig,
  onCategoriesChange,
  onAIConfigChange,
  onReset,
  isOnline
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [localApiKey, setLocalApiKey] = useState(aiConfig.apiKey);

  // Handle category checkbox toggle
  const handleCategoryToggle = (category: string) => {
    const newCategories = categories.includes(category)
      ? categories.filter(c => c !== category)
      : [...categories, category];
    onCategoriesChange(newCategories);
  };

  // Handle select all categories
  const handleSelectAll = () => {
    onCategoriesChange([...CATEGORIES]);
  };

  // Handle clear all categories
  const handleClearAll = () => {
    onCategoriesChange([]);
  };

  // Handle AI provider change
  const handleProviderChange = (provider: 'openai' | 'gemini' | 'groq') => {
    onAIConfigChange({
      ...aiConfig,
      provider
    });
  };

  // Handle API key change
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setLocalApiKey(newKey);
    onAIConfigChange({
      ...aiConfig,
      apiKey: newKey
    });
  };

  // Handle AI enabled toggle
  const handleAIEnabledToggle = () => {
    onAIConfigChange({
      ...aiConfig,
      enabled: !aiConfig.enabled
    });
  };

  // Handle reset settings
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings? This will not delete your saved ideas.')) {
      onReset();
      setLocalApiKey('');
    }
  };

  return (
    <div className="settings-view">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">
          Configure your project idea preferences and AI generation options
        </p>
      </div>

      {/* Category Preferences Section */}
      <section className="settings-section">
        <div className="section-header">
          <h2 className="section-title">Category Preferences</h2>
          <div className="section-actions">
            <button
              className="text-button"
              onClick={handleSelectAll}
              aria-label="Select all categories"
            >
              Select All
            </button>
            <span className="action-separator">|</span>
            <button
              className="text-button"
              onClick={handleClearAll}
              aria-label="Clear all categories"
            >
              Clear All
            </button>
          </div>
        </div>
        <p className="section-description">
          Select categories to filter generated ideas. Leave all unchecked for random selection.
        </p>
        
        <div className="category-grid">
          {CATEGORIES.map((category) => (
            <label
              key={category}
              className="category-checkbox-label"
            >
              <input
                type="checkbox"
                className="category-checkbox"
                checked={categories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                aria-label={`Toggle ${category} category`}
              />
              <span className="checkbox-custom"></span>
              <span className="category-name">{category}</span>
            </label>
          ))}
        </div>

        <div className="category-status">
          {categories.length === 0 ? (
            <span className="status-text">
              <span className="status-icon">🎲</span>
              Random mode: All categories enabled
            </span>
          ) : (
            <span className="status-text">
              <span className="status-icon">✓</span>
              {categories.length} {categories.length === 1 ? 'category' : 'categories'} selected
            </span>
          )}
        </div>
      </section>

      {/* AI Configuration Section */}
      <section className="settings-section">
        <div className="section-header">
          <h2 className="section-title">AI Generation</h2>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={aiConfig.enabled}
              onChange={handleAIEnabledToggle}
              disabled={!isOnline}
              aria-label="Toggle AI generation"
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <p className="section-description">
          Enable AI-powered generation using your own API key. Falls back to algorithmic generation on errors.
        </p>

        {/* Offline Warning */}
        {!isOnline && (
          <div className="offline-warning">
            <span className="warning-icon">⚠️</span>
            <span className="warning-text">
              You are offline. AI generation requires an internet connection.
            </span>
          </div>
        )}

        <div className="ai-config-content">
          {/* AI Provider Selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="ai-provider">
              AI Provider
            </label>
            <div className="provider-buttons">
              <button
                className={`provider-button ${aiConfig.provider === 'openai' ? 'active' : ''}`}
                onClick={() => handleProviderChange('openai')}
                disabled={!aiConfig.enabled || !isOnline}
                aria-label="Select OpenAI provider"
              >
                <span className="provider-icon">🤖</span>
                <span className="provider-name">OpenAI</span>
              </button>
              <button
                className={`provider-button ${aiConfig.provider === 'gemini' ? 'active' : ''}`}
                onClick={() => handleProviderChange('gemini')}
                disabled={!aiConfig.enabled || !isOnline}
                aria-label="Select Gemini provider"
              >
                <span className="provider-icon">✨</span>
                <span className="provider-name">Gemini</span>
              </button>
              <button
                className={`provider-button ${aiConfig.provider === 'groq' ? 'active' : ''}`}
                onClick={() => handleProviderChange('groq')}
                disabled={!aiConfig.enabled || !isOnline}
                aria-label="Select Groq provider"
              >
                <span className="provider-icon">⚡</span>
                <span className="provider-name">Groq</span>
              </button>
            </div>
          </div>

          {/* API Key Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="api-key">
              API Key
            </label>
            <div className="api-key-input-wrapper">
              <input
                id="api-key"
                type={showApiKey ? 'text' : 'password'}
                className="form-input api-key-input"
                value={localApiKey}
                onChange={handleApiKeyChange}
                placeholder="Enter your API key"
                disabled={!aiConfig.enabled || !isOnline}
                aria-label="API key input"
              />
              <button
                className="show-key-button"
                onClick={() => setShowApiKey(!showApiKey)}
                disabled={!aiConfig.enabled || !isOnline}
                aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                title={showApiKey ? 'Hide' : 'Show'}
              >
                {showApiKey ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p className="form-hint">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>

          {/* AI Status Info */}
          <div className="ai-status-info">
            {!isOnline ? (
              <div className="status-message status-warning">
                <span className="status-icon">📡</span>
                <span>Offline - AI generation unavailable</span>
              </div>
            ) : aiConfig.enabled ? (
              aiConfig.apiKey ? (
                <div className="status-message status-success">
                  <span className="status-icon">✓</span>
                  <span>AI generation enabled with {aiConfig.provider}</span>
                </div>
              ) : (
                <div className="status-message status-warning">
                  <span className="status-icon">⚠️</span>
                  <span>Please enter an API key to use AI generation</span>
                </div>
              )
            ) : (
              <div className="status-message status-info">
                <span className="status-icon">ℹ️</span>
                <span>AI generation is disabled. Using algorithmic generation.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Reset Settings Section */}
      <section className="settings-section">
        <div className="section-header">
          <h2 className="section-title">Reset Settings</h2>
        </div>
        <p className="section-description">
          Reset all settings to default values. Your saved ideas will not be affected.
        </p>
        
        <button
          className="button button-danger"
          onClick={handleReset}
          aria-label="Reset all settings"
        >
          <span className="button-icon">🔄</span>
          <span>Reset All Settings</span>
        </button>
      </section>
    </div>
  );
};
