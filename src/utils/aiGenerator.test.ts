/**
 * Tests for AIGenerator
 * Requirements: 8.3, 8.4, 8.5, 9.3, 9.4
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { AIGenerator } from './aiGenerator';

describe('AIGenerator', () => {
  let generator: AIGenerator;
  let abortController: AbortController;

  beforeEach(() => {
    generator = new AIGenerator();
    abortController = new AbortController();
    vi.clearAllMocks();
  });

  describe('generateIdea', () => {
    test('generates valid idea with OpenAI provider', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Real-time Collaborative Code Editor',
              description: 'A web-based code editor that allows multiple developers to write and edit code simultaneously with live cursor tracking and syntax highlighting.',
              targetAudience: 'Development teams and pair programmers',
              coreFeatures: [
                'Real-time collaborative editing',
                'Syntax highlighting for 20+ languages',
                'Live cursor tracking',
                'Integrated chat system',
                'Version history'
              ],
              technicalRequirements: ['WebSocket', 'React', 'Node.js', 'Monaco Editor'],
              difficultyLevel: 'Advanced',
              estimatedTime: '3-4 weeks',
              learningOutcomes: [
                'WebSocket implementation',
                'Operational transformation',
                'Real-time synchronization'
              ],
              potentialExtensions: [
                'Video chat integration',
                'AI code suggestions',
                'Plugin system'
              ],
              similarProjects: [
                'CodeSandbox',
                'Replit',
                'VS Code Live Share'
              ],
              category: 'Web Development'
            })
          }
        }]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await generator.generateIdea(
        'openai',
        'test-api-key',
        [],
        abortController.signal
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.title).toBe('Real-time Collaborative Code Editor');
        expect(result.value.generationType).toBe('ai');
        expect(result.value.id).toBeTruthy();
        expect(result.value.generatedAt).toBeTruthy();
        expect(result.value.coreFeatures).toHaveLength(5);
      }
    });

    test('generates valid idea with Gemini provider', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                title: 'AI-Powered Recipe Generator',
                description: 'An intelligent recipe generator that creates personalized recipes based on available ingredients, dietary restrictions, and cooking skill level.',
                targetAudience: 'Home cooks and food enthusiasts',
                coreFeatures: [
                  'Ingredient-based recipe search',
                  'Dietary restriction filtering',
                  'Step-by-step instructions',
                  'Nutritional information',
                  'Shopping list generation',
                  'Recipe rating system'
                ],
                technicalRequirements: ['Python', 'Flask', 'OpenAI API', 'PostgreSQL'],
                difficultyLevel: 'Intermediate',
                estimatedTime: '2-3 weeks',
                learningOutcomes: [
                  'API integration',
                  'Database design',
                  'Natural language processing'
                ],
                potentialExtensions: [
                  'Meal planning calendar',
                  'Social sharing features',
                  'Video tutorials'
                ],
                similarProjects: [
                  'Tasty',
                  'Yummly',
                  'Allrecipes'
                ],
                category: 'Full-Stack Applications'
              })
            }]
          }
        }]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await generator.generateIdea(
        'gemini',
        'test-api-key',
        [],
        abortController.signal
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.title).toBe('AI-Powered Recipe Generator');
        expect(result.value.generationType).toBe('ai');
        expect(result.value.coreFeatures).toHaveLength(6);
      }
    });

    test('generates valid idea with Groq provider', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Terminal-Based Task Manager',
              description: 'A lightweight command-line task management tool with project organization, time tracking, and productivity analytics.',
              targetAudience: 'Developers and terminal power users',
              coreFeatures: [
                'Task creation and management',
                'Project organization',
                'Time tracking',
                'Priority levels',
                'Due date reminders'
              ],
              technicalRequirements: ['Go', 'Cobra CLI', 'SQLite'],
              difficultyLevel: 'Beginner',
              estimatedTime: '1-2 weeks',
              learningOutcomes: [
                'CLI development',
                'Database integration',
                'Go programming'
              ],
              potentialExtensions: [
                'Cloud sync',
                'Team collaboration',
                'Git integration'
              ],
              similarProjects: [
                'Taskwarrior',
                'Todo.txt',
                'Todoist CLI'
              ],
              category: 'CLI Tools'
            })
          }
        }]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await generator.generateIdea(
        'groq',
        'test-api-key',
        [],
        abortController.signal
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.title).toBe('Terminal-Based Task Manager');
        expect(result.value.difficultyLevel).toBe('Beginner');
      }
    });

    test('includes category preferences in prompt', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Mobile Fitness Tracker',
              description: 'A comprehensive fitness tracking app with workout logging, progress visualization, and social features.',
              targetAudience: 'Fitness enthusiasts',
              coreFeatures: [
                'Workout logging',
                'Progress tracking',
                'Social features',
                'Goal setting',
                'Exercise library'
              ],
              technicalRequirements: ['React Native', 'Firebase', 'Redux'],
              difficultyLevel: 'Intermediate',
              estimatedTime: '3-4 weeks',
              learningOutcomes: [
                'Mobile development',
                'State management',
                'Firebase integration'
              ],
              potentialExtensions: [
                'Wearable integration',
                'AI workout suggestions',
                'Nutrition tracking'
              ],
              similarProjects: [
                'MyFitnessPal',
                'Strava',
                'Fitbit'
              ],
              category: 'Mobile Development'
            })
          }
        }]
      };

      let capturedBody: any;
      global.fetch = vi.fn().mockImplementation(async (_url, options) => {
        capturedBody = JSON.parse(options.body as string);
        return {
          ok: true,
          json: async () => mockResponse
        };
      });

      const categories = ['Mobile Development', 'Games'];
      await generator.generateIdea(
        'openai',
        'test-api-key',
        categories,
        abortController.signal
      );

      expect(capturedBody.messages[0].content).toContain('Mobile Development');
      expect(capturedBody.messages[0].content).toContain('Games');
    });
  });

  describe('error handling', () => {
    test('handles invalid API key error (401)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid API key' })
      });

      const result = await generator.generateIdea(
        'openai',
        'invalid-key',
        [],
        abortController.signal
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('invalid_key');
        expect(result.error.message).toContain('Invalid API key');
      }
    });

    test('handles invalid API key error (403)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Forbidden' })
      });

      const result = await generator.generateIdea(
        'openai',
        'invalid-key',
        [],
        abortController.signal
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('invalid_key');
      }
    });

    test('handles rate limit error (429)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Rate limit exceeded' })
      });

      const result = await generator.generateIdea(
        'openai',
        'test-api-key',
        [],
        abortController.signal
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('rate_limit');
        expect(result.error.message).toContain('rate limit');
      }
    });

    test('handles network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      const result = await generator.generateIdea(
        'openai',
        'test-api-key',
        [],
        abortController.signal
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('network_error');
      }
    });

    test('handles timeout with AbortController', async () => {
      global.fetch = vi.fn().mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('The operation was aborted');
            error.name = 'AbortError';
            reject(error);
          }, 100);
        });
      });

      // Abort after 50ms
      setTimeout(() => abortController.abort(), 50);

      const result = await generator.generateIdea(
        'openai',
        'test-api-key',
        [],
        abortController.signal
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('timeout');
        expect(result.error.message).toContain('timed out');
      }
    });

    test('handles parse error when response is not JSON', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'This is not valid JSON'
          }
        }]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await generator.generateIdea(
        'openai',
        'test-api-key',
        [],
        abortController.signal
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('parse_error');
      }
    });

    test('handles validation error when required fields are missing', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Test',
              description: 'Too short',
              targetAudience: '',
              coreFeatures: [],
              technicalRequirements: [],
              difficultyLevel: 'Intermediate',
              estimatedTime: '',
              learningOutcomes: [],
              potentialExtensions: [],
              similarProjects: [],
              category: ''
            })
          }
        }]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await generator.generateIdea(
        'openai',
        'test-api-key',
        [],
        abortController.signal
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('validation_error');
      }
    });

    test('handles validation error when arrays have wrong length', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Valid Title Here',
              description: 'A valid description that is long enough to pass the minimum length requirement.',
              targetAudience: 'Developers',
              coreFeatures: ['Only', 'Three', 'Features'], // Should be 5-7
              technicalRequirements: ['React'],
              difficultyLevel: 'Intermediate',
              estimatedTime: '2 weeks',
              learningOutcomes: ['One', 'Two'], // Should be 3-5
              potentialExtensions: ['One', 'Two'], // Should be 3-5
              similarProjects: ['One', 'Two'], // Should be 3-5
              category: 'Web Development'
            })
          }
        }]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await generator.generateIdea(
        'openai',
        'test-api-key',
        [],
        abortController.signal
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('validation_error');
        expect(result.error.message).toContain('Core features');
      }
    });
  });

  describe('difficulty level normalization', () => {
    test('normalizes "beginner" to "Beginner"', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Simple Todo App',
              description: 'A basic todo application for learning web development fundamentals.',
              targetAudience: 'Beginner developers',
              coreFeatures: ['Add tasks', 'Mark complete', 'Delete tasks', 'Filter tasks', 'Local storage'],
              technicalRequirements: ['HTML', 'CSS', 'JavaScript'],
              difficultyLevel: 'beginner',
              estimatedTime: '1 weekend',
              learningOutcomes: ['DOM manipulation', 'Event handling', 'Local storage'],
              potentialExtensions: ['Categories', 'Due dates', 'Priorities'],
              similarProjects: ['TodoMVC', 'Microsoft To Do', 'Any.do'],
              category: 'Web Development'
            })
          }
        }]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await generator.generateIdea(
        'openai',
        'test-api-key',
        [],
        abortController.signal
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.difficultyLevel).toBe('Beginner');
      }
    });

    test('normalizes "ADVANCED" to "Advanced"', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Distributed Database System',
              description: 'A distributed database system with consensus algorithms and fault tolerance.',
              targetAudience: 'Advanced developers',
              coreFeatures: ['Consensus', 'Replication', 'Sharding', 'Fault tolerance', 'ACID transactions'],
              technicalRequirements: ['Go', 'Raft', 'gRPC'],
              difficultyLevel: 'ADVANCED',
              estimatedTime: '2-3 months',
              learningOutcomes: ['Distributed systems', 'Consensus algorithms', 'Network programming'],
              potentialExtensions: ['Multi-region', 'Encryption', 'Query optimization'],
              similarProjects: ['CockroachDB', 'TiDB', 'YugabyteDB'],
              category: 'APIs & Backend'
            })
          }
        }]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await generator.generateIdea(
        'openai',
        'test-api-key',
        [],
        abortController.signal
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.difficultyLevel).toBe('Advanced');
      }
    });

    test('defaults to "Intermediate" for unknown difficulty', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Weather Dashboard',
              description: 'A weather dashboard that displays current conditions and forecasts.',
              targetAudience: 'Web developers',
              coreFeatures: ['Current weather', 'Forecast', 'Location search', 'Favorites', 'Charts'],
              technicalRequirements: ['React', 'Weather API', 'Chart.js'],
              difficultyLevel: 'Medium', // Not a valid level
              estimatedTime: '1-2 weeks',
              learningOutcomes: ['API integration', 'Data visualization', 'React hooks'],
              potentialExtensions: ['Alerts', 'Historical data', 'Mobile app'],
              similarProjects: ['Weather.com', 'AccuWeather', 'Dark Sky'],
              category: 'Web Development'
            })
          }
        }]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await generator.generateIdea(
        'openai',
        'test-api-key',
        [],
        abortController.signal
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.difficultyLevel).toBe('Intermediate');
      }
    });
  });

  describe('API endpoint selection', () => {
    test('uses correct endpoint for OpenAI', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Test Project',
              description: 'A test project description that is long enough to pass validation.',
              targetAudience: 'Test users',
              coreFeatures: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5'],
              technicalRequirements: ['Tech 1', 'Tech 2'],
              difficultyLevel: 'Intermediate',
              estimatedTime: '1 week',
              learningOutcomes: ['Outcome 1', 'Outcome 2', 'Outcome 3'],
              potentialExtensions: ['Extension 1', 'Extension 2', 'Extension 3'],
              similarProjects: ['Project 1', 'Project 2', 'Project 3'],
              category: 'Web Development'
            })
          }
        }]
      };

      let capturedUrl: string = '';
      global.fetch = vi.fn().mockImplementation(async (url) => {
        capturedUrl = url as string;
        return {
          ok: true,
          json: async () => mockResponse
        };
      });

      await generator.generateIdea(
        'openai',
        'test-api-key',
        [],
        abortController.signal
      );

      expect(capturedUrl).toBe('https://api.openai.com/v1/chat/completions');
    });

    test('uses correct endpoint for Gemini', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                title: 'Test Project',
                description: 'A test project description that is long enough to pass validation.',
                targetAudience: 'Test users',
                coreFeatures: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5'],
                technicalRequirements: ['Tech 1', 'Tech 2'],
                difficultyLevel: 'Intermediate',
                estimatedTime: '1 week',
                learningOutcomes: ['Outcome 1', 'Outcome 2', 'Outcome 3'],
                potentialExtensions: ['Extension 1', 'Extension 2', 'Extension 3'],
                similarProjects: ['Project 1', 'Project 2', 'Project 3'],
                category: 'Web Development'
              })
            }]
          }
        }]
      };

      let capturedUrl: string = '';
      global.fetch = vi.fn().mockImplementation(async (url) => {
        capturedUrl = url as string;
        return {
          ok: true,
          json: async () => mockResponse
        };
      });

      await generator.generateIdea(
        'gemini',
        'test-api-key',
        [],
        abortController.signal
      );

      expect(capturedUrl).toContain('generativelanguage.googleapis.com');
      expect(capturedUrl).toContain('key=test-api-key');
    });

    test('uses correct endpoint for Groq', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Test Project',
              description: 'A test project description that is long enough to pass validation.',
              targetAudience: 'Test users',
              coreFeatures: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5'],
              technicalRequirements: ['Tech 1', 'Tech 2'],
              difficultyLevel: 'Intermediate',
              estimatedTime: '1 week',
              learningOutcomes: ['Outcome 1', 'Outcome 2', 'Outcome 3'],
              potentialExtensions: ['Extension 1', 'Extension 2', 'Extension 3'],
              similarProjects: ['Project 1', 'Project 2', 'Project 3'],
              category: 'Web Development'
            })
          }
        }]
      };

      let capturedUrl: string = '';
      global.fetch = vi.fn().mockImplementation(async (url) => {
        capturedUrl = url as string;
        return {
          ok: true,
          json: async () => mockResponse
        };
      });

      await generator.generateIdea(
        'groq',
        'test-api-key',
        [],
        abortController.signal
      );

      expect(capturedUrl).toBe('https://api.groq.com/openai/v1/chat/completions');
    });
  });

  describe('metadata generation', () => {
    test('generates unique ID for each idea', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Test Project',
              description: 'A test project description that is long enough to pass validation.',
              targetAudience: 'Test users',
              coreFeatures: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5'],
              technicalRequirements: ['Tech 1', 'Tech 2'],
              difficultyLevel: 'Intermediate',
              estimatedTime: '1 week',
              learningOutcomes: ['Outcome 1', 'Outcome 2', 'Outcome 3'],
              potentialExtensions: ['Extension 1', 'Extension 2', 'Extension 3'],
              similarProjects: ['Project 1', 'Project 2', 'Project 3'],
              category: 'Web Development'
            })
          }
        }]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result1 = await generator.generateIdea(
        'openai',
        'test-api-key',
        [],
        abortController.signal
      );

      const result2 = await generator.generateIdea(
        'openai',
        'test-api-key',
        [],
        abortController.signal
      );

      expect(result1.ok).toBe(true);
      expect(result2.ok).toBe(true);
      
      if (result1.ok && result2.ok) {
        expect(result1.value.id).not.toBe(result2.value.id);
        expect(result1.value.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      }
    });

    test('sets generationType to "ai"', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Test Project',
              description: 'A test project description that is long enough to pass validation.',
              targetAudience: 'Test users',
              coreFeatures: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5'],
              technicalRequirements: ['Tech 1', 'Tech 2'],
              difficultyLevel: 'Intermediate',
              estimatedTime: '1 week',
              learningOutcomes: ['Outcome 1', 'Outcome 2', 'Outcome 3'],
              potentialExtensions: ['Extension 1', 'Extension 2', 'Extension 3'],
              similarProjects: ['Project 1', 'Project 2', 'Project 3'],
              category: 'Web Development'
            })
          }
        }]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await generator.generateIdea(
        'openai',
        'test-api-key',
        [],
        abortController.signal
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.generationType).toBe('ai');
      }
    });

    test('sets generatedAt timestamp', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Test Project',
              description: 'A test project description that is long enough to pass validation.',
              targetAudience: 'Test users',
              coreFeatures: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5'],
              technicalRequirements: ['Tech 1', 'Tech 2'],
              difficultyLevel: 'Intermediate',
              estimatedTime: '1 week',
              learningOutcomes: ['Outcome 1', 'Outcome 2', 'Outcome 3'],
              potentialExtensions: ['Extension 1', 'Extension 2', 'Extension 3'],
              similarProjects: ['Project 1', 'Project 2', 'Project 3'],
              category: 'Web Development'
            })
          }
        }]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const before = Date.now();
      const result = await generator.generateIdea(
        'openai',
        'test-api-key',
        [],
        abortController.signal
      );
      const after = Date.now();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.generatedAt).toBeGreaterThanOrEqual(before);
        expect(result.value.generatedAt).toBeLessThanOrEqual(after);
      }
    });
  });
});
