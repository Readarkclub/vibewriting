"use client";

import { useState } from "react";
import { Link, Upload, PenLine, Loader2 } from "lucide-react";
import { useWritingStore, type InputMode } from "@/hooks/use-writing-store";
import { cn } from "@/lib/utils";

const TABS: { id: InputMode; label: string; icon: typeof Link }[] = [
  { id: "url", label: "链接抓取", icon: Link },
  { id: "upload", label: "上传文件", icon: Upload },
  { id: "input", label: "直接输入", icon: PenLine },
];

export function InputPanel() {
  const {
    inputMode,
    setInputMode,
    sourceContent,
    setSourceContent,
    sourceUrl,
    setSourceUrl,
  } = useWritingStore();

  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const handleFetchUrl = async () => {
    if (!sourceUrl.trim()) return;
    setFetching(true);
    setFetchError("");
    try {
      const res = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "抓取失败");
      setSourceContent(data.content);
      setFetchError("");
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "抓取失败");
    } finally {
      setFetching(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setSourceContent(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.name.endsWith(".md") && !file.name.endsWith(".txt")) {
      setFetchError("请上传 .md 或 .txt 文件");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setSourceContent(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setInputMode(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm transition-colors",
                inputMode === tab.id
                  ? "bg-background font-medium border-b-2 border-primary"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4">
        {inputMode === "url" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="输入文章链接，如 https://..."
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={handleFetchUrl}
                disabled={fetching || !sourceUrl.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {fetching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "抓取"
                )}
              </button>
            </div>
            {fetchError && (
              <p className="text-xs text-destructive">{fetchError}</p>
            )}
            {sourceContent && inputMode === "url" && (
              <div className="text-xs text-muted-foreground">
                已抓取 {sourceContent.length} 字
              </div>
            )}
          </div>
        )}

        {inputMode === "upload" && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors"
          >
            <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              拖拽 .md 或 .txt 文件到这里
            </p>
            <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm cursor-pointer hover:opacity-80 transition-opacity">
              <Upload className="w-3.5 h-3.5" />
              选择文件
              <input
                type="file"
                accept=".md,.txt,.markdown"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {sourceContent && (
              <p className="mt-3 text-xs text-muted-foreground">
                已加载 {sourceContent.length} 字
              </p>
            )}
          </div>
        )}

        {inputMode === "input" && (
          <textarea
            value={sourceContent}
            onChange={(e) => setSourceContent(e.target.value)}
            placeholder="在这里粘贴或输入素材内容...&#10;&#10;可以是文章大纲、笔记、想法、参考资料等任何文字内容"
            className="w-full h-48 px-3 py-2 border border-border rounded-lg text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring custom-scrollbar"
          />
        )}

        {/* Shared content preview for url/upload modes */}
        {inputMode !== "input" && sourceContent && (
          <textarea
            value={sourceContent}
            onChange={(e) => setSourceContent(e.target.value)}
            className="mt-3 w-full h-40 px-3 py-2 border border-border rounded-lg text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring custom-scrollbar"
            placeholder="抓取/上传的内容会显示在这里，你可以编辑"
          />
        )}
      </div>
    </div>
  );
}
