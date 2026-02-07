"use client";

import { useWritingStore } from "@/hooks/use-writing-store";
import { Copy, Download, FileText, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatMarkdownLayout } from "@/lib/markdown-format";

export function ArticleEditor() {
  const { generatedArticle, setGeneratedArticle, isGenerating, isReviewing } =
    useWritingStore();
  const [copied, setCopied] = useState(false);
  const [formatted, setFormatted] = useState(false);
  const wasBusyRef = useRef(isGenerating || isReviewing);

  useEffect(() => {
    const isBusy = isGenerating || isReviewing;

    // Auto-format once after generation/review is fully done.
    if (wasBusyRef.current && !isBusy && generatedArticle.trim()) {
      const formatted = formatMarkdownLayout(generatedArticle);
      if (formatted !== generatedArticle) {
        setGeneratedArticle(formatted);
      }
    }

    wasBusyRef.current = isBusy;
  }, [generatedArticle, isGenerating, isReviewing, setGeneratedArticle]);

  const handleCopyMarkdown = async () => {
    await navigator.clipboard.writeText(generatedArticle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPlainText = async () => {
    const plain = generatedArticle
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^[-*+]\s/gm, "")
      .replace(/^\d+\.\s/gm, "")
      .replace(/^>\s/gm, "")
      .replace(/---/g, "")
      .replace(/\n{3,}/g, "\n\n");
    await navigator.clipboard.writeText(plain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedArticle], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "article.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFormatLayout = () => {
    if (!generatedArticle.trim()) return;
    const formatted = formatMarkdownLayout(generatedArticle);
    setGeneratedArticle(formatted);
    setFormatted(true);
    setTimeout(() => setFormatted(false), 1500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground">
          Markdown 编辑器
          {generatedArticle && ` · ${generatedArticle.length} 字`}
        </span>

        {generatedArticle && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleFormatLayout}
              className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
              title="修复标题语法并优化段落间距"
              disabled={isGenerating || isReviewing}
            >
              <Sparkles className="w-3 h-3" />
              {formatted ? "已排版" : "自动排版"}
            </button>
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
              title="复制 Markdown"
            >
              <Copy className="w-3 h-3" />
              {copied ? "已复制" : "复制 MD"}
            </button>
            <button
              onClick={handleCopyPlainText}
              className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
              title="复制纯文本（适合粘贴到公众号）"
            >
              <FileText className="w-3 h-3" />
              纯文本
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
              title="下载 .md 文件"
            >
              <Download className="w-3 h-3" />
              下载
            </button>
          </div>
        )}
      </div>

      <div className="px-4 pt-2 text-[11px] text-muted-foreground border-b border-border/60">
        标题建议：`# 一级标题` / `## 二级标题`（井号后加空格），段落之间保留空行可提升可读性
      </div>

      {/* Editor */}
      <textarea
        value={generatedArticle}
        onChange={(e) => setGeneratedArticle(e.target.value)}
        placeholder={
          isGenerating || isReviewing
            ? "正在生成与审校中..."
            : "生成的文章会显示在这里，你也可以直接编辑 Markdown..."
        }
        className="markdown-editor flex-1 w-full px-5 py-4 text-[15px] leading-8 bg-background resize-none focus:outline-none custom-scrollbar"
        readOnly={isGenerating || isReviewing}
      />
    </div>
  );
}
