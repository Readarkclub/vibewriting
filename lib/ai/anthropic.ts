/**
 * Anthropic provider adapter
 * Uses the official Anthropic SDK to stream chat completions
 */

import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "./types";
import { AIProviderError } from "./types";

/**
 * Stream chat completions from Anthropic Claude
 * @param apiKey - Anthropic API key
 * @param modelId - Model identifier (e.g., "claude-3-5-sonnet-20241022", "claude-3-opus-20240229")
 * @param messages - Array of conversation messages
 * @returns ReadableStream of text chunks
 */
export async function streamAnthropic(
  apiKey: string,
  modelId: string,
  messages: Message[]
): Promise<ReadableStream<string>> {
  if (!apiKey || apiKey.trim() === "") {
    throw new AIProviderError(
      "anthropic",
      "Anthropic API key is required but was not provided"
    );
  }

  if (!modelId || modelId.trim() === "") {
    throw new AIProviderError(
      "anthropic",
      "Model ID is required but was not provided"
    );
  }

  if (!messages || messages.length === 0) {
    throw new AIProviderError(
      "anthropic",
      "At least one message is required"
    );
  }

  const client = new Anthropic({
    apiKey: apiKey.trim(),
  });

  // Extract system message if present
  const systemMessage = messages.find((msg) => msg.role === "system");
  const conversationMessages = messages.filter((msg) => msg.role !== "system");

  // Anthropic requires at least one non-system message
  if (conversationMessages.length === 0) {
    throw new AIProviderError(
      "anthropic",
      "At least one user or assistant message is required"
    );
  }

  try {
    const stream = await client.messages.stream({
      model: modelId,
      max_tokens: 4096,
      messages: conversationMessages.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      ...(systemMessage && { system: systemMessage.content }),
    });

    return new ReadableStream<string>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(chunk.delta.text);
            }
          }
          controller.close();
        } catch (error) {
          controller.error(
            new AIProviderError(
              "anthropic",
              `Streaming error: ${error instanceof Error ? error.message : "Unknown error"}`,
              error
            )
          );
        }
      },
    });
  } catch (error) {
    throw new AIProviderError(
      "anthropic",
      `Failed to create stream: ${error instanceof Error ? error.message : "Unknown error"}`,
      error
    );
  }
}
