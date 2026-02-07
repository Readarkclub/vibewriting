/**
 * GLM provider adapter
 * Uses OpenAI SDK with Zhipu AI GLM's OpenAI-compatible API
 */

import OpenAI from "openai";
import type { Message } from "./types";
import { AIProviderError } from "./types";

const GLM_BASE_URL = "https://open.bigmodel.cn/api/coding/paas/v4";

export async function streamGLM(
  apiKey: string,
  modelId: string,
  messages: Message[]
): Promise<ReadableStream<string>> {
  if (!apiKey || apiKey.trim() === "") {
    throw new AIProviderError(
      "glm",
      "GLM API key is required but was not provided"
    );
  }

  if (!modelId || modelId.trim() === "") {
    throw new AIProviderError("glm", "Model ID is required but was not provided");
  }

  if (!messages || messages.length === 0) {
    throw new AIProviderError("glm", "At least one message is required");
  }

  const client = new OpenAI({
    apiKey: apiKey.trim(),
    baseURL: GLM_BASE_URL,
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
              "glm",
              `Streaming error: ${error instanceof Error ? error.message : "Unknown error"}`,
              error
            )
          );
        }
      },
    });
  } catch (error) {
    throw new AIProviderError(
      "glm",
      `Failed to create stream: ${error instanceof Error ? error.message : "Unknown error"}`,
      error
    );
  }
}
