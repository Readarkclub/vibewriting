import * as cheerio from "cheerio";

export async function fetchUrlContent(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  // Remove unwanted elements
  $("script, style, nav, footer, header, aside, .sidebar, .ad, .advertisement, .comment, .comments, #comments").remove();

  // Try to find main content
  const selectors = [
    "article",
    '[role="main"]',
    ".post-content",
    ".article-content",
    ".entry-content",
    ".content",
    "main",
    "#content",
    ".post",
  ];

  let content = "";

  for (const selector of selectors) {
    const el = $(selector);
    if (el.length > 0) {
      content = el.first().text().trim();
      if (content.length > 100) break;
    }
  }

  // Fallback to body
  if (content.length < 100) {
    content = $("body").text().trim();
  }

  // Clean up whitespace
  content = content
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Get title
  const title = $("title").text().trim() || $("h1").first().text().trim();

  if (title) {
    content = `# ${title}\n\n${content}`;
  }

  return content;
}
