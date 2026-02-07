import { NextRequest } from "next/server";
import { streamGenerate } from "@/lib/ai/provider";
import { normalizeProviderChunk } from "@/lib/ai/sse";
import { getSystemPrompt } from "@/lib/prompts/system";
import { getGeneratePrompt } from "@/lib/prompts/generate";
import type { Provider, Message } from "@/lib/ai/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceContent, config, provider, modelId, apiKey } = body;

    if (!sourceContent?.trim()) {
      return new Response(JSON.stringify({ error: "请提供素材内容" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!apiKey?.trim()) {
      return new Response(JSON.stringify({ error: "请提供 API Key" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemPrompt = getSystemPrompt();
    const generatePrompt = getGeneratePrompt(config);

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `${generatePrompt}\n\n---\n\n## 素材内容\n\n${sourceContent}`,
      },
    ];

    const stream = await streamGenerate({
      provider: provider as Provider,
      modelId,
      apiKey,
      messages,
    });

    // Convert string stream to SSE format
    const encoder = new TextEncoder();
    const sseStream = new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              break;
            }
            const normalized = normalizeProviderChunk(value);
            if (!normalized) continue;
            controller.enqueue(encoder.encode(`data: ${normalized}\n\n`));
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(
            encoder.encode(`data: [ERROR] ${msg}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(sseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "生成失败";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
