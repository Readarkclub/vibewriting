"use client";

import { useEffect, useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { useWritingStore, type ModelProvider } from "@/hooks/use-writing-store";

interface ApiKeyDialogProps {
  open: boolean;
  onClose: () => void;
}

const PROVIDERS: { id: ModelProvider; name: string; placeholder: string }[] = [
  { id: "openai", name: "OpenAI", placeholder: "sk-..." },
  { id: "anthropic", name: "Anthropic (Claude)", placeholder: "sk-ant-..." },
  { id: "deepseek", name: "DeepSeek", placeholder: "sk-..." },
  { id: "glm", name: "GLM (Zhipu)", placeholder: "Enter GLM API key" },
  { id: "minimax", name: "MiniMax", placeholder: "Enter MiniMax API key" },
  { id: "qwen", name: "Qwen", placeholder: "sk-..." },
];

export function ApiKeyDialog({ open, onClose }: ApiKeyDialogProps) {
  const { apiKeys, setApiKey, loadApiKeys } = useWritingStore();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background border border-border rounded-xl shadow-lg w-full max-w-md max-h-[85vh] overflow-y-auto custom-scrollbar mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">API Key 设置</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          API Key 仅保存在浏览器本地，不会上传到服务器。
        </p>

        <div className="space-y-4">
          {PROVIDERS.map((provider) => (
            <div key={provider.id}>
              <label className="block text-sm font-medium mb-1.5">
                {provider.name}
              </label>
              <div className="relative">
                <input
                  type={showKeys[provider.id] ? "text" : "password"}
                  value={apiKeys[provider.id]}
                  onChange={(e) => setApiKey(provider.id, e.target.value)}
                  placeholder={provider.placeholder}
                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowKeys((prev) => ({
                      ...prev,
                      [provider.id]: !prev[provider.id],
                    }))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                >
                  {showKeys[provider.id] ? (
                    <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          保存
        </button>
      </div>
    </div>
  );
}
