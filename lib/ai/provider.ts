/**
 * Unified AI provider interface
 * Dispatches to the correct provider based on model selection
 */

import { streamOpenAI } from "./openai";
import { streamAnthropic } from "./anthropic";
import { streamDeepSeek } from "./deepseek";
import { streamGLM } from "./glm";
import { streamMiniMax } from "./minimax";
import { streamQwen } from "./qwen";
import type { StreamGenerateParams, Provider } from "./types";
import { AIProviderError } from "./types";

/**
 * Stream text generation from any supported AI provider
 *
 * @param params - Configuration object containing provider, model, API key, and messages
 * @returns ReadableStream of text chunks
 *
 * @example
 * ```typescript
 * const stream = await streamGenerate({
 *   provider: "openai",
 *   modelId: "gpt-4",
 *   apiKey: process.env.OPENAI_API_KEY!,
 *   messages: [
 *     { role: "system", content: "You are a helpful assistant." },
 *     { role: "user", content: "Write a short story." }
 *   ]
 * });
 *
 * // Use in a Next.js Route Handler
 * return new Response(stream);
 * ```
 */
export async function streamGenerate(
  params: StreamGenerateParams
): Promise<ReadableStream<string>> {
  const { provider, modelId, apiKey, messages } = params;

  if (!provider) {
    throw new AIProviderError(
      "openai", // Default provider for error reporting
      "Provider is required but was not provided"
    );
  }

  switch (provider) {
    case "openai":
      return streamOpenAI(apiKey, modelId, messages);

    case "anthropic":
      return streamAnthropic(apiKey, modelId, messages);

    case "deepseek":
      return streamDeepSeek(apiKey, modelId, messages);

    case "glm":
      return streamGLM(apiKey, modelId, messages);

    case "minimax":
      return streamMiniMax(apiKey, modelId, messages);

    case "qwen":
      return streamQwen(apiKey, modelId, messages);

    default:
      // TypeScript exhaustiveness check
      const exhaustiveCheck: never = provider;
      throw new AIProviderError(
        provider as Provider,
        `Unsupported provider: ${exhaustiveCheck}`
      );
  }
}

/**
 * Export types for external use
 */
export type { StreamGenerateParams, Provider, Message, MessageRole } from "./types";
export { AIProviderError } from "./types";
