/**
 * AI Generator - Generates project ideas using external AI APIs
 * Supports OpenAI, Gemini, and Groq providers
 * Requirements: 8.3, 8.4, 8.5, 9.3, 9.4
 */

import { ProjectBriefing, AIConfig, Result } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Error types for AI generation
 */
export type AIGenerationError =
  | { type: 'invalid_key'; message: string }
  | { type: 'rate_limit'; message: string }
  | { type: 'network_error'; message: string }
  | { type: 'timeout'; message: string }
  | { type: 'parse_error'; message: string }
  | { type: 'validation_error'; message: string };

/**
 * AI API endpoints
 */
const API_ENDPOINTS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  groq: 'https://api.groq.com/openai/v1/chat/completions'
} as const;

/**
 * AIGenerator class - Handles AI-powered project idea generation
 */
export class AIGenerator {
  /**
   * Generate a project idea using AI
   * @param provider - AI provider (openai, gemini, or groq)
   * @param apiKey - API key for the provider
   * @param categories - Selected categories for filtering (empty = all categories)
   * @param signal - AbortSignal for timeout control
   * @returns Result with ProjectBriefing or AIGenerationError
   */
  async generateIdea(
    provider: AIConfig['provider'],
    apiKey: string,
    categories: string[],
    signal: AbortSignal
  ): Promise<Result<ProjectBriefing, AIGenerationError>> {
    try {
      // Format the prompt
      const prompt = this.formatPrompt(categories);

      // Make API request based on provider
      const response = await this.makeAPIRequest(provider, apiKey, prompt, signal);

      // Parse the response
      const parsedIdea = this.parseResponse(provider, response);

      // Validate the parsed idea
      const validationResult = this.validateIdea(parsedIdea);
      if (!validationResult.ok) {
        return validationResult;
      }

      // Add metadata
      const idea: ProjectBriefing = {
        ...parsedIdea,
        id: uuidv4(),
        generatedAt: Date.now(),
        generationType: 'ai'
      };

      return { ok: true, value: idea };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Format the AI prompt with category preferences
   */
  private formatPrompt(categories: string[]): string {
    const categoryFilter = categories.length > 0
      ? `\n\nFocus on these categories: ${categories.join(', ')}`
      : '';

    return `Generate a unique developer project idea with the following structure:

1. Project Title: [creative, specific title]
2. Description: [2-3 sentences explaining the project]
3. Target Audience: [who would use this]
4. Core Features: [5-7 key features as bullet points]
5. Technical Requirements: [technologies, languages, frameworks]
6. Difficulty Level: [Beginner/Intermediate/Advanced]
7. Estimated Time: [realistic time estimate]
8. Learning Outcomes: [3-5 skills developers will gain]
9. Potential Extensions: [3-5 ways to expand the project]
10. Similar Projects: [3-5 related projects for reference]${categoryFilter}

Provide the response in JSON format with the following structure:
{
  "title": "string",
  "description": "string",
  "targetAudience": "string",
  "coreFeatures": ["string"],
  "technicalRequirements": ["string"],
  "difficultyLevel": "Beginner|Intermediate|Advanced",
  "estimatedTime": "string",
  "learningOutcomes": ["string"],
  "potentialExtensions": ["string"],
  "similarProjects": ["string"],
  "category": "string"
}`;
  }

  /**
   * Make API request to the specified provider
   */
  private async makeAPIRequest(
    provider: AIConfig['provider'],
    apiKey: string,
    prompt: string,
    signal: AbortSignal
  ): Promise<any> {
    const endpoint = API_ENDPOINTS[provider];

    if (provider === 'gemini') {
      return this.makeGeminiRequest(endpoint, apiKey, prompt, signal);
    } else {
      // OpenAI and Groq use the same format
      return this.makeOpenAIFormatRequest(endpoint, apiKey, prompt, signal);
    }
  }

  /**
   * Make request to OpenAI or Groq (same format)
   */
  private async makeOpenAIFormatRequest(
    endpoint: string,
    apiKey: string,
    prompt: string,
    signal: AbortSignal
  ): Promise<any> {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: endpoint.includes('groq') ? 'mixtral-8x7b-32768' : 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8
      }),
      signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(JSON.stringify({ status: response.status, data: errorData }));
    }

    return response.json();
  }

  /**
   * Make request to Gemini
   */
  private async makeGeminiRequest(
    endpoint: string,
    apiKey: string,
    prompt: string,
    signal: AbortSignal
  ): Promise<any> {
    const url = `${endpoint}?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
      signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(JSON.stringify({ status: response.status, data: errorData }));
    }

    return response.json();
  }

  /**
   * Parse AI response into ProjectBriefing structure
   */
  private parseResponse(provider: AIConfig['provider'], response: any): Omit<ProjectBriefing, 'id' | 'generatedAt' | 'generationType'> {
    let content: string;

    if (provider === 'gemini') {
      // Gemini response format
      content = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      // OpenAI/Groq response format
      content = response.choices?.[0]?.message?.content || '';
    }

    // Extract JSON from the content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Normalize difficulty level
    const difficultyLevel = this.normalizeDifficultyLevel(parsed.difficultyLevel);

    return {
      title: parsed.title || '',
      description: parsed.description || '',
      targetAudience: parsed.targetAudience || '',
      coreFeatures: Array.isArray(parsed.coreFeatures) ? parsed.coreFeatures : [],
      technicalRequirements: Array.isArray(parsed.technicalRequirements) ? parsed.technicalRequirements : [],
      difficultyLevel,
      estimatedTime: parsed.estimatedTime || '',
      learningOutcomes: Array.isArray(parsed.learningOutcomes) ? parsed.learningOutcomes : [],
      potentialExtensions: Array.isArray(parsed.potentialExtensions) ? parsed.potentialExtensions : [],
      similarProjects: Array.isArray(parsed.similarProjects) ? parsed.similarProjects : [],
      category: parsed.category || ''
    };
  }

  /**
   * Normalize difficulty level to enum values
   */
  private normalizeDifficultyLevel(level: string): 'Beginner' | 'Intermediate' | 'Advanced' {
    const normalized = level.toLowerCase();
    if (normalized.includes('beginner')) return 'Beginner';
    if (normalized.includes('intermediate')) return 'Intermediate';
    if (normalized.includes('advanced')) return 'Advanced';
    return 'Intermediate'; // Default
  }

  /**
   * Validate the parsed idea structure
   */
  private validateIdea(idea: Omit<ProjectBriefing, 'id' | 'generatedAt' | 'generationType'>): Result<void, AIGenerationError> {
    const errors: string[] = [];

    if (!idea.title || idea.title.length < 5) {
      errors.push('Title must be at least 5 characters');
    }

    if (!idea.description || idea.description.length < 50) {
      errors.push('Description must be at least 50 characters');
    }

    if (!idea.targetAudience) {
      errors.push('Target audience is required');
    }

    if (!Array.isArray(idea.coreFeatures) || idea.coreFeatures.length < 5 || idea.coreFeatures.length > 7) {
      errors.push('Core features must contain 5-7 items');
    }

    if (!Array.isArray(idea.technicalRequirements) || idea.technicalRequirements.length < 2) {
      errors.push('Technical requirements must contain at least 2 items');
    }

    if (!['Beginner', 'Intermediate', 'Advanced'].includes(idea.difficultyLevel)) {
      errors.push('Invalid difficulty level');
    }

    if (!idea.estimatedTime) {
      errors.push('Estimated time is required');
    }

    if (!Array.isArray(idea.learningOutcomes) || idea.learningOutcomes.length < 3 || idea.learningOutcomes.length > 5) {
      errors.push('Learning outcomes must contain 3-5 items');
    }

    if (!Array.isArray(idea.potentialExtensions) || idea.potentialExtensions.length < 3 || idea.potentialExtensions.length > 5) {
      errors.push('Potential extensions must contain 3-5 items');
    }

    if (!Array.isArray(idea.similarProjects) || idea.similarProjects.length < 3 || idea.similarProjects.length > 5) {
      errors.push('Similar projects must contain 3-5 items');
    }

    if (!idea.category) {
      errors.push('Category is required');
    }

    if (errors.length > 0) {
      return {
        ok: false,
        error: {
          type: 'validation_error',
          message: errors.join('; ')
        }
      };
    }

    return { ok: true, value: undefined };
  }

  /**
   * Handle errors and convert to AIGenerationError
   */
  private handleError(error: any): Result<ProjectBriefing, AIGenerationError> {
    // Timeout error
    if (error.name === 'AbortError') {
      return {
        ok: false,
        error: {
          type: 'timeout',
          message: 'AI request timed out after 5 seconds'
        }
      };
    }

    // Network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        ok: false,
        error: {
          type: 'network_error',
          message: 'Network error occurred while contacting AI service'
        }
      };
    }

    // Parse API error response
    try {
      const errorInfo = JSON.parse(error.message);
      const status = errorInfo.status;

      // Invalid API key (401, 403)
      if (status === 401 || status === 403) {
        return {
          ok: false,
          error: {
            type: 'invalid_key',
            message: 'Invalid API key. Please check your API key and try again.'
          }
        };
      }

      // Rate limit (429)
      if (status === 429) {
        return {
          ok: false,
          error: {
            type: 'rate_limit',
            message: 'API rate limit exceeded. Please try again later.'
          }
        };
      }
    } catch {
      // Not a JSON error, continue
    }

    // Parse error
    if (error.message && (error.message.includes('JSON') || error.message.includes('parse'))) {
      return {
        ok: false,
        error: {
          type: 'parse_error',
          message: 'Failed to parse AI response'
        }
      };
    }

    // Generic network error
    return {
      ok: false,
      error: {
        type: 'network_error',
        message: error.message || 'Unknown error occurred'
      }
    };
  }
}
