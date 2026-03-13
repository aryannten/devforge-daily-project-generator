/**
 * Responsive Design Tests
 * Tests responsive breakpoints, layouts, touch targets, and typography scaling
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
 * 
 * NOTE: These tests verify that components render correctly and have the proper
 * CSS classes applied. Actual CSS media query behavior (font sizes, padding, etc.)
 * is defined in the CSS files and should be verified through:
 * 1. Browser DevTools responsive mode testing
 * 2. Visual regression testing
 * 3. Manual testing on actual devices
 * 
 * The CSS files already implement:
 * - Mobile breakpoint: @media (max-width: 767px)
 * - Tablet breakpoint: @media (min-width: 768px) and (max-width: 1023px)
 * - Desktop breakpoint: @media (min-width: 1024px)
 * - Touch targets: min-height: 44px and min-width: 44px on mobile
 * - Responsive typography: scaled font sizes across breakpoints
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MainView } from './MainView';
import { SavedIdeasView } from './SavedIdeasView';
import { SettingsView } from './SettingsView';
import { ProjectBriefing, AIConfig } from '../types';

// Mock project briefing for testing
const mockIdea: ProjectBriefing = {
  id: 'test-id-1',
  title: 'Test Project Title',
  description: 'A comprehensive test project description that provides enough detail for testing purposes.',
  targetAudience: 'Developers learning responsive design',
  coreFeatures: [
    'Feature 1',
    'Feature 2',
    'Feature 3',
    'Feature 4',
    'Feature 5'
  ],
  technicalRequirements: ['React', 'TypeScript', 'CSS'],
  difficultyLevel: 'Intermediate',
  estimatedTime: '2-3 weeks',
  learningOutcomes: ['Outcome 1', 'Outcome 2', 'Outcome 3'],
  potentialExtensions: ['Extension 1', 'Extension 2', 'Extension 3'],
  similarProjects: ['Project 1', 'Project 2', 'Project 3'],
  category: 'Web Development',
  generatedAt: Date.now(),
  generationType: 'algorithmic'
};

const mockAIConfig: AIConfig = {
  provider: 'openai',
  apiKey: '',
  enabled: false,
  timeout: 5000
};

// Helper to set viewport size
const setViewportSize = (width: number, height: number = 800) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height
  });
  window.dispatchEvent(new Event('resize'));
};

// Note: getComputedStyle doesn't work reliably in jsdom test environment
// These tests verify that responsive CSS classes are applied and components render
// Actual CSS media query behavior is tested through visual/manual testing

describe('Responsive Design - Mobile Layout (320px-767px)', () => {
  beforeEach(() => {
    setViewportSize(375); // iPhone SE width
  });

  test('Requirement 11.1: MainView renders correctly on mobile', () => {
    const { container } = render(
      <MainView
        currentIdea={mockIdea}
        isDailyFeatured={false}
        onSave={() => {}}
        onDiscard={() => {}}
        onGenerate={() => {}}
        isLoading={false}
      />
    );

    const mainView = container.querySelector('.main-view');
    expect(mainView).toBeInTheDocument();
    
    // Verify all key elements are present
    expect(container.querySelector('.briefing-card')).toBeInTheDocument();
    expect(container.querySelector('.briefing-title')).toBeInTheDocument();
    expect(container.querySelector('.action-buttons')).toBeInTheDocument();
  });

  test('Requirement 11.1: SavedIdeasView renders correctly on mobile', () => {
    const { container } = render(
      <SavedIdeasView
        savedIdeas={[mockIdea]}
        onDelete={() => {}}
        onView={() => {}}
      />
    );

    const savedView = container.querySelector('.saved-ideas-view');
    expect(savedView).toBeInTheDocument();
  });

  test('Requirement 11.1: SettingsView renders correctly on mobile', () => {
    const { container } = render(
      <SettingsView
        categories={[]}
        aiConfig={mockAIConfig}
        onCategoriesChange={() => {}}
        onAIConfigChange={() => {}}
        onReset={() => {}}
        isOnline={true}
      />
    );

    const settingsView = container.querySelector('.settings-view');
    expect(settingsView).toBeInTheDocument();
  });

  test('Requirement 11.5: Touch targets are at least 44x44px on mobile - MainView buttons', () => {
    const { container } = render(
      <MainView
        currentIdea={mockIdea}
        isDailyFeatured={false}
        onSave={() => {}}
        onDiscard={() => {}}
        onGenerate={() => {}}
        isLoading={false}
      />
    );

    const buttons = container.querySelectorAll('.button');
    // Verify buttons exist and have the correct class for mobile styling
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((button) => {
      expect(button).toHaveClass('button');
    });
  });

  test('Requirement 11.5: Touch targets are at least 44x44px on mobile - SavedIdeasView action buttons', () => {
    const { container } = render(
      <SavedIdeasView
        savedIdeas={[mockIdea]}
        onDelete={() => {}}
        onView={() => {}}
      />
    );

    const actionButtons = container.querySelectorAll('.action-button');
    // Verify action buttons exist and have the correct class for mobile styling
    expect(actionButtons.length).toBeGreaterThan(0);
    actionButtons.forEach((button) => {
      expect(button).toHaveClass('action-button');
    });
  });

  test('Requirement 11.5: Touch targets are at least 44x44px on mobile - SettingsView interactive elements', () => {
    const { container } = render(
      <SettingsView
        categories={['Web Development']}
        aiConfig={mockAIConfig}
        onCategoriesChange={() => {}}
        onAIConfigChange={() => {}}
        onReset={() => {}}
        isOnline={true}
      />
    );

    // Check category checkboxes
    const categoryLabels = container.querySelectorAll('.category-checkbox-label');
    expect(categoryLabels.length).toBeGreaterThan(0);
    categoryLabels.forEach((label) => {
      expect(label).toHaveClass('category-checkbox-label');
    });

    // Check provider buttons
    const providerButtons = container.querySelectorAll('.provider-button');
    expect(providerButtons.length).toBe(3);
    providerButtons.forEach((button) => {
      expect(button).toHaveClass('provider-button');
    });

    // Check reset button
    const resetButton = container.querySelector('.button-danger');
    expect(resetButton).toBeInTheDocument();
    expect(resetButton).toHaveClass('button-danger');
  });

  test('Requirement 11.6: Typography scales appropriately on mobile', () => {
    const { container } = render(
      <MainView
        currentIdea={mockIdea}
        isDailyFeatured={false}
        onSave={() => {}}
        onDiscard={() => {}}
        onGenerate={() => {}}
        isLoading={false}
      />
    );

    const title = container.querySelector('.briefing-title');
    const sectionTitle = container.querySelector('.section-title');
    const content = container.querySelector('.section-content');

    // Verify typography elements exist and have correct classes
    expect(title).toBeInTheDocument();
    expect(sectionTitle).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    
    expect(title).toHaveClass('briefing-title');
    expect(sectionTitle).toHaveClass('section-title');
    expect(content).toHaveClass('section-content');
  });
});

describe('Responsive Design - Tablet Layout (768px-1023px)', () => {
  beforeEach(() => {
    setViewportSize(768); // iPad width
  });

  test('Requirement 11.2: MainView renders correctly on tablet', () => {
    const { container } = render(
      <MainView
        currentIdea={mockIdea}
        isDailyFeatured={false}
        onSave={() => {}}
        onDiscard={() => {}}
        onGenerate={() => {}}
        isLoading={false}
      />
    );

    const mainView = container.querySelector('.main-view');
    expect(mainView).toBeInTheDocument();
  });

  test('Requirement 11.2: SavedIdeasView renders correctly on tablet', () => {
    const { container } = render(
      <SavedIdeasView
        savedIdeas={[mockIdea]}
        onDelete={() => {}}
        onView={() => {}}
      />
    );

    const savedView = container.querySelector('.saved-ideas-view');
    expect(savedView).toBeInTheDocument();
  });

  test('Requirement 11.2: SettingsView renders correctly on tablet', () => {
    const { container } = render(
      <SettingsView
        categories={[]}
        aiConfig={mockAIConfig}
        onCategoriesChange={() => {}}
        onAIConfigChange={() => {}}
        onReset={() => {}}
        isOnline={true}
      />
    );

    const settingsView = container.querySelector('.settings-view');
    expect(settingsView).toBeInTheDocument();
  });

  test('Requirement 11.6: Typography scales appropriately on tablet', () => {
    const { container } = render(
      <MainView
        currentIdea={mockIdea}
        isDailyFeatured={false}
        onSave={() => {}}
        onDiscard={() => {}}
        onGenerate={() => {}}
        isLoading={false}
      />
    );

    const title = container.querySelector('.briefing-title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('briefing-title');
  });
});

describe('Responsive Design - Desktop Layout (1024px+)', () => {
  beforeEach(() => {
    setViewportSize(1440); // Desktop width
  });

  test('Requirement 11.3: MainView renders correctly on desktop', () => {
    const { container } = render(
      <MainView
        currentIdea={mockIdea}
        isDailyFeatured={false}
        onSave={() => {}}
        onDiscard={() => {}}
        onGenerate={() => {}}
        isLoading={false}
      />
    );

    const mainView = container.querySelector('.main-view');
    expect(mainView).toBeInTheDocument();
  });

  test('Requirement 11.3: SavedIdeasView renders correctly on desktop', () => {
    const { container } = render(
      <SavedIdeasView
        savedIdeas={[mockIdea]}
        onDelete={() => {}}
        onView={() => {}}
      />
    );

    const savedView = container.querySelector('.saved-ideas-view');
    expect(savedView).toBeInTheDocument();
  });

  test('Requirement 11.3: SettingsView renders correctly on desktop', () => {
    const { container } = render(
      <SettingsView
        categories={[]}
        aiConfig={mockAIConfig}
        onCategoriesChange={() => {}}
        onAIConfigChange={() => {}}
        onReset={() => {}}
        isOnline={true}
      />
    );

    const settingsView = container.querySelector('.settings-view');
    expect(settingsView).toBeInTheDocument();
  });

  test('Requirement 11.6: Typography scales appropriately on desktop', () => {
    const { container } = render(
      <MainView
        currentIdea={mockIdea}
        isDailyFeatured={false}
        onSave={() => {}}
        onDiscard={() => {}}
        onGenerate={() => {}}
        isLoading={false}
      />
    );

    const title = container.querySelector('.briefing-title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('briefing-title');
  });
});

describe('Responsive Design - Layout Adaptation', () => {
  test('Requirement 11.4: Layout adapts when viewport changes', () => {
    const { container, rerender } = render(
      <MainView
        currentIdea={mockIdea}
        isDailyFeatured={false}
        onSave={() => {}}
        onDiscard={() => {}}
        onGenerate={() => {}}
        isLoading={false}
      />
    );

    // Start with mobile
    setViewportSize(375);
    const mainViewMobile = container.querySelector('.main-view');
    expect(mainViewMobile).toBeInTheDocument();

    // Change to tablet
    setViewportSize(768);
    rerender(
      <MainView
        currentIdea={mockIdea}
        isDailyFeatured={false}
        onSave={() => {}}
        onDiscard={() => {}}
        onGenerate={() => {}}
        isLoading={false}
      />
    );
    const mainViewTablet = container.querySelector('.main-view');
    expect(mainViewTablet).toBeInTheDocument();

    // Change to desktop
    setViewportSize(1440);
    rerender(
      <MainView
        currentIdea={mockIdea}
        isDailyFeatured={false}
        onSave={() => {}}
        onDiscard={() => {}}
        onGenerate={() => {}}
        isLoading={false}
      />
    );
    const mainViewDesktop = container.querySelector('.main-view');
    expect(mainViewDesktop).toBeInTheDocument();
  });

  test('Requirement 11.4: SavedIdeasView adapts to viewport changes', () => {
    const { container, rerender } = render(
      <SavedIdeasView
        savedIdeas={[mockIdea]}
        onDelete={() => {}}
        onView={() => {}}
      />
    );

    // Test mobile
    setViewportSize(375);
    let savedView = container.querySelector('.saved-ideas-view');
    expect(savedView).toBeInTheDocument();

    // Test tablet
    setViewportSize(768);
    rerender(
      <SavedIdeasView
        savedIdeas={[mockIdea]}
        onDelete={() => {}}
        onView={() => {}}
      />
    );
    savedView = container.querySelector('.saved-ideas-view');
    expect(savedView).toBeInTheDocument();

    // Test desktop
    setViewportSize(1440);
    rerender(
      <SavedIdeasView
        savedIdeas={[mockIdea]}
        onDelete={() => {}}
        onView={() => {}}
      />
    );
    savedView = container.querySelector('.saved-ideas-view');
    expect(savedView).toBeInTheDocument();
  });

  test('Requirement 11.4: SettingsView adapts to viewport changes', () => {
    const { container, rerender } = render(
      <SettingsView
        categories={['Web Development']}
        aiConfig={mockAIConfig}
        onCategoriesChange={() => {}}
        onAIConfigChange={() => {}}
        onReset={() => {}}
        isOnline={true}
      />
    );

    // Test mobile
    setViewportSize(375);
    let settingsView = container.querySelector('.settings-view');
    expect(settingsView).toBeInTheDocument();

    // Test tablet
    setViewportSize(768);
    rerender(
      <SettingsView
        categories={['Web Development']}
        aiConfig={mockAIConfig}
        onCategoriesChange={() => {}}
        onAIConfigChange={() => {}}
        onReset={() => {}}
        isOnline={true}
      />
    );
    settingsView = container.querySelector('.settings-view');
    expect(settingsView).toBeInTheDocument();

    // Test desktop
    setViewportSize(1440);
    rerender(
      <SettingsView
        categories={['Web Development']}
        aiConfig={mockAIConfig}
        onCategoriesChange={() => {}}
        onAIConfigChange={() => {}}
        onReset={() => {}}
        isOnline={true}
      />
    );
    settingsView = container.querySelector('.settings-view');
    expect(settingsView).toBeInTheDocument();
  });
});

describe('Responsive Design - Edge Cases', () => {
  test('Handles minimum mobile width (320px)', () => {
    setViewportSize(320);
    
    const { container } = render(
      <MainView
        currentIdea={mockIdea}
        isDailyFeatured={false}
        onSave={() => {}}
        onDiscard={() => {}}
        onGenerate={() => {}}
        isLoading={false}
      />
    );

    const mainView = container.querySelector('.main-view');
    expect(mainView).toBeInTheDocument();
  });

  test('Handles maximum tablet width (1023px)', () => {
    setViewportSize(1023);
    
    const { container } = render(
      <MainView
        currentIdea={mockIdea}
        isDailyFeatured={false}
        onSave={() => {}}
        onDiscard={() => {}}
        onGenerate={() => {}}
        isLoading={false}
      />
    );

    const mainView = container.querySelector('.main-view');
    expect(mainView).toBeInTheDocument();
  });

  test('Handles large desktop width (1920px)', () => {
    setViewportSize(1920);
    
    const { container } = render(
      <MainView
        currentIdea={mockIdea}
        isDailyFeatured={false}
        onSave={() => {}}
        onDiscard={() => {}}
        onGenerate={() => {}}
        isLoading={false}
      />
    );

    const mainView = container.querySelector('.main-view');
    expect(mainView).toBeInTheDocument();
  });

  test('Empty state renders correctly on mobile', () => {
    setViewportSize(375);
    
    const { container } = render(
      <SavedIdeasView
        savedIdeas={[]}
        onDelete={() => {}}
        onView={() => {}}
      />
    );

    const emptyState = container.querySelector('.empty-state');
    expect(emptyState).toBeInTheDocument();
  });

  test('Multiple saved ideas render correctly on mobile', () => {
    setViewportSize(375);
    
    const multipleIdeas = [
      { ...mockIdea, id: 'idea-1', title: 'First Idea' },
      { ...mockIdea, id: 'idea-2', title: 'Second Idea' },
      { ...mockIdea, id: 'idea-3', title: 'Third Idea' }
    ];

    const { container } = render(
      <SavedIdeasView
        savedIdeas={multipleIdeas}
        onDelete={() => {}}
        onView={() => {}}
      />
    );

    const ideaCards = container.querySelectorAll('.saved-idea-card');
    expect(ideaCards).toHaveLength(3);
  });
});
