"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useWritingStore } from "@/hooks/use-writing-store";
import type { ArticleType, Audience, WritingStyle } from "@/hooks/use-writing-store";

const ARTICLE_TYPES: { id: ArticleType; label: string }[] = [
  { id: "wechat", label: "公众号文章" },
  { id: "blog", label: "博客" },
  { id: "newsletter", label: "Newsletter" },
  { id: "tutorial", label: "技术教程" },
];

const AUDIENCES: { id: Audience; label: string }[] = [
  { id: "tech", label: "技术人员" },
  { id: "pm", label: "产品经理" },
  { id: "startup", label: "创业者" },
  { id: "general", label: "普通读者" },
];

const STYLES: { id: WritingStyle; label: string }[] = [
  { id: "casual", label: "口语化聊天" },
  { id: "professional", label: "专业严谨" },
  { id: "humorous", label: "幽默轻松" },
];

const WORD_COUNTS = [
  { value: "1000-2000", label: "1000-2000 字" },
  { value: "2000-4000", label: "2000-4000 字" },
  { value: "4000-6000", label: "4000-6000 字" },
  { value: "6000+", label: "6000+ 字" },
];

type ChatRole = "assistant" | "user";

interface InstructionMessage {
  id: number;
  role: ChatRole;
  text: string;
}

const ASSISTANT_GREETING: InstructionMessage = {
  id: 1,
  role: "assistant",
  text: "在这里输入新的修改意见，例如：加强开头冲突感、减少术语、结尾增加行动建议。",
};

async function streamSSEText(
  res: Response,
  onData: (chunk: string) => void
): Promise<void> {
  const reader = res.body?.getReader();
  if (!reader) throw new Error("无法读取响应流");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      const marker = data.trim();
      if (!marker || marker === "[DONE]") continue;
      if (marker.startsWith("[ERROR]")) {
        throw new Error(marker.slice(7).trim() || "修改失败");
      }
      onData(data);
    }
  }
}

export function WritingConfig() {
  const {
    config,
    setConfig,
    generatedArticle,
    setGeneratedArticle,
    provider,
    modelId,
    apiKeys,
    isGenerating,
    isReviewing,
    setIsReviewing,
    setCurrentReviewStep,
  } = useWritingStore();

  const [instructionDraft, setInstructionDraft] = useState("");
  const [messages, setMessages] = useState<InstructionMessage[]>([ASSISTANT_GREETING]);
  const [isApplyingInstruction, setIsApplyingInstruction] = useState(false);

  useEffect(() => {
    if (!config.extraInstructions.trim()) return;

    setMessages((prev) => {
      const hasUserMessage = prev.some((item) => item.role === "user");
      if (hasUserMessage) return prev;

      const restored = config.extraInstructions
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((text, index) => ({
          id: 1000 + index,
          role: "user" as const,
          text,
        }));

      return restored.length ? [ASSISTANT_GREETING, ...restored] : prev;
    });
  }, [config.extraInstructions]);

  const mergedInstructions = useMemo(() => {
    return messages
      .filter((item) => item.role === "user")
      .map((item) => item.text)
      .join("\n");
  }, [messages]);

  useEffect(() => {
    if (mergedInstructions === config.extraInstructions) return;
    setConfig({ extraInstructions: mergedInstructions });
  }, [config.extraInstructions, mergedInstructions, setConfig]);

  const appendAssistantMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        role: "assistant",
        text,
      },
    ]);
  };

  const handleSendInstruction = async () => {
    const text = instructionDraft.trim();
    if (!text) return;
    if (isGenerating || isReviewing || isApplyingInstruction) return;

    const userMessage: InstructionMessage = {
      id: Date.now(),
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInstructionDraft("");

    if (!generatedArticle.trim()) {
      appendAssistantMessage("已记录修改意见。当前还没有可改写的文章，后续写作会自动参考这条意见。");
      return;
    }

    const apiKey = apiKeys[provider];
    if (!apiKey?.trim()) {
      appendAssistantMessage("请先配置当前模型的 API Key，再发送修改意见。");
      return;
    }

    setIsApplyingInstruction(true);
    setIsReviewing(true);
    setCurrentReviewStep("detail");

    try {
      const res = await fetch("/api/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          article: generatedArticle,
          instruction: text,
          provider,
          modelId,
          apiKey,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "修改失败");
      }

      let revised = "";
      await streamSSEText(res, (chunk) => {
        revised += chunk;
        setGeneratedArticle(revised);
      });

      if (!revised.trim()) {
        throw new Error("修改结果为空");
      }

      appendAssistantMessage("已按这条意见完成修改。你可以继续发送下一条。");
    } catch (err) {
      appendAssistantMessage(
        `这次修改失败：${err instanceof Error ? err.message : "未知错误"}`
      );
    } finally {
      setIsApplyingInstruction(false);
      setIsReviewing(false);
      setCurrentReviewStep(null);
    }
  };

  const handleInstructionKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    void handleSendInstruction();
  };

  const handleClearInstructions = () => {
    setMessages([ASSISTANT_GREETING]);
    setInstructionDraft("");
  };

  return (
    <div className="border border-border rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-medium">写作配置</h3>

      {/* Article Type */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">文章类型</label>
        <div className="flex flex-wrap gap-2">
          {ARTICLE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setConfig({ articleType: type.id })}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                config.articleType === type.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audience */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">目标受众</label>
        <div className="flex flex-wrap gap-2">
          {AUDIENCES.map((a) => (
            <button
              key={a.id}
              onClick={() => setConfig({ audience: a.id })}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                config.audience === a.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">写作风格</label>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setConfig({ style: s.id })}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                config.style === s.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Word Count */}
      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">字数范围</label>
        <select
          value={config.wordCount}
          onChange={(e) => setConfig({ wordCount: e.target.value })}
          className="w-full px-3 py-1.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {WORD_COUNTS.map((wc) => (
            <option key={wc.value} value={wc.value}>
              {wc.label}
            </option>
          ))}
        </select>
      </div>

      {/* Chat-style instructions */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs text-muted-foreground">修改意见对话（可选）</label>
          <button
            onClick={handleClearInstructions}
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            清空
          </button>
        </div>

        <div className="h-32 overflow-y-auto border border-border rounded-lg p-2 space-y-2 bg-muted/20">
          {messages.map((item) => (
            <div
              key={item.id}
              className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] px-2.5 py-1.5 rounded-lg text-xs leading-relaxed ${
                  item.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border border-border text-foreground"
                }`}
              >
                {item.text}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={instructionDraft}
            onChange={(e) => setInstructionDraft(e.target.value)}
            onKeyDown={handleInstructionKeyDown}
            placeholder={
              isApplyingInstruction
                ? "正在按你的意见修改文章..."
                : "输入新的修改意见，按 Enter 直接修改"
            }
            disabled={isGenerating || isReviewing || isApplyingInstruction}
            className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          />
          <button
            onClick={() => void handleSendInstruction()}
            disabled={!instructionDraft.trim() || isGenerating || isReviewing || isApplyingInstruction}
            className="px-3 py-2 rounded-lg text-sm bg-secondary text-secondary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isApplyingInstruction ? "修改中" : "发送"}
          </button>
        </div>

        <p className="mt-1 text-[11px] text-muted-foreground">
          已记录 {messages.filter((item) => item.role === "user").length} 条修改意见
        </p>
      </div>
    </div>
  );
}
