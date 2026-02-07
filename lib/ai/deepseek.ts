/**
 * DeepSeek provider adapter
 * Uses OpenAI SDK with custom baseURL for DeepSeek's OpenAI-compatible API
 */

import OpenAI from "openai";
import type { Message } from "./types";
import { AIProviderError } from "./types";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

/**
 * Stream chat completions from DeepSeek
 * @param apiKey - DeepSeek API key
 * @param modelId - Model identifier (e.g., "deepseek-chat", "deepseek-coder")
 * @param messages - Array of conversation messages
 * @returns ReadableStream of text chunks
 */
export async function streamDeepSeek(
  apiKey: string,
  modelId: string,
  messages: Message[]
): Promise<ReadableStream<string>> {
  if (!apiKey || apiKey.trim() === "") {
    throw new AIProviderError(
      "deepseek",
      "DeepSeek API key is required but was not provided"
    );
  }

  if (!modelId || modelId.trim() === "") {
    throw new AIProviderError(
      "deepseek",
      "Model ID is required but was not provided"
    );
  }

  if (!messages || messages.length === 0) {
    throw new AIProviderError(
      "deepseek",
      "At least one message is required"
    );
  }

  const client = new OpenAI({
    apiKey: apiKey.trim(),
    baseURL: DEEPSEEK_BASE_URL,
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
            if (content) {
              controller.enqueue(content);
            }
          }
          controller.close();
        } catch (error) {
          controller.error(
            new AIProviderError(
              "deepseek",
              `Streaming error: ${error instanceof Error ? error.message : "Unknown error"}`,
              error
            )
          );
        }
      },
    });
  } catch (error) {
    throw new AIProviderError(
      "deepseek",
      `Failed to create stream: ${error instanceof Error ? error.message : "Unknown error"}`,
      error
    );
  }
}
