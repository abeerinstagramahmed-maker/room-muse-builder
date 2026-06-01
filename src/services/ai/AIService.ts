/**
 * AIService — central, provider-agnostic entry point for all future AI work.
 *
 * IMPORTANT: AI is DISABLED in this MVP. `AIService` is fully wired (provider
 * registry, config resolution, capability routing) but every call ultimately
 * throws `AINotImplementedError` until providers are implemented in later
 * phases. This guarantees no AI requests run today while giving future code a
 * single, stable surface to build against.
 */
import {
  AICapability,
  AIProvider,
  AIProviderId,
  AIRequest,
  AIResponse,
  AISettings,
} from './types';
import { ReplicateProvider } from './providers/ReplicateProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';
import { CustomProvider } from './providers/CustomProvider';

export class AIService {
  private readonly providers: Record<AIProviderId, AIProvider>;

  constructor(private settings: AISettings) {
    this.providers = {
      replicate: new ReplicateProvider(),
      openai: new OpenAIProvider(),
      anthropic: new AnthropicProvider(),
      custom: new CustomProvider(),
    };
  }

  /** Whether AI features are enabled. Always false in the MVP. */
  get isEnabled(): boolean {
    return this.settings.enabled;
  }

  getProvider(id: AIProviderId = this.settings.activeProvider): AIProvider {
    return this.providers[id];
  }

  /** Does the active provider have credentials configured? */
  isConfigured(id: AIProviderId = this.settings.activeProvider): boolean {
    return this.getProvider(id).isConfigured(this.settings.providers[id]);
  }

  supportsCapability(
    capability: AICapability,
    id: AIProviderId = this.settings.activeProvider,
  ): boolean {
    return this.getProvider(id).supportedCapabilities.includes(capability);
  }

  /**
   * Route a request to the active provider.
   * Throws in the MVP — AI is intentionally not implemented yet.
   */
  async run<TInput, TOutput>(
    request: AIRequest<TInput>,
    id: AIProviderId = this.settings.activeProvider,
  ): Promise<AIResponse<TOutput>> {
    if (!this.isEnabled) {
      throw new Error(
        'AI features are disabled in this MVP. Enable them only after the AI ' +
          'provider implementations are completed (see src/services/ai).',
      );
    }
    return this.getProvider(id).run<TInput, TOutput>(
      request,
      this.settings.providers[id],
    );
  }
}

export * from './types';
