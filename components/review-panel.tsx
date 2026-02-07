"use client";

import { useWritingStore, type ReviewStep } from "@/hooks/use-writing-store";
import { CheckCircle2, Circle, Loader2, Shield, Sparkles, Type } from "lucide-react";
import { cn } from "@/lib/utils";

const REVIEW_STEPS: {
  id: ReviewStep;
  label: string;
  description: string;
  icon: typeof Shield;
}[] = [
  {
    id: "content",
    label: "内容审校",
    description: "检查逻辑、事实、结构",
    icon: CheckCircle2,
  },
  {
    id: "style",
    label: "风格审校",
    description: "降 AI 味（核心）",
    icon: Sparkles,
  },
  {
    id: "detail",
    label: "细节打磨",
    description: "标点、排版、节奏",
    icon: Type,
  },
];

export function ReviewPanel() {
  const {
    generatedArticle,
    isReviewing,
    currentReviewStep,
    setCurrentReviewStep,
    setIsReviewing,
    setGeneratedArticle,
    provider,
    modelId,
    apiKeys,
  } = useWritingStore();

  const handleReview = async (step: ReviewStep) => {
    if (!generatedArticle || isReviewing) return;

    const apiKey = apiKeys[provider];
    if (!apiKey) {
      alert("请先设置 API Key");
      return;
    }

    setCurrentReviewStep(step);
    setIsReviewing(true);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          article: generatedArticle,
          reviewStep: step,
          provider,
          modelId,
          apiKey,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "审校失败");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("无法读取响应");

      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            result += data;
            setGeneratedArticle(result);
          }
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "审校失败");
    } finally {
      setIsReviewing(false);
      setCurrentReviewStep(null);
    }
  };

  if (!generatedArticle) return null;

  return (
    <div className="border border-border rounded-xl p-4">
      <h3 className="text-sm font-medium mb-3 flex items-center gap-1.5">
        <Shield className="w-4 h-4" />
        三遍审校
      </h3>
      <div className="space-y-2">
        {REVIEW_STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = currentReviewStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => handleReview(step.id)}
              disabled={isReviewing}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                isActive
                  ? "bg-primary/5 border border-primary/20"
                  : "hover:bg-muted border border-transparent"
              )}
            >
              {isActive && isReviewing ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{step.label}</div>
                <div className="text-xs text-muted-foreground">
                  {step.description}
                </div>
              </div>
              {step.id === "style" && (
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                  核心
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
