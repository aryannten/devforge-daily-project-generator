/**
 * SettingsView Component Tests
 * Tests Requirements 7.1, 7.2, 8.1, 8.7, 14.6
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsView } from './SettingsView';
import { AIConfig } from '../types';
import { CATEGORIES } from '../utils/constants';

describe('SettingsView Component', () => {
  const mockOnCategoriesChange = vi.fn();
  const mockOnAIConfigChange = vi.fn();
  const mockOnReset = vi.fn();

  const defaultAIConfig: AIConfig = {
    provider: 'openai',
    apiKey: '',
    enabled: false,
    timeout: 5000
  };

  const defaultProps = {
    categories: [],
    aiConfig: defaultAIConfig,
    onCategoriesChange: mockOnCategoriesChange,
    onAIConfigChange: mockOnAIConfigChange,
    onReset: mockOnReset,
    isOnline: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Requirement 7.1: Provide settings interface for category selection
  test('displays category selection interface', () => {
    render(<SettingsView {...defaultProps} />);
    
    expect(screen.getByText('Category Preferences')).toBeInTheDocument();
    expect(screen.getByText('Select categories to filter generated ideas. Leave all unchecked for random selection.')).toBeInTheDocument();
  });

  // Requirement 7.2: Support 8 distinct project categories
  test('displays all 8 categories as checkboxes', () => {
    render(<SettingsView {...defaultProps} />);
    
    CATEGORIES.forEach(category => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  test('category checkboxes reflect selected state', () => {
    const selectedCategories = ['Web Development', 'Mobile Development'];
    render(<SettingsView {...defaultProps} categories={selectedCategories} />);
    
    const webDevCheckbox = screen.getByLabelText('Toggle Web Development category') as HTMLInputElement;
    const mobileDevCheckbox = screen.getByLabelText('Toggle Mobile Development category') as HTMLInputElement;
    const gamesCheckbox = screen.getByLabelText('Toggle Games category') as HTMLInputElement;
    
    expect(webDevCheckbox.checked).toBe(true);
    expect(mobileDevCheckbox.checked).toBe(true);
    expect(gamesCheckbox.checked).toBe(false);
  });

  test('clicking category checkbox calls onCategoriesChange', () => {
    render(<SettingsView {...defaultProps} />);
    
    const webDevCheckbox = screen.getByLabelText('Toggle Web Development category');
    fireEvent.click(webDevCheckbox);
    
    expect(mockOnCategoriesChange).toHaveBeenCalledWith(['Web Development']);
  });

  test('unchecking category removes it from selection', () => {
    const selectedCategories = ['Web Development', 'Mobile Development'];
    render(<SettingsView {...defaultProps} categories={selectedCategories} />);
    
    const webDevCheckbox = screen.getByLabelText('Toggle Web Development category');
    fireEvent.click(webDevCheckbox);
    
    expect(mockOnCategoriesChange).toHaveBeenCalledWith(['Mobile Development']);
  });

  test('select all button selects all categories', () => {
    render(<SettingsView {...defaultProps} />);
    
    const selectAllButton = screen.getByLabelText('Select all categories');
    fireEvent.click(selectAllButton);
    
    expect(mockOnCategoriesChange).toHaveBeenCalledWith([...CATEGORIES]);
  });

  test('clear all button clears all categories', () => {
    const selectedCategories = ['Web Development', 'Mobile Development'];
    render(<SettingsView {...defaultProps} categories={selectedCategories} />);
    
    const clearAllButton = screen.getByLabelText('Clear all categories');
    fireEvent.click(clearAllButton);
    
    expect(mockOnCategoriesChange).toHaveBeenCalledWith([]);
  });

  test('displays random mode status when no categories selected', () => {
    render(<SettingsView {...defaultProps} categories={[]} />);
    
    expect(screen.getByText(/Random mode: All categories enabled/)).toBeInTheDocument();
  });

  test('displays selected count when categories are selected', () => {
    const selectedCategories = ['Web Development', 'Mobile Development'];
    render(<SettingsView {...defaultProps} categories={selectedCategories} />);
    
    expect(screen.getByText(/2 categories selected/)).toBeInTheDocument();
  });

  // Requirement 8.1: Provide settings interface for API key input
  test('displays AI configuration section', () => {
    render(<SettingsView {...defaultProps} />);
    
    expect(screen.getByText('AI Generation')).toBeInTheDocument();
    expect(screen.getByLabelText('API key input')).toBeInTheDocument();
  });

  test('displays AI provider selection buttons', () => {
    render(<SettingsView {...defaultProps} />);
    
    expect(screen.getByLabelText('Select OpenAI provider')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Gemini provider')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Groq provider')).toBeInTheDocument();
  });

  test('clicking provider button calls onAIConfigChange', () => {
    render(<SettingsView {...defaultProps} aiConfig={{ ...defaultAIConfig, enabled: true }} />);
    
    const geminiButton = screen.getByLabelText('Select Gemini provider');
    fireEvent.click(geminiButton);
    
    expect(mockOnAIConfigChange).toHaveBeenCalledWith({
      ...defaultAIConfig,
      enabled: true,
      provider: 'gemini'
    });
  });

  test('active provider button has active class', () => {
    render(<SettingsView {...defaultProps} aiConfig={{ ...defaultAIConfig, provider: 'gemini' }} />);
    
    const geminiButton = screen.getByLabelText('Select Gemini provider');
    expect(geminiButton).toHaveClass('active');
  });

  test('API key input is password type by default', () => {
    render(<SettingsView {...defaultProps} />);
    
    const apiKeyInput = screen.getByLabelText('API key input') as HTMLInputElement;
    expect(apiKeyInput.type).toBe('password');
  });

  test('show/hide button toggles API key visibility', async () => {
    render(<SettingsView {...defaultProps} aiConfig={{ ...defaultAIConfig, enabled: true }} />);
    
    const apiKeyInput = screen.getByLabelText('API key input') as HTMLInputElement;
    expect(apiKeyInput.type).toBe('password');
    
    const showButton = screen.getByLabelText('Show API key');
    fireEvent.click(showButton);
    
    // Wait for the state to update
    await waitFor(() => {
      const updatedInput = screen.getByLabelText('API key input') as HTMLInputElement;
      expect(updatedInput.type).toBe('text');
    });
  });

  test('typing in API key input calls onAIConfigChange', () => {
    render(<SettingsView {...defaultProps} />);
    
    const apiKeyInput = screen.getByLabelText('API key input');
    fireEvent.change(apiKeyInput, { target: { value: 'test-api-key-123' } });
    
    expect(mockOnAIConfigChange).toHaveBeenCalledWith({
      ...defaultAIConfig,
      apiKey: 'test-api-key-123'
    });
  });

  test('displays security message about API key storage', () => {
    render(<SettingsView {...defaultProps} />);
    
    expect(screen.getByText(/Your API key is stored locally in your browser and never sent to our servers/)).toBeInTheDocument();
  });

  // Requirement 8.7: Provide toggle to enable/disable AI generation
  test('displays AI generation toggle switch', () => {
    render(<SettingsView {...defaultProps} />);
    
    const toggle = screen.getByLabelText('Toggle AI generation') as HTMLInputElement;
    expect(toggle).toBeInTheDocument();
    expect(toggle.type).toBe('checkbox');
  });

  test('toggle switch reflects AI enabled state', () => {
    render(<SettingsView {...defaultProps} aiConfig={{ ...defaultAIConfig, enabled: true }} />);
    
    const toggle = screen.getByLabelText('Toggle AI generation') as HTMLInputElement;
    expect(toggle.checked).toBe(true);
  });

  test('clicking toggle calls onAIConfigChange', () => {
    render(<SettingsView {...defaultProps} />);
    
    const toggle = screen.getByLabelText('Toggle AI generation');
    fireEvent.click(toggle);
    
    expect(mockOnAIConfigChange).toHaveBeenCalledWith({
      ...defaultAIConfig,
      enabled: true
    });
  });

  test('provider buttons are disabled when AI is disabled', () => {
    render(<SettingsView {...defaultProps} aiConfig={{ ...defaultAIConfig, enabled: false }} />);
    
    const openaiButton = screen.getByLabelText('Select OpenAI provider') as HTMLButtonElement;
    const geminiButton = screen.getByLabelText('Select Gemini provider') as HTMLButtonElement;
    const groqButton = screen.getByLabelText('Select Groq provider') as HTMLButtonElement;
    
    expect(openaiButton.disabled).toBe(true);
    expect(geminiButton.disabled).toBe(true);
    expect(groqButton.disabled).toBe(true);
  });

  test('API key input is disabled when AI is disabled', () => {
    render(<SettingsView {...defaultProps} aiConfig={{ ...defaultAIConfig, enabled: false }} />);
    
    const apiKeyInput = screen.getByLabelText('API key input') as HTMLInputElement;
    expect(apiKeyInput.disabled).toBe(true);
  });

  test('displays success status when AI is enabled with API key', () => {
    render(<SettingsView {...defaultProps} aiConfig={{ ...defaultAIConfig, enabled: true, apiKey: 'test-key' }} />);
    
    expect(screen.getByText(/AI generation enabled with openai/)).toBeInTheDocument();
  });

  test('displays warning status when AI is enabled without API key', () => {
    render(<SettingsView {...defaultProps} aiConfig={{ ...defaultAIConfig, enabled: true, apiKey: '' }} />);
    
    expect(screen.getByText(/Please enter an API key to use AI generation/)).toBeInTheDocument();
  });

  test('displays info status when AI is disabled', () => {
    render(<SettingsView {...defaultProps} aiConfig={{ ...defaultAIConfig, enabled: false }} />);
    
    expect(screen.getByText(/AI generation is disabled. Using algorithmic generation./)).toBeInTheDocument();
  });

  // Requirement 14.6: Provide reset settings option
  test('displays reset settings section', () => {
    render(<SettingsView {...defaultProps} />);
    
    expect(screen.getByText('Reset Settings')).toBeInTheDocument();
    expect(screen.getByText(/Reset all settings to default values. Your saved ideas will not be affected./)).toBeInTheDocument();
  });

  test('displays reset button', () => {
    render(<SettingsView {...defaultProps} />);
    
    const resetButton = screen.getByLabelText('Reset all settings');
    expect(resetButton).toBeInTheDocument();
    expect(resetButton).toHaveTextContent('Reset All Settings');
  });

  test('clicking reset button shows confirmation dialog', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<SettingsView {...defaultProps} />);
    
    const resetButton = screen.getByLabelText('Reset all settings');
    fireEvent.click(resetButton);
    
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to reset all settings? This will not delete your saved ideas.');
    expect(mockOnReset).not.toHaveBeenCalled();
    
    confirmSpy.mockRestore();
  });

  test('confirming reset calls onReset', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<SettingsView {...defaultProps} />);
    
    const resetButton = screen.getByLabelText('Reset all settings');
    fireEvent.click(resetButton);
    
    expect(mockOnReset).toHaveBeenCalled();
    
    confirmSpy.mockRestore();
  });

  // Accessibility tests
  test('all interactive elements have proper aria labels', () => {
    render(<SettingsView {...defaultProps} />);
    
    expect(screen.getByLabelText('Select all categories')).toBeInTheDocument();
    expect(screen.getByLabelText('Clear all categories')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle AI generation')).toBeInTheDocument();
    expect(screen.getByLabelText('API key input')).toBeInTheDocument();
    expect(screen.getByLabelText('Show API key')).toBeInTheDocument();
    expect(screen.getByLabelText('Reset all settings')).toBeInTheDocument();
  });

  test('category checkboxes have proper aria labels', () => {
    render(<SettingsView {...defaultProps} />);
    
    CATEGORIES.forEach(category => {
      expect(screen.getByLabelText(`Toggle ${category} category`)).toBeInTheDocument();
    });
  });

  test('provider buttons have proper aria labels', () => {
    render(<SettingsView {...defaultProps} />);
    
    expect(screen.getByLabelText('Select OpenAI provider')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Gemini provider')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Groq provider')).toBeInTheDocument();
  });
});
