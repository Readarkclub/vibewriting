/**
 * OpenAI provider adapter
 * Uses the official OpenAI SDK to stream chat completions
 */

import OpenAI from "openai";
import type { Message } from "./types";
import { AIProviderError } from "./types";

/**
 * Stream chat completions from OpenAI
 * @param apiKey - OpenAI API key
 * @param modelId - Model identifier (e.g., "gpt-4", "gpt-3.5-turbo")
 * @param messages - Array of conversation messages
 * @returns ReadableStream of text chunks
 */
export async function streamOpenAI(
  apiKey: string,
  modelId: string,
  messages: Message[]
): Promise<ReadableStream<string>> {
  if (!apiKey || apiKey.trim() === "") {
    throw new AIProviderError(
      "openai",
      "OpenAI API key is required but was not provided"
    );
  }

  if (!modelId || modelId.trim() === "") {
    throw new AIProviderError(
      "openai",
      "Model ID is required but was not provided"
    );
  }

  if (!messages || messages.length === 0) {
    throw new AIProviderError(
      "openai",
      "At least one message is required"
    );
  }

  const client = new OpenAI({
    apiKey: apiKey.trim(),
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
              "openai",
              `Streaming error: ${error instanceof Error ? error.message : "Unknown error"}`,
              error
            )
          );
        }
      },
    });
  } catch (error) {
    throw new AIProviderError(
      "openai",
      `Failed to create stream: ${error instanceof Error ? error.message : "Unknown error"}`,
      error
    );
  }
}
