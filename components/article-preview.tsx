"use client";

import { useWritingStore } from "@/hooks/use-writing-store";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMemo } from "react";
import { formatMarkdownLayout } from "@/lib/markdown-format";

export function ArticlePreview() {
  const { generatedArticle, isGenerating } = useWritingStore();
  const renderedArticle = useMemo(
    () => formatMarkdownLayout(generatedArticle),
    [generatedArticle]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-3 py-2 border-b border-border">
        <span className="text-xs text-muted-foreground">预览</span>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
        {generatedArticle ? (
          <div className="prose-article max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {renderedArticle}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            {isGenerating ? (
              <div className="loading-dots">
                <span>·</span>
                <span>·</span>
                <span>·</span>
              </div>
            ) : (
              "文章预览"
            )}
          </div>
        )}
      </div>
    </div>
  );
}
