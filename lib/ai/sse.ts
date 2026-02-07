/**
 * SSE helpers for normalizing provider stream chunks.
 */

function extractNestedSSEPayload(input: string): string | null {
  const decoded = input.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
  const dataLines = decoded
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("data: "));

  if (dataLines.length === 0) return null;

  const payload = dataLines
    .map((line) => line.slice(6))
    .filter((line) => line && line !== "[DONE]" && !line.startsWith("[ERROR]"))
    .join("");

  return payload || null;
}

export function normalizeProviderChunk(chunk: string): string {
  if (!chunk) return "";

  const nestedPayload = extractNestedSSEPayload(chunk);
  if (nestedPayload !== null) {
    return nestedPayload;
  }

  if (chunk.startsWith("data: ")) {
    return chunk.slice(6);
  }

  return chunk;
}
