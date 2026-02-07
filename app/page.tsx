import Link from "next/link";
import {
  PenLine,
  Sparkles,
  Shield,
  FileText,
  Link as LinkIcon,
  Upload,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenLine className="w-6 h-6" />
            <span className="text-lg font-semibold">Vibe Writing</span>
          </div>
          <Link
            href="/write"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            开始写作
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          写出有温度的文章
        </h1>
        <p className="text-lg text-muted-foreground mb-2">
          像和朋友聊天一样写作，不是写论文
        </p>
        <p className="text-muted-foreground mb-10">
          输入素材，AI 帮你写出高质量、低 AI 味的中文内容
        </p>
        <Link
          href="/write"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:opacity-90 transition-opacity"
        >
          <Sparkles className="w-5 h-5" />
          开始写作
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Input Methods */}
          <div className="border border-border rounded-xl p-6">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-semibold mb-2">多种输入方式</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              粘贴链接自动抓取内容，上传 Markdown 文件，或直接输入文字素材
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-xs bg-muted px-2.5 py-1 rounded-full">
                <LinkIcon className="w-3 h-3" /> URL 抓取
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-muted px-2.5 py-1 rounded-full">
                <Upload className="w-3 h-3" /> MD 上传
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-muted px-2.5 py-1 rounded-full">
                <PenLine className="w-3 h-3" /> 直接输入
              </span>
            </div>
          </div>

          {/* AI Models */}
          <div className="border border-border rounded-xl p-6">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-semibold mb-2">多模型支持</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              支持 OpenAI、Claude、DeepSeek 等主流大模型，自由切换选择最适合的
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs bg-muted px-2.5 py-1 rounded-full">GPT-4o</span>
              <span className="text-xs bg-muted px-2.5 py-1 rounded-full">Claude</span>
              <span className="text-xs bg-muted px-2.5 py-1 rounded-full">DeepSeek</span>
            </div>
          </div>

          {/* Anti-AI */}
          <div className="border border-border rounded-xl p-6">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold mb-2">三遍审校降 AI 味</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              内容审校、风格降 AI 味、细节打磨，三遍审校让文章更真实自然
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs bg-muted px-2.5 py-1 rounded-full">内容审校</span>
              <span className="text-xs bg-muted px-2.5 py-1 rounded-full">降 AI 味</span>
              <span className="text-xs bg-muted px-2.5 py-1 rounded-full">细节打磨</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>Vibe Writing - 基于 Vibe Writing 方法论的 AI 写作助手</p>
      </footer>
    </div>
  );
}
