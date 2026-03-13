/**
 * SavedIdeasView Component Tests
 * Tests Requirements 5.3, 13.1, 13.2, 13.3, 13.4, 13.5
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SavedIdeasView } from './SavedIdeasView';
import { ProjectBriefing } from '../types';

// Mock project briefing for testing
const createMockIdea = (overrides?: Partial<ProjectBriefing>): ProjectBriefing => ({
  id: 'test-id-1',
  title: 'Test Project',
  description: 'A test project description that is long enough to meet requirements',
  targetAudience: 'Developers learning testing',
  coreFeatures: [
    'Feature 1',
    'Feature 2',
    'Feature 3',
    'Feature 4',
    'Feature 5'
  ],
  technicalRequirements: ['React', 'TypeScript', 'Vitest'],
  difficultyLevel: 'Intermediate',
  estimatedTime: '2-3 weeks',
  learningOutcomes: [
    'Learn testing',
    'Learn React',
    'Learn TypeScript'
  ],
  potentialExtensions: [
    'Add more features',
    'Improve performance',
    'Add documentation'
  ],
  similarProjects: [
    'Project A',
    'Project B',
    'Project C'
  ],
  category: 'Web Development',
  generatedAt: Date.now(),
  generationType: 'algorithmic',
  ...overrides
});

describe('SavedIdeasView', () => {
  describe('Empty State', () => {
    it('should display empty state when no saved ideas', () => {
      // Requirement 13.5: Display empty state when no saved ideas
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={[]} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      expect(screen.getByText('Saved Ideas')).toBeInTheDocument();
      expect(screen.getByText('0 ideas saved')).toBeInTheDocument();
      expect(screen.getByText('No Saved Ideas Yet')).toBeInTheDocument();
      expect(screen.getByText(/Save project ideas you like/)).toBeInTheDocument();
    });

    it('should display empty state icon', () => {
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={[]} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      const emptyIcon = screen.getByText('📋');
      expect(emptyIcon).toBeInTheDocument();
    });
  });

  describe('Saved Ideas List', () => {
    it('should display all saved ideas', () => {
      // Requirement 13.1: Display all saved ideas in dedicated view
      const ideas = [
        createMockIdea({ id: '1', title: 'Project 1' }),
        createMockIdea({ id: '2', title: 'Project 2' }),
        createMockIdea({ id: '3', title: 'Project 3' })
      ];
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={ideas} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
      expect(screen.getByText('Project 3')).toBeInTheDocument();
    });

    it('should display idea count correctly', () => {
      // Requirement 13.4: Display total count of saved ideas
      const ideas = [
        createMockIdea({ id: '1' }),
        createMockIdea({ id: '2' })
      ];
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={ideas} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      expect(screen.getByText('2 ideas saved')).toBeInTheDocument();
    });

    it('should display singular "idea" for single saved idea', () => {
      const ideas = [createMockIdea()];
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={ideas} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      expect(screen.getByText('1 idea saved')).toBeInTheDocument();
    });

    it('should display idea metadata', () => {
      const idea = createMockIdea({
        category: 'Web Development',
        difficultyLevel: 'Advanced',
        estimatedTime: '1 month'
      });
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={[idea]} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      expect(screen.getByText('Web Development')).toBeInTheDocument();
      expect(screen.getByText('Advanced')).toBeInTheDocument();
      expect(screen.getByText('1 month')).toBeInTheDocument();
    });
  });

  describe('Delete Functionality', () => {
    it('should call onDelete when delete button is clicked', () => {
      // Requirement 13.2: Implement delete functionality for each idea
      const idea = createMockIdea({ id: 'delete-test' });
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={[idea]} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      const deleteButton = screen.getByLabelText('Delete Test Project');
      fireEvent.click(deleteButton);

      expect(onDelete).toHaveBeenCalledWith('delete-test');
      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('should not expand card when delete button is clicked', () => {
      const idea = createMockIdea();
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={[idea]} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      const deleteButton = screen.getByLabelText('Delete Test Project');
      fireEvent.click(deleteButton);

      // Details should not be visible
      expect(screen.queryByText('Description')).not.toBeInTheDocument();
      expect(onView).not.toHaveBeenCalled();
    });

    it('should display delete button for each idea', () => {
      const ideas = [
        createMockIdea({ id: '1', title: 'Project 1' }),
        createMockIdea({ id: '2', title: 'Project 2' })
      ];
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={ideas} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      expect(screen.getByLabelText('Delete Project 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete Project 2')).toBeInTheDocument();
    });
  });

  describe('View/Expand Functionality', () => {
    it('should expand idea details when header is clicked', () => {
      // Requirement 13.3: Add view/expand functionality for idea details
      const idea = createMockIdea();
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={[idea]} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      const header = screen.getByRole('button', { name: /Expand Test Project/ });
      fireEvent.click(header);

      // Details should be visible
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Target Audience')).toBeInTheDocument();
      expect(screen.getByText('Core Features')).toBeInTheDocument();
      expect(onView).toHaveBeenCalledWith('test-id-1');
    });

    it('should collapse idea details when header is clicked again', () => {
      const idea = createMockIdea();
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={[idea]} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      const header = screen.getByRole('button', { name: /Expand Test Project/ });
      
      // Expand
      fireEvent.click(header);
      expect(screen.getByText('Description')).toBeInTheDocument();

      // Collapse
      fireEvent.click(header);
      expect(screen.queryByText('Description')).not.toBeInTheDocument();
    });

    it('should display all idea sections when expanded', () => {
      const idea = createMockIdea();
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={[idea]} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      const header = screen.getByRole('button', { name: /Expand Test Project/ });
      fireEvent.click(header);

      // Check all sections are displayed
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Target Audience')).toBeInTheDocument();
      expect(screen.getByText('Core Features')).toBeInTheDocument();
      expect(screen.getByText('Technical Requirements')).toBeInTheDocument();
      expect(screen.getByText('Learning Outcomes')).toBeInTheDocument();
      expect(screen.getByText('Potential Extensions')).toBeInTheDocument();
      expect(screen.getByText('Similar Projects')).toBeInTheDocument();
    });

    it('should display idea content when expanded', () => {
      const idea = createMockIdea({
        description: 'Custom description for testing',
        targetAudience: 'Custom target audience'
      });
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={[idea]} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      const header = screen.getByRole('button', { name: /Expand Test Project/ });
      fireEvent.click(header);

      expect(screen.getByText('Custom description for testing')).toBeInTheDocument();
      expect(screen.getByText('Custom target audience')).toBeInTheDocument();
    });

    it('should display core features list when expanded', () => {
      const idea = createMockIdea({
        coreFeatures: ['Feature A', 'Feature B', 'Feature C', 'Feature D', 'Feature E']
      });
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={[idea]} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      const header = screen.getByRole('button', { name: /Expand Test Project/ });
      fireEvent.click(header);

      expect(screen.getByText('Feature A')).toBeInTheDocument();
      expect(screen.getByText('Feature B')).toBeInTheDocument();
      expect(screen.getByText('Feature C')).toBeInTheDocument();
      expect(screen.getByText('Feature D')).toBeInTheDocument();
      expect(screen.getByText('Feature E')).toBeInTheDocument();
    });

    it('should display technical requirements when expanded', () => {
      const idea = createMockIdea({
        technicalRequirements: ['Node.js', 'Express', 'MongoDB']
      });
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={[idea]} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      const header = screen.getByRole('button', { name: /Expand Test Project/ });
      fireEvent.click(header);

      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('Express')).toBeInTheDocument();
      expect(screen.getByText('MongoDB')).toBeInTheDocument();
    });

    it('should display generation type when expanded', () => {
      const algorithmicIdea = createMockIdea({ 
        id: 'algo-test',
        title: 'Algorithmic Project',
        generationType: 'algorithmic' 
      });
      const aiIdea = createMockIdea({ 
        id: 'ai-test', 
        title: 'AI Project',
        generationType: 'ai' 
      });
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={[algorithmicIdea, aiIdea]} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      // Test algorithmic generation type
      const header1 = screen.getByRole('button', { name: /Expand Algorithmic Project/ });
      fireEvent.click(header1);
      expect(screen.getByText('Algorithm')).toBeInTheDocument();

      // Test AI generation type - collapse first one
      fireEvent.click(header1);
      
      const header2 = screen.getByRole('button', { name: /Expand AI Project/ });
      fireEvent.click(header2);
      expect(screen.getByText('AI')).toBeInTheDocument();
    });

    it('should support keyboard navigation for expand', () => {
      const idea = createMockIdea();
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={[idea]} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      const header = screen.getByRole('button', { name: /Expand Test Project/ });
      
      // Test Enter key
      fireEvent.keyDown(header, { key: 'Enter' });
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(onView).toHaveBeenCalledWith('test-id-1');

      // Test Space key
      fireEvent.keyDown(header, { key: ' ' });
      expect(screen.queryByText('Description')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for expand buttons', () => {
      const idea = createMockIdea({ title: 'Accessible Project' });
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={[idea]} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      const expandButton = screen.getByRole('button', { name: /Expand Accessible Project/ });
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(expandButton);
      expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have proper ARIA labels for delete buttons', () => {
      const idea = createMockIdea({ title: 'Deletable Project' });
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={[idea]} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      const deleteButton = screen.getByLabelText('Delete Deletable Project');
      expect(deleteButton).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      const idea = createMockIdea();
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={[idea]} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      const header = screen.getByRole('button', { name: /Expand Test Project/ });
      expect(header).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Multiple Ideas', () => {
    it('should only expand one idea at a time', () => {
      const ideas = [
        createMockIdea({ id: '1', title: 'Project 1' }),
        createMockIdea({ id: '2', title: 'Project 2' })
      ];
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={ideas} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      const header1 = screen.getByRole('button', { name: /Expand Project 1/ });
      const header2 = screen.getByRole('button', { name: /Expand Project 2/ });

      // Expand first idea
      fireEvent.click(header1);
      expect(screen.getAllByText('Description')).toHaveLength(1);

      // Expand second idea - first should collapse
      fireEvent.click(header2);
      expect(screen.getAllByText('Description')).toHaveLength(1);
    });

    it('should collapse expanded idea when deleted', () => {
      const ideas = [
        createMockIdea({ id: '1', title: 'Project 1' }),
        createMockIdea({ id: '2', title: 'Project 2' })
      ];
      const onDelete = vi.fn();
      const onView = vi.fn();

      render(
        <SavedIdeasView 
          savedIdeas={ideas} 
          onDelete={onDelete} 
          onView={onView} 
        />
      );

      const header1 = screen.getByRole('button', { name: /Expand Project 1/ });
      fireEvent.click(header1);

      const deleteButton = screen.getByLabelText('Delete Project 1');
      fireEvent.click(deleteButton);

      expect(onDelete).toHaveBeenCalledWith('1');
    });
  });
});
