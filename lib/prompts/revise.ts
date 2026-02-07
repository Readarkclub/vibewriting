/**
 * Prompt for instant article revision by user instruction.
 */

export function getRevisePrompt(instruction: string): string {
  return `## Task: Revise the Article Using the New Instruction
You will receive an article and one new revision instruction. Rewrite the article directly based on the instruction and output the full updated version.

### Revision Instruction
${instruction}

### Requirements
1. Apply the instruction faithfully and do not skip key points.
2. Keep the original core meaning and structure unless the instruction asks for major rewrite.
3. Keep Markdown format.
4. Do not output explanations, notes, comparisons, or lead-in text.
5. Output only the fully revised article content.`;
}
