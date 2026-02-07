/**
 * Shared types for AI provider adapters
 */

export type MessageRole = "system" | "user" | "assistant";

export interface Message {
  role: MessageRole;
  content: string;
}

export type Provider =
  | "openai"
  | "anthropic"
  | "deepseek"
  | "glm"
  | "minimax"
  | "qwen";

export interface StreamGenerateParams {
  provider: Provider;
  modelId: string;
  apiKey: string;
  messages: Message[];
}

export class AIProviderError extends Error {
  constructor(
    public provider: Provider,
    message: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}
