import { NextRequest } from "next/server";
import { streamGenerate } from "@/lib/ai/provider";
import { normalizeProviderChunk } from "@/lib/ai/sse";
import { getSystemPrompt } from "@/lib/prompts/system";
import { getRevisePrompt } from "@/lib/prompts/revise";
import type { Provider, Message } from "@/lib/ai/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { article, instruction, provider, modelId, apiKey } = body;

    if (!article?.trim()) {
      return new Response(JSON.stringify({ error: "Please provide article content" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!instruction?.trim()) {
      return new Response(JSON.stringify({ error: "Please provide revision instruction" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!apiKey?.trim()) {
      return new Response(JSON.stringify({ error: "Please provide API key" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemPrompt = getSystemPrompt();
    const revisePrompt = getRevisePrompt(instruction);

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `${revisePrompt}\n\n---\n\n## Current Article\n\n${article}`,
      },
    ];

    const stream = await streamGenerate({
      provider: provider as Provider,
      modelId,
      apiKey,
      messages,
    });

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
          controller.enqueue(encoder.encode(`data: [ERROR] ${msg}\n\n`));
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
    const message = err instanceof Error ? err.message : "Revision failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
