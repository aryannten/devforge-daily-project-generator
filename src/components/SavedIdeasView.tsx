/**
 * SavedIdeasView Component
 * Displays list of all saved ideas with delete and view functionality
 * Implements Requirements 5.3, 13.1, 13.2, 13.3, 13.4, 13.5
 */

import React, { useState } from 'react';
import { ProjectBriefing } from '../types';
import './SavedIdeasView.css';

export interface SavedIdeasViewProps {
  savedIdeas: ProjectBriefing[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export const SavedIdeasView: React.FC<SavedIdeasViewProps> = ({
  savedIdeas,
  onDelete,
  onView
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    onView(id);
  };

  const handleDelete = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(id);
    if (expandedId === id) {
      setExpandedId(null);
    }
  };

  // Requirement 13.5: Display empty state when no saved ideas
  if (savedIdeas.length === 0) {
    return (
      <div className="saved-ideas-view">
        <div className="saved-ideas-header">
          <h1 className="saved-ideas-title">Saved Ideas</h1>
          <div className="saved-ideas-count">0 ideas saved</div>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h2 className="empty-state-title">No Saved Ideas Yet</h2>
          <p className="empty-state-message">
            Save project ideas you like to access them later. Your saved ideas will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-ideas-view">
      {/* Requirement 13.4: Display total count of saved ideas */}
      <div className="saved-ideas-header">
        <h1 className="saved-ideas-title">Saved Ideas</h1>
        <div className="saved-ideas-count">
          {savedIdeas.length} {savedIdeas.length === 1 ? 'idea' : 'ideas'} saved
        </div>
      </div>

      {/* Requirement 13.1: Display all saved ideas in dedicated view */}
      <div className="saved-ideas-list">
        {savedIdeas.map((idea) => {
          const isExpanded = expandedId === idea.id;
          
          return (
            <div 
              key={idea.id} 
              className={`saved-idea-card ${isExpanded ? 'expanded' : ''}`}
            >
              {/* Card Header - Always Visible */}
              <div 
                className="saved-idea-header"
                onClick={() => toggleExpand(idea.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleExpand(idea.id);
                  }
                }}
                aria-expanded={isExpanded}
                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${idea.title}`}
              >
                <div className="saved-idea-header-content">
                  <h2 className="saved-idea-title">{idea.title}</h2>
                  <div className="saved-idea-meta">
                    <span className="meta-badge">{idea.category}</span>
                    <span className="meta-separator">•</span>
                    <span className="meta-badge">{idea.difficultyLevel}</span>
                    <span className="meta-separator">•</span>
                    <span className="meta-badge">{idea.estimatedTime}</span>
                  </div>
                </div>
                <div className="saved-idea-actions">
                  {/* Requirement 13.2: Delete functionality for each idea */}
                  <button
                    className="action-button delete-button"
                    onClick={(e) => handleDelete(idea.id, e)}
                    aria-label={`Delete ${idea.title}`}
                    title="Delete idea"
                  >
                    <span className="button-icon">🗑️</span>
                    <span className="button-text">Delete</span>
                  </button>
                  <button
                    className="action-button expand-button"
                    aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                      ▼
                    </span>
                  </button>
                </div>
              </div>

              {/* Card Details - Shown when expanded */}
              {isExpanded && (
                <div className="saved-idea-details">
                  {/* Description */}
                  <section className="detail-section">
                    <h3 className="detail-title">Description</h3>
                    <p className="detail-content">{idea.description}</p>
                  </section>

                  {/* Target Audience */}
                  <section className="detail-section">
                    <h3 className="detail-title">Target Audience</h3>
                    <p className="detail-content">{idea.targetAudience}</p>
                  </section>

                  {/* Core Features */}
                  <section className="detail-section">
                    <h3 className="detail-title">Core Features</h3>
                    <ul className="detail-list">
                      {idea.coreFeatures.map((feature, index) => (
                        <li key={index} className="detail-list-item feature-item">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Technical Requirements */}
                  <section className="detail-section">
                    <h3 className="detail-title">Technical Requirements</h3>
                    <div className="tech-tags">
                      {idea.technicalRequirements.map((tech, index) => (
                        <span key={index} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </section>

                  {/* Learning Outcomes */}
                  <section className="detail-section">
                    <h3 className="detail-title">Learning Outcomes</h3>
                    <ul className="detail-list">
                      {idea.learningOutcomes.map((outcome, index) => (
                        <li key={index} className="detail-list-item outcome-item">
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Potential Extensions */}
                  <section className="detail-section">
                    <h3 className="detail-title">Potential Extensions</h3>
                    <ul className="detail-list">
                      {idea.potentialExtensions.map((extension, index) => (
                        <li key={index} className="detail-list-item extension-item">
                          {extension}
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Similar Projects */}
                  <section className="detail-section">
                    <h3 className="detail-title">Similar Projects</h3>
                    <ul className="detail-list">
                      {idea.similarProjects.map((project, index) => (
                        <li key={index} className="detail-list-item similar-item">
                          {project}
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Generation Info */}
                  <div className="generation-info">
                    <span className="info-label">Generated by:</span>
                    <span className="info-value">
                      {idea.generationType === 'ai' ? 'AI' : 'Algorithm'}
                    </span>
                    <span className="info-separator">•</span>
                    <span className="info-label">Saved:</span>
                    <span className="info-value">
                      {new Date(idea.generatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
