function splitLongParagraph(block: string): string {
  const compact = block.replace(/\n+/g, " ").trim();
  if (compact.length < 90) return compact;

  const sentences = compact.match(/[^。！？!?]+[。！？!?]?/g);
  if (!sentences || sentences.length < 2) return compact;

  const result: string[] = [];
  let current = "";
  let sentenceCount = 0;

  for (const sentenceRaw of sentences) {
    const sentence = sentenceRaw.trim();
    if (!sentence) continue;

    if (!current) {
      current = sentence;
      sentenceCount = 1;
      continue;
    }

    const next = `${current}${sentence}`;
    if (next.length > 110 || sentenceCount >= 2) {
      result.push(current.trim());
      current = sentence;
      sentenceCount = 1;
    } else {
      current = next;
      sentenceCount += 1;
    }
  }

  if (current) result.push(current.trim());
  return result.join("\n\n");
}

function splitOverlongHeadingLine(line: string): string {
  const match = line.match(/^(#{1,6})\s*(.+)$/);
  if (!match) return line.trim();

  const level = match[1];
  const body = match[2].trim();
  if (!body) return `${level} `;

  if (body.length <= 28 && !/[。！？!?]/.test(body)) {
    return `${level} ${body}`;
  }

  const hardStops: number[] = [];
  const softStops: number[] = [];

  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];
    if ("。！？!?".includes(ch)) hardStops.push(i);
    if ("，,:：；;".includes(ch)) softStops.push(i);
  }

  const pickInRange = (arr: number[], min: number, max: number): number =>
    arr.find((idx) => idx >= min && idx <= max) ?? -1;

  let cutIndex = pickInRange(hardStops, 10, 42);
  if (cutIndex === -1) cutIndex = pickInRange(softStops, 10, 34);
  if (cutIndex === -1) cutIndex = pickInRange(hardStops, 8, 60);
  if (cutIndex === -1) cutIndex = pickInRange(softStops, 8, 48);

  // Fallback for very long heading-like lines without clear punctuation.
  if (cutIndex === -1 && body.length >= 45) {
    cutIndex = 22;
  }

  if (cutIndex === -1) return `${level} ${body}`;

  const title = body.slice(0, cutIndex).trim();
  const rest = body
    .slice(cutIndex + 1)
    .replace(/^[\s，,:：。！？!?]+/, "")
    .trim();

  if (!title || !rest) return `${level} ${body}`;
  return `${level} ${title}\n\n${rest}`;
}

export function formatMarkdownLayout(content: string): string {
  let text = content.replace(/\r\n/g, "\n");
  text = text.replace(/[ \t]+$/gm, "");

  // Normalize heading syntax: "#Title" -> "# Title"
  text = text.replace(/(^|\n)(#{1,6})([^\s#\n])/g, "$1$2 $3");

  // Move inline headings to a new line if they appear after punctuation.
  text = text.replace(/([。！？!?；;])\s*(#{1,6}\s*)/g, "$1\n\n$2");
  text = text.replace(/([^\n])\n(#{1,6}\s)/g, "$1\n\n$2");
  text = text.replace(/(^|\n)(#{1,6}\s[^\n]+)\n(?!\n)/g, "$1$2\n\n");

  const blocks = text.split(/\n{2,}/);
  const normalizedBlocks = blocks
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (/^#{1,6}\s/.test(block)) {
        return splitOverlongHeadingLine(block);
      }

      if (
        /^[-*+]\s/.test(block) ||
        /^\d+\.\s/.test(block) ||
        /^>\s/.test(block) ||
        /^```/.test(block)
      ) {
        return block;
      }

      return splitLongParagraph(block);
    });

  text = normalizedBlocks.join("\n\n");
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}
