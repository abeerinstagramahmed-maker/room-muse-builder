import {
  AIProvider,
  AIProviderConfig,
  AIRequest,
  AIResponse,
  AINotImplementedError,
} from '../types';

/**
 * CustomProvider — routes to a user-supplied endpoint for self-hosting.
 * Stubbed. Not used in the MVP.
 */
export class CustomProvider implements AIProvider {
  readonly id = 'custom' as const;
  readonly supportedCapabilities = [
    'layout-generation',
    'depth-estimation',
    'room-reconstruction',
    'furniture-detection',
    'furniture-removal',
    'room-visualization',
  ] as const satisfies AIProvider['supportedCapabilities'];

  isConfigured(config: AIProviderConfig): boolean {
    return Boolean(config.endpointUrl);
  }

  async run<TInput, TOutput>(
    request: AIRequest<TInput>,
    _config: AIProviderConfig,
  ): Promise<AIResponse<TOutput>> {
    throw new AINotImplementedError(this.id, request.capability);
  }
}
