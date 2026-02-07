"use client";

import Link from "next/link";
import { PenLine, Settings } from "lucide-react";
import { useState } from "react";
import { ApiKeyDialog } from "./api-key-dialog";

export function Header() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <PenLine className="w-5 h-5" />
            <span className="font-semibold">Vibe Writing</span>
          </Link>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="API Key 设置"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>
      <ApiKeyDialog open={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
