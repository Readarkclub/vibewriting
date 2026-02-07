import { create } from "zustand";

export type ModelProvider =
  | "openai"
  | "anthropic"
  | "deepseek"
  | "glm"
  | "minimax"
  | "qwen";

export type ModelId =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "claude-sonnet-4-5-20250514"
  | "deepseek-chat"
  | "deepseek-reasoner"
  | "glm-4.7"
  | "glm-4.5-air"
  | "glm-4.5"
  | "MiniMax-M1"
  | "MiniMax-Text-01"
  | "qwen-plus"
  | "qwen-turbo";

export type ArticleType = "wechat" | "blog" | "newsletter" | "tutorial";
export type Audience = "tech" | "pm" | "startup" | "general";
export type WritingStyle = "casual" | "professional" | "humorous";
export type InputMode = "url" | "upload" | "input";

export type ReviewStep = "content" | "style" | "detail";

export interface ApiKeys {
  openai: string;
  anthropic: string;
  deepseek: string;
  glm: string;
  minimax: string;
  qwen: string;
}

export interface WritingConfig {
  articleType: ArticleType;
  audience: Audience;
  style: WritingStyle;
  wordCount: string;
  extraInstructions: string;
}

interface WritingState {
  // Input
  inputMode: InputMode;
  sourceContent: string;
  sourceUrl: string;

  // Config
  config: WritingConfig;

  // Model
  provider: ModelProvider;
  modelId: ModelId;
  apiKeys: ApiKeys;

  // Output
  generatedArticle: string;
  isGenerating: boolean;

  // Review
  currentReviewStep: ReviewStep | null;
  isReviewing: boolean;
  reviewResult: string;

  // Actions
  setInputMode: (mode: InputMode) => void;
  setSourceContent: (content: string) => void;
  setSourceUrl: (url: string) => void;
  setConfig: (config: Partial<WritingConfig>) => void;
  setProvider: (provider: ModelProvider) => void;
  setModelId: (modelId: ModelId) => void;
  setApiKey: (provider: ModelProvider, key: string) => void;
  setGeneratedArticle: (article: string) => void;
  appendToArticle: (chunk: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setCurrentReviewStep: (step: ReviewStep | null) => void;
  setIsReviewing: (reviewing: boolean) => void;
  setReviewResult: (result: string) => void;
  loadApiKeys: () => void;
}

const DEFAULT_CONFIG: WritingConfig = {
  articleType: "wechat",
  audience: "general",
  style: "casual",
  wordCount: "2000-4000",
  extraInstructions: "",
};

const EMPTY_API_KEYS: ApiKeys = {
  openai: "",
  anthropic: "",
  deepseek: "",
  glm: "",
  minimax: "",
  qwen: "",
};

export const useWritingStore = create<WritingState>((set) => ({
  // Input
  inputMode: "input",
  sourceContent: "",
  sourceUrl: "",

  // Config
  config: DEFAULT_CONFIG,

  // Model
  provider: "openai",
  modelId: "gpt-4o",
  apiKeys: EMPTY_API_KEYS,

  // Output
  generatedArticle: "",
  isGenerating: false,

  // Review
  currentReviewStep: null,
  isReviewing: false,
  reviewResult: "",

  // Actions
  setInputMode: (mode) => set({ inputMode: mode }),
  setSourceContent: (content) => set({ sourceContent: content }),
  setSourceUrl: (url) => set({ sourceUrl: url }),
  setConfig: (config) =>
    set((state) => ({ config: { ...state.config, ...config } })),
  setProvider: (provider) => {
    const modelMap: Record<ModelProvider, ModelId> = {
      openai: "gpt-4o",
      anthropic: "claude-sonnet-4-5-20250514",
      deepseek: "deepseek-chat",
      glm: "glm-4.7",
      minimax: "MiniMax-M1",
      qwen: "qwen-plus",
    };
    set({ provider, modelId: modelMap[provider] });
  },
  setModelId: (modelId) => set({ modelId }),
  setApiKey: (provider, key) => {
    set((state) => {
      const newKeys = { ...state.apiKeys, [provider]: key };
      if (typeof window !== "undefined") {
        localStorage.setItem("vibe-writing-keys", JSON.stringify(newKeys));
      }
      return { apiKeys: newKeys };
    });
  },
  setGeneratedArticle: (article) => set({ generatedArticle: article }),
  appendToArticle: (chunk) =>
    set((state) => ({ generatedArticle: state.generatedArticle + chunk })),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setCurrentReviewStep: (step) => set({ currentReviewStep: step }),
  setIsReviewing: (reviewing) => set({ isReviewing: reviewing }),
  setReviewResult: (result) => set({ reviewResult: result }),
  loadApiKeys: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vibe-writing-keys");
      if (stored) {
        try {
          const keys = JSON.parse(stored) as Partial<ApiKeys>;
          set({ apiKeys: { ...EMPTY_API_KEYS, ...keys } });
        } catch {
          // ignore
        }
      }
    }
  },
}));
