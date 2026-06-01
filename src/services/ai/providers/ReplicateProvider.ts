import {
  AIProvider,
  AIProviderConfig,
  AIRequest,
  AIResponse,
  AINotImplementedError,
} from '../types';

/**
 * ReplicateProvider — PLANNED PRIMARY PROVIDER.
 *
 * Stubbed for the MVP. No network requests are made. When AI features are
 * built (Phase 2+), implement `run` to call Replicate via a Supabase edge
 * function that reads the API key from secure server-side storage.
 */
export class ReplicateProvider implements AIProvider {
  readonly id = 'replicate' as const;
  readonly supportedCapabilities = [
    'layout-generation',
    'depth-estimation',
    'room-reconstruction',
    'furniture-detection',
    'furniture-removal',
    'room-visualization',
  ] as const satisfies AIProvider['supportedCapabilities'];

  isConfigured(config: AIProviderConfig): boolean {
    return Boolean(config.apiKey);
  }

  async run<TInput, TOutput>(
    request: AIRequest<TInput>,
    _config: AIProviderConfig,
  ): Promise<AIResponse<TOutput>> {
    throw new AINotImplementedError(this.id, request.capability);
  }
}
