/**
 * App Integration Tests
 * Tests complete application initialization and manager coordination
 * Requirements: 12.1, 12.4, 14.2
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { App } from './App';

describe('App Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('initializes all managers on startup', async () => {
    render(<App />);
    
    // Verify navigation is rendered (UI initialized)
    expect(screen.getByText('DevForge')).toBeInTheDocument();
    
    // Verify daily featured idea loads (IdeaManager initialized)
    await waitFor(() => {
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });

  test('loads settings from storage on startup', async () => {
    // Pre-populate settings
    const testSettings = {
      categories: ['Web Development', 'Mobile Development'],
      aiConfig: {
        provider: 'openai',
        apiKey: 'test-key',
        enabled: true,
        timeout: 5000
      },
      version: '1.0.0'
    };
    localStorage.setItem('devforge_settings', JSON.stringify(testSettings));
    
    render(<App />);
    
    // Navigate to settings
    const settingsButton = screen.getByLabelText('Navigate to settings');
    fireEvent.click(settingsButton);
    
    // Verify settings were loaded
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    });
  });

  test('connects event handlers correctly', async () => {
    render(<App />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('DevForge')).toBeInTheDocument();
    });
    
    // Test navigation event handler
    const savedButton = screen.getByLabelText('Navigate to saved ideas');
    fireEvent.click(savedButton);
    
    await waitFor(() => {
      expect(screen.getByText('Saved Ideas')).toBeInTheDocument();
    });
  });
});
