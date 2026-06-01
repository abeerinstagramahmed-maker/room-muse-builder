import {
  AIProvider,
  AIProviderConfig,
  AIRequest,
  AIResponse,
  AINotImplementedError,
} from '../types';

/** OpenAIProvider — stubbed. Not used in the MVP. */
export class OpenAIProvider implements AIProvider {
  readonly id = 'openai' as const;
  readonly supportedCapabilities = [
    'layout-generation',
    'furniture-detection',
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
