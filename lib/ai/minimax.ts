/**
 * MiniMax provider adapter
 * Uses OpenAI SDK with MiniMax OpenAI-compatible API
 */

import OpenAI from "openai";
import type { Message } from "./types";
import { AIProviderError } from "./types";

const MINIMAX_BASE_URL = "https://api.minimaxi.chat/v1";

export async function streamMiniMax(
  apiKey: string,
  modelId: string,
  messages: Message[]
): Promise<ReadableStream<string>> {
  if (!apiKey || apiKey.trim() === "") {
    throw new AIProviderError(
      "minimax",
      "MiniMax API key is required but was not provided"
    );
  }

  if (!modelId || modelId.trim() === "") {
    throw new AIProviderError(
      "minimax",
      "Model ID is required but was not provided"
    );
  }

  if (!messages || messages.length === 0) {
    throw new AIProviderError("minimax", "At least one message is required");
  }

  const client = new OpenAI({
    apiKey: apiKey.trim(),
    baseURL: MINIMAX_BASE_URL,
  });

  try {
    const stream = await client.chat.completions.create({
      model: modelId,
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    });

    return new ReadableStream<string>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) controller.enqueue(content);
          }
          controller.close();
        } catch (error) {
          controller.error(
            new AIProviderError(
              "minimax",
              `Streaming error: ${error instanceof Error ? error.message : "Unknown error"}`,
              error
            )
          );
        }
      },
    });
  } catch (error) {
    throw new AIProviderError(
      "minimax",
      `Failed to create stream: ${error instanceof Error ? error.message : "Unknown error"}`,
      error
    );
  }
}
