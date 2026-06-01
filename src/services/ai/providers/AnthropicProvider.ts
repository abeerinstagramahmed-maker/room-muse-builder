import {
  AIProvider,
  AIProviderConfig,
  AIRequest,
  AIResponse,
  AINotImplementedError,
} from '../types';

/** AnthropicProvider — stubbed. Not used in the MVP. */
export class AnthropicProvider implements AIProvider {
  readonly id = 'anthropic' as const;
  readonly supportedCapabilities = ['layout-generation'] as const satisfies AIProvider['supportedCapabilities'];

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
