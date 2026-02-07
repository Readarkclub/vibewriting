/**
 * Vibe Writing prompt system.
 *
 * Provides all prompts for the article generation and review pipeline:
 *
 *   1. System prompt   - Core vibe-writing methodology (used as system message)
 *   2. Generate prompt  - Article generation from source material
 *   3. Content review   - First pass: factual accuracy and structure
 *   4. Style review     - Second pass: eliminate AI writing patterns (critical)
 *   5. Detail review    - Third pass: punctuation, spacing, rhythm polish
 */

export { getSystemPrompt } from "./system";
export { getGeneratePrompt } from "./generate";
export type { GenerateConfig } from "./generate";
export { getContentReviewPrompt } from "./review-content";
export { getStyleReviewPrompt } from "./review-style";
export { getDetailReviewPrompt } from "./review-detail";
export { getRevisePrompt } from "./revise";
