/**
 * AI Service Layer — Type Definitions
 *
 * Provider-agnostic contracts for FUTURE AI capabilities.
 * NOTHING here runs in the MVP. These interfaces exist so that later phases
 * (layout generation, depth estimation, room reconstruction, furniture
 * detection/removal, IKEA-Kreativ-style visualization) can plug in without
 * touching application code.
 */

export type AIProviderId = 'replicate' | 'openai' | 'anthropic' | 'custom';

export interface AIProviderConfig {
  /** Stored securely server-side. Never exposed to the client at runtime. */
  apiKey?: string;
  /** Only used by the "custom" provider. */
  endpointUrl?: string;
  /** Optional default model identifier for the provider. */
  model?: string;
}

export interface AISettings {
  /** Which provider future AI requests should route to. */
  activeProvider: AIProviderId;
  /** Whether AI features are turned on. Always false in the MVP. */
  enabled: boolean;
  providers: Record<AIProviderId, AIProviderConfig>;
}

export const defaultAISettings: AISettings = {
  activeProvider: 'replicate',
  enabled: false,
  providers: {
    replicate: { apiKey: '', model: '' },
    openai: { apiKey: '', model: '' },
    anthropic: { apiKey: '', model: '' },
    custom: { apiKey: '', endpointUrl: '', model: '' },
  },
};

/** Capabilities the platform will eventually expose. */
export type AICapability =
  | 'layout-generation'
  | 'depth-estimation'
  | 'room-reconstruction'
  | 'furniture-detection'
  | 'furniture-removal'
  | 'room-visualization';

export interface AIRequest<TInput = unknown> {
  capability: AICapability;
  input: TInput;
  signal?: AbortSignal;
}

export interface AIResponse<TOutput = unknown> {
  capability: AICapability;
  output: TOutput;
  providerId: AIProviderId;
}

/**
 * Common interface every provider must implement.
 * Implementations are intentionally stubbed for the MVP.
 */
export interface AIProvider {
  readonly id: AIProviderId;
  /** Capabilities this provider supports once implemented. */
  readonly supportedCapabilities: AICapability[];
  isConfigured(config: AIProviderConfig): boolean;
  run<TInput, TOutput>(
    request: AIRequest<TInput>,
    config: AIProviderConfig,
  ): Promise<AIResponse<TOutput>>;
}

export class AINotImplementedError extends Error {
  constructor(providerId: AIProviderId, capability: AICapability) {
    super(
      `AI capability "${capability}" via provider "${providerId}" is not available in this MVP. ` +
        `The AI service layer is wired but disabled — see src/services/ai.`,
    );
    this.name = 'AINotImplementedError';
  }
}
