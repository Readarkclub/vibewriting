"use client";

import { useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Header } from "@/components/header";
import { InputPanel } from "@/components/input-panel";
import { WritingConfig } from "@/components/writing-config";
import { ModelSelector } from "@/components/model-selector";
import { ArticleEditor } from "@/components/article-editor";
import { ArticlePreview } from "@/components/article-preview";
import { ReviewPanel } from "@/components/review-panel";
import { useWritingStore, type ReviewStep } from "@/hooks/use-writing-store";

const AUTO_REVIEW_STEPS: ReviewStep[] = ["content", "style", "detail"];

async function streamSSEText(
  res: Response,
  onData: (chunk: string) => void
): Promise<void> {
  const reader = res.body?.getReader();
  if (!reader) throw new Error("无法读取响应");

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
        throw new Error(marker.slice(7).trim() || "流式处理失败");
      }
      onData(data);
    }
  }

  if (buffer.startsWith("data: ")) {
    const data = buffer.slice(6);
    const marker = data.trim();
    if (marker && marker !== "[DONE]") {
      if (marker.startsWith("[ERROR]")) {
        throw new Error(marker.slice(7).trim() || "流式处理失败");
      }
      onData(data);
    }
  }
}

export default function WritePage() {
  const {
    sourceContent,
    config,
    provider,
    modelId,
    apiKeys,
    isGenerating,
    isReviewing,
    setGeneratedArticle,
    setIsGenerating,
    setIsReviewing,
    setCurrentReviewStep,
    appendToArticle,
    loadApiKeys,
  } = useWritingStore();

  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);

  const handleGenerate = async () => {
    if (!sourceContent.trim()) {
      alert("请先输入素材内容");
      return;
    }

    const apiKey = apiKeys[provider];
    if (!apiKey) {
      alert("请先在设置中配置 API Key");
      return;
    }

    const selectedProvider = provider;
    const selectedModelId = modelId;

    setIsGenerating(true);
    setIsReviewing(false);
    setCurrentReviewStep(null);
    setGeneratedArticle("");

    try {
      let draftedArticle = "";
      const generateRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceContent,
          config,
          provider: selectedProvider,
          modelId: selectedModelId,
          apiKey,
        }),
      });

      if (!generateRes.ok) {
        const data = await generateRes.json();
        throw new Error(data.error || "生成失败");
      }

      await streamSSEText(generateRes, (chunk) => {
        draftedArticle += chunk;
        appendToArticle(chunk);
      });

      if (!draftedArticle.trim()) {
        throw new Error("生成内容为空");
      }

      setIsGenerating(false);
      setIsReviewing(true);

      let reviewedArticle = draftedArticle;

      for (const step of AUTO_REVIEW_STEPS) {
        setCurrentReviewStep(step);

        const reviewRes = await fetch("/api/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            article: reviewedArticle,
            reviewStep: step,
            provider: selectedProvider,
            modelId: selectedModelId,
            apiKey,
          }),
        });

        if (!reviewRes.ok) {
          const data = await reviewRes.json();
          throw new Error(data.error || "审校失败");
        }

        let stepResult = "";
        await streamSSEText(reviewRes, (chunk) => {
          stepResult += chunk;
          setGeneratedArticle(stepResult);
        });

        if (!stepResult.trim()) {
          throw new Error("审校结果为空");
        }

        reviewedArticle = stepResult;
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "生成失败");
    } finally {
      setIsGenerating(false);
      setIsReviewing(false);
      setCurrentReviewStep(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-3 flex flex-col gap-3">
        {/* Top Section: Input + Model + Generate */}
        <div className="flex gap-4 items-start">
          {/* Input Panel - takes most of the width */}
          <div className="flex-1 min-w-0">
            <InputPanel />
          </div>

          {/* Right side: Model selector + Generate button */}
          <div className="w-56 flex flex-col gap-3 shrink-0">
            <ModelSelector />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || isReviewing || !sourceContent.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  正在写作...
                </>
              ) : isReviewing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  正在三遍审校...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  开始写作
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Section: Config | Editor | Preview */}
        <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
          {/* Left: Config + Review */}
          <div className="col-span-3 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1">
            <WritingConfig />
            <ReviewPanel />
          </div>

          {/* Middle: Editor */}
          <div className="col-span-5 border border-border rounded-xl overflow-hidden">
            <ArticleEditor />
          </div>

          {/* Right: Preview */}
          <div className="col-span-4 border border-border rounded-xl overflow-hidden">
            <ArticlePreview />
          </div>
        </div>
      </div>
    </div>
  );
}
