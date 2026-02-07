import { NextRequest, NextResponse } from "next/server";
import { fetchUrlContent } from "@/lib/url-fetcher";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "请提供有效的 URL" }, { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "URL 格式不正确" }, { status: 400 });
    }

    const content = await fetchUrlContent(url);

    if (!content || content.length < 10) {
      return NextResponse.json(
        { error: "未能从该页面提取到有效内容" },
        { status: 422 }
      );
    }

    return NextResponse.json({ content });
  } catch (err) {
    const message = err instanceof Error ? err.message : "抓取失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
