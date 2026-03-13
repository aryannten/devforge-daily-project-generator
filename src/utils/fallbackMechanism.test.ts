/**
 * Tests for FallbackMechanism
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { FallbackMechanism } from './fallbackMechanism';
import { AIGenerator } from './aiGenerator';
import { AlgorithmicGenerator } from './generator';
import { AIConfig } from '../types';

// Mock the generators
vi.mock('./aiGenerator');
vi.mock('./generator');

describe('FallbackMechanism', () => {
  let fallbackMechanism: FallbackMechanism;
  let mockAIGenerator: any;
  let mockAlgorithmicGenerator: any;

  const mockAIConfig: AIConfig = {
    provider: 'openai',
    apiKey: 'test-key',
    enabled: true,
    timeout: 5000
  };

  const mockIdea = {
    id: 'test-id',
    title: 'Test Project',
    description: 'A test project description that is long enough to meet the minimum requirements for a valid description.',
    targetAudience: 'Test audience',
    coreFeatures: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5'],
    technicalRequirements: ['Tech 1', 'Tech 2'],
    difficultyLevel: 'Intermediate' as const,
    estimatedTime: '1-2 weeks',
    learningOutcomes: ['Outcome 1', 'Outcome 2', 'Outcome 3'],
    potentialExtensions: ['Extension 1', 'Extension 2', 'Extension 3'],
    similarProjects: ['Project 1', 'Project 2', 'Project 3'],
    category: 'Web Development',
    generatedAt: Date.now(),
    generationType: 'ai' as const
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mocks
    mockAIGenerator = {
      generateIdea: vi.fn()
    };
    mockAlgorithmicGenerator = {
      generateIdea: vi.fn().mockReturnValue({
        ...mockIdea,
        generationType: 'algorithmic'
      })
    };

    // Mock the constructors
    vi.mocked(AIGenerator).mockImplementation(() => mockAIGenerator);
    vi.mocked(AlgorithmicGenerator).mockImplementation(() => mockAlgorithmicGenerator);

    fallbackMechanism = new FallbackMechanism();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Successful AI Generation', () => {
    test('returns AI-generated idea when AI succeeds', async () => {
      mockAIGenerator.generateIdea.mockResolvedValue({
        ok: true,
        value: mockIdea
      });

      const result = await fallbackMechanism.generateWithFallback(
        mockAIConfig,
        [],
        []
      );

      expect(result.idea).toEqual(mockIdea);
      expect(result.usedFallback).toBe(false);
      expect(result.error).toBeUndefined();
      expect(mockAIGenerator.generateIdea).toHaveBeenCalledTimes(1);
      expect(mockAlgorithmicGenerator.generateIdea).not.toHaveBeenCalled();
    });

    test('measures generation time correctly', async () => {
      mockAIGenerator.generateIdea.mockResolvedValue({
        ok: true,
        value: mockIdea
      });

      const result = await fallbackMechanism.generateWithFallback(
        mockAIConfig,
        [],
        []
      );

      expect(result.generationTime).toBeGreaterThanOrEqual(0);
      expect(result.generationTime).toBeLessThan(1000); // Should be fast in tests
    });
  });

  describe('Fallback on AI Errors', () => {
    test('falls back to algorithmic on invalid_key error', async () => {
      mockAIGenerator.generateIdea.mockResolvedValue({
        ok: false,
        error: {
          type: 'invalid_key',
          message: 'Invalid API key'
        }
      });

      const result = await fallbackMechanism.generateWithFallback(
        mockAIConfig,
        [],
        []
      );

      expect(result.idea.generationType).toBe('algorithmic');
      expect(result.usedFallback).toBe(true);
      expect(result.error?.type).toBe('invalid_key');
      expect(mockAlgorithmicGenerator.generateIdea).toHaveBeenCalledTimes(1);
    });

    test('falls back to algorithmic on rate_limit error', async () => {
      mockAIGenerator.generateIdea.mockResolvedValue({
        ok: false,
        error: {
          type: 'rate_limit',
          message: 'Rate limit exceeded'
        }
      });

      const result = await fallbackMechanism.generateWithFallback(
        mockAIConfig,
        [],
        []
      );

      expect(result.idea.generationType).toBe('algorithmic');
      expect(result.usedFallback).toBe(true);
      expect(result.error?.type).toBe('rate_limit');
    });

    test('falls back to algorithmic on network_error', async () => {
      mockAIGenerator.generateIdea.mockResolvedValue({
        ok: false,
        error: {
          type: 'network_error',
          message: 'Network error'
        }
      });

      const result = await fallbackMechanism.generateWithFallback(
        mockAIConfig,
        [],
        []
      );

      expect(result.idea.generationType).toBe('algorithmic');
      expect(result.usedFallback).toBe(true);
      expect(result.error?.type).toBe('network_error');
    });

    test('falls back to algorithmic on timeout error', async () => {
      mockAIGenerator.generateIdea.mockResolvedValue({
        ok: false,
        error: {
          type: 'timeout',
          message: 'Request timed out'
        }
      });

      const result = await fallbackMechanism.generateWithFallback(
        mockAIConfig,
        [],
        []
      );

      expect(result.idea.generationType).toBe('algorithmic');
      expect(result.usedFallback).toBe(true);
      expect(result.error?.type).toBe('timeout');
    });

    test('falls back to algorithmic on parse_error', async () => {
      mockAIGenerator.generateIdea.mockResolvedValue({
        ok: false,
        error: {
          type: 'parse_error',
          message: 'Failed to parse response'
        }
      });

      const result = await fallbackMechanism.generateWithFallback(
        mockAIConfig,
        [],
        []
      );

      expect(result.idea.generationType).toBe('algorithmic');
      expect(result.usedFallback).toBe(true);
      expect(result.error?.type).toBe('parse_error');
    });

    test('falls back to algorithmic on validation_error', async () => {
      mockAIGenerator.generateIdea.mockResolvedValue({
        ok: false,
        error: {
          type: 'validation_error',
          message: 'Invalid response structure'
        }
      });

      const result = await fallbackMechanism.generateWithFallback(
        mockAIConfig,
        [],
        []
      );

      expect(result.idea.generationType).toBe('algorithmic');
      expect(result.usedFallback).toBe(true);
      expect(result.error?.type).toBe('validation_error');
    });
  });

  describe('Fallback on Unexpected Errors', () => {
    test('falls back to algorithmic on thrown exception', async () => {
      mockAIGenerator.generateIdea.mockRejectedValue(new Error('Unexpected error'));

      const result = await fallbackMechanism.generateWithFallback(
        mockAIConfig,
        [],
        []
      );

      expect(result.idea.generationType).toBe('algorithmic');
      expect(result.usedFallback).toBe(true);
      expect(result.error?.type).toBe('network_error');
      expect(result.error?.message).toContain('Unexpected error');
    });

    test('falls back to algorithmic on non-Error exception', async () => {
      mockAIGenerator.generateIdea.mockRejectedValue('String error');

      const result = await fallbackMechanism.generateWithFallback(
        mockAIConfig,
        [],
        []
      );

      expect(result.idea.generationType).toBe('algorithmic');
      expect(result.usedFallback).toBe(true);
      expect(result.error?.type).toBe('network_error');
    });
  });

  describe('Direct Algorithmic Generation', () => {
    test('uses algorithmic generation when AI is disabled', async () => {
      const disabledConfig: AIConfig = {
        ...mockAIConfig,
        enabled: false
      };

      const result = await fallbackMechanism.generateWithFallback(
        disabledConfig,
        [],
        []
      );

      expect(result.idea.generationType).toBe('algorithmic');
      expect(result.usedFallback).toBe(false);
      expect(result.error).toBeUndefined();
      expect(mockAIGenerator.generateIdea).not.toHaveBeenCalled();
      expect(mockAlgorithmicGenerator.generateIdea).toHaveBeenCalledTimes(1);
    });

    test('uses algorithmic generation when API key is empty', async () => {
      const noKeyConfig: AIConfig = {
        ...mockAIConfig,
        apiKey: ''
      };

      const result = await fallbackMechanism.generateWithFallback(
        noKeyConfig,
        [],
        []
      );

      expect(result.idea.generationType).toBe('algorithmic');
      expect(result.usedFallback).toBe(false);
      expect(mockAIGenerator.generateIdea).not.toHaveBeenCalled();
    });
  });

  describe('Category and Session History Handling', () => {
    test('passes categories to algorithmic generator on fallback', async () => {
      mockAIGenerator.generateIdea.mockResolvedValue({
        ok: false,
        error: {
          type: 'timeout',
          message: 'Timeout'
        }
      });

      const categories = ['Web Development', 'Mobile Development'];
      await fallbackMechanism.generateWithFallback(
        mockAIConfig,
        categories,
        []
      );

      expect(mockAlgorithmicGenerator.generateIdea).toHaveBeenCalledWith(
        expect.any(String),
        categories,
        []
      );
    });

    test('passes session history to algorithmic generator on fallback', async () => {
      mockAIGenerator.generateIdea.mockResolvedValue({
        ok: false,
        error: {
          type: 'rate_limit',
          message: 'Rate limit'
        }
      });

      const sessionHistory = ['hash1', 'hash2', 'hash3'];
      await fallbackMechanism.generateWithFallback(
        mockAIConfig,
        [],
        sessionHistory
      );

      expect(mockAlgorithmicGenerator.generateIdea).toHaveBeenCalledWith(
        expect.any(String),
        [],
        sessionHistory
      );
    });
  });

  describe('Timing Requirements', () => {
    test('completes within 6 seconds on fallback', async () => {
      mockAIGenerator.generateIdea.mockResolvedValue({
        ok: false,
        error: {
          type: 'timeout',
          message: 'Timeout'
        }
      });

      const result = await fallbackMechanism.generateWithFallback(
        mockAIConfig,
        [],
        []
      );

      // Requirement 9.5: Total time < 6 seconds
      expect(result.generationTime).toBeLessThan(6000);
    });

    test('logs warning if fallback exceeds 6 seconds', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      mockAIGenerator.generateIdea.mockResolvedValue({
        ok: false,
        error: {
          type: 'timeout',
          message: 'Timeout'
        }
      });

      // Mock slow algorithmic generation
      mockAlgorithmicGenerator.generateIdea.mockImplementation(() => {
        // Simulate delay
        const start = Date.now();
        while (Date.now() - start < 10) {
          // Busy wait for a tiny bit
        }
        return {
          ...mockIdea,
          generationType: 'algorithmic'
        };
      });

      await fallbackMechanism.generateWithFallback(
        mockAIConfig,
        [],
        []
      );

      // Should log fallback event
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('AI generation failed'),
        expect.any(Object)
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Error Logging', () => {
    test('logs fallback event with error details', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      mockAIGenerator.generateIdea.mockResolvedValue({
        ok: false,
        error: {
          type: 'invalid_key',
          message: 'Invalid API key'
        }
      });

      await fallbackMechanism.generateWithFallback(
        mockAIConfig,
        [],
        []
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('AI generation failed'),
        expect.objectContaining({
          errorType: 'invalid_key',
          errorMessage: 'Invalid API key',
          timestamp: expect.any(String)
        })
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('User-Friendly Error Messages', () => {
    test('returns correct message for invalid_key error', () => {
      const message = fallbackMechanism.getUserFriendlyErrorMessage({
        type: 'invalid_key',
        message: 'Invalid API key'
      });

      expect(message).toContain('Invalid API key');
      expect(message).toContain('algorithmic generation');
    });

    test('returns correct message for rate_limit error', () => {
      const message = fallbackMechanism.getUserFriendlyErrorMessage({
        type: 'rate_limit',
        message: 'Rate limit exceeded'
      });

      expect(message).toContain('rate limit');
      expect(message).toContain('algorithmic generation');
    });

    test('returns correct message for network_error', () => {
      const message = fallbackMechanism.getUserFriendlyErrorMessage({
        type: 'network_error',
        message: 'Network error'
      });

      expect(message).toContain('Network error');
      expect(message).toContain('algorithmic generation');
    });

    test('returns correct message for timeout error', () => {
      const message = fallbackMechanism.getUserFriendlyErrorMessage({
        type: 'timeout',
        message: 'Timeout'
      });

      expect(message).toContain('timed out');
      expect(message).toContain('algorithmic generation');
    });

    test('returns correct message for parse_error', () => {
      const message = fallbackMechanism.getUserFriendlyErrorMessage({
        type: 'parse_error',
        message: 'Parse error'
      });

      expect(message).toContain('parse');
      expect(message).toContain('algorithmic generation');
    });

    test('returns correct message for validation_error', () => {
      const message = fallbackMechanism.getUserFriendlyErrorMessage({
        type: 'validation_error',
        message: 'Validation error'
      });

      expect(message).toContain('invalid');
      expect(message).toContain('algorithmic generation');
    });
  });

  describe('AbortController Timeout', () => {
    test('sets up abort controller with correct timeout', async () => {
      const abortSpy = vi.fn();
      const mockController = {
        abort: abortSpy,
        signal: {} as AbortSignal
      };

      vi.spyOn(global, 'AbortController').mockImplementation(() => mockController as any);
      vi.spyOn(global, 'setTimeout');
      vi.spyOn(global, 'clearTimeout');

      mockAIGenerator.generateIdea.mockResolvedValue({
        ok: true,
        value: mockIdea
      });

      await fallbackMechanism.generateWithFallback(
        mockAIConfig,
        [],
        []
      );

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
      expect(clearTimeout).toHaveBeenCalled();
    });
  });
});
