"use client";

import { useEffect } from "react";
import { useWritingStore, type ModelProvider, type ModelId } from "@/hooks/use-writing-store";

const MODEL_OPTIONS: Record<ModelProvider, { id: ModelId; name: string }[]> = {
  openai: [
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini" },
  ],
  anthropic: [
    { id: "claude-sonnet-4-5-20250514", name: "Claude Sonnet 4.5" },
  ],
  deepseek: [
    { id: "deepseek-chat", name: "DeepSeek Chat" },
    { id: "deepseek-reasoner", name: "DeepSeek Reasoner" },
  ],
  glm: [
    { id: "glm-4.7", name: "GLM-4.7" },
  ],
  minimax: [
    { id: "MiniMax-M1", name: "MiniMax M1" },
    { id: "MiniMax-Text-01", name: "MiniMax Text-01" },
  ],
  qwen: [
    { id: "qwen-plus", name: "Qwen Plus" },
    { id: "qwen-turbo", name: "Qwen Turbo" },
  ],
};

const PROVIDER_NAMES: Record<ModelProvider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  deepseek: "DeepSeek",
  glm: "GLM",
  minimax: "MiniMax",
  qwen: "Qwen",
};

export function ModelSelector() {
  const { provider, modelId, setProvider, setModelId, apiKeys } =
    useWritingStore();

  useEffect(() => {
    const availableModels = MODEL_OPTIONS[provider];
    const currentModelValid = availableModels.some((m) => m.id === modelId);
    if (!currentModelValid) {
      setModelId(availableModels[0].id);
    }
  }, [provider, modelId, setModelId]);

  const hasKey = apiKeys[provider]?.length > 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-muted-foreground">模型</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as ModelProvider)}
          className="text-sm border border-border rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {(Object.keys(PROVIDER_NAMES) as ModelProvider[]).map((p) => (
            <option key={p} value={p}>
              {PROVIDER_NAMES[p]}
            </option>
          ))}
        </select>
      </div>

      <select
        value={modelId}
        onChange={(e) => setModelId(e.target.value as ModelId)}
        className="text-sm border border-border rounded-md px-2 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {MODEL_OPTIONS[provider].map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      {!hasKey && (
        <span className="text-xs text-destructive">未设置 API Key</span>
      )}
    </div>
  );
}
