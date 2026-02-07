/**
 * Article generation prompt.
 *
 * Takes a configuration object describing the desired article type,
 * audience, style, word count, and optional extra instructions.
 * Returns a prompt that instructs the AI to analyze source material,
 * create an outline, and produce a full vibe-writing article.
 */

export interface GenerateConfig {
  /** Article format: wechat public account, blog post, newsletter, or tutorial */
  articleType: "wechat" | "blog" | "newsletter" | "tutorial";
  /** Target audience */
  audience: "tech" | "pm" | "startup" | "general";
  /** Writing style */
  style: "casual" | "professional" | "humorous";
  /** Target word count range, e.g. "2000-4000" */
  wordCount: string;
  /** Additional instructions from the user */
  extraInstructions: string;
}

const ARTICLE_TYPE_LABELS: Record<GenerateConfig["articleType"], string> = {
  wechat: "微信公众号文章",
  blog: "博客文章",
  newsletter: "Newsletter / 邮件通讯",
  tutorial: "教程 / 操作指南",
};

const AUDIENCE_LABELS: Record<GenerateConfig["audience"], string> = {
  tech: "技术从业者（开发者、工程师）",
  pm: "产品经理和设计师",
  startup: "创业者和商业人士",
  general: "泛互联网读者",
};

const STYLE_DESCRIPTIONS: Record<GenerateConfig["style"], string> = {
  casual: `轻松随意，像朋友聊天。多用「我」开头，多加感叹和吐槽。语气词可以多一点：吧、呢、嘛、啊。可以适当用一些网络用语，但不要太过。`,
  professional: `专业但不端着。该严肃的地方严肃，但整体还是说人话。少用术语堆砌，复杂概念要用大白话解释清楚。保持「懂行的朋友在分享经验」的感觉。`,
  humorous: `幽默风趣，善于用类比和比喻。可以自嘲，可以吐槽，但不要硬凑段子。幽默感要自然流露，不要每句都试图搞笑。关键信息还是要讲清楚。`,
};

const ARTICLE_TYPE_STRUCTURE: Record<GenerateConfig["articleType"], string> = {
  wechat: `### 微信公众号文章结构要求
- 标题要有吸引力，但不要标题党。可以用数字、疑问、反常识
- 开头 2-3 句话必须抓住读者，可以用一个故事、一个问题、或一个反直觉的观点
- 正文分 3-5 个小节，每节有小标题
- 小标题要有信息量，不要用「第一步」「第二步」这种空洞标题
- 结尾不要喊口号，可以做个简短的总结或者抛出一个开放性问题
- 全文适合手机阅读：短段落、短句子、多留白`,

  blog: `### 博客文章结构要求
- 标题清晰直接，让读者知道能学到什么
- 开头说清楚这篇文章要解决什么问题
- 正文可以更深入，允许较长的分析段落
- 可以包含代码片段、配置示例等技术细节
- 用小标题和列表帮助读者快速定位
- 结尾可以有「下一步」建议或相关资源链接`,

  newsletter: `### Newsletter 结构要求
- 用对话式的语气，像写信一样
- 开头可以聊聊最近的见闻或感想，自然引出主题
- 内容精炼，一个 newsletter 聚焦 1-3 个核心观点
- 每个观点用 2-3 段讲清楚
- 可以穿插个人经历和思考
- 结尾可以预告下期内容或邀请读者互动`,

  tutorial: `### 教程结构要求
- 标题明确：「如何 XX」或「XX 入门指南」
- 开头说清楚：读完能学会什么、需要什么前置知识、大概要花多长时间
- 步骤清晰，用数字编号
- 每个步骤要有：做什么、为什么这样做、可能踩的坑
- 重要警告和常见错误单独标出
- 结尾给一个完整的总结清单或 checklist`,
};

export function getGeneratePrompt(config: GenerateConfig): string {
  const typeLabel = ARTICLE_TYPE_LABELS[config.articleType];
  const audienceLabel = AUDIENCE_LABELS[config.audience];
  const styleDesc = STYLE_DESCRIPTIONS[config.style];
  const structureGuide = ARTICLE_TYPE_STRUCTURE[config.articleType];

  const extraBlock = config.extraInstructions.trim()
    ? `\n## 额外要求\n\n${config.extraInstructions.trim()}\n`
    : "";

  return `## 任务

根据用户提供的素材，写一篇高质量的${typeLabel}。

## 写作流程

请严格按以下三个阶段执行：

### 阶段一：素材分析

先仔细阅读用户提供的所有素材（可能是笔记、大纲、参考文章、关键词等），提取：
- 核心主题和关键论点
- 可以直接使用的事实、数据、案例（仅使用素材中提供的，不要编造）
- 素材中的独特观点或有趣角度
- 素材中缺失但需要补充的内容（用你的知识补充，但标注「这是我的理解」）

### 阶段二：拟定大纲

基于素材分析，在脑中构建文章大纲：
- 确定文章的核心论点（一句话能说清楚的那种）
- 规划 3-5 个主要段落的核心内容
- 确定开头的钩子（用什么方式抓住读者）
- 确定结尾的落点（留下什么印象）

### 阶段三：写作输出

按照大纲写出完整文章，全程遵守系统提示中的 Vibe Writing 方法论。

## 文章参数

- **文章类型**：${typeLabel}
- **目标读者**：${audienceLabel}
- **字数要求**：${config.wordCount} 字
- **写作风格**：${styleDesc}

${structureGuide}

## 写作风格细化

针对目标读者（${audienceLabel}），注意：
${getAudienceGuidance(config.audience)}
${extraBlock}
## 输出要求

1. 直接输出 Markdown 格式的文章正文
2. 不要输出素材分析过程和大纲（在内部完成即可）
3. 不要在文章前后加任何解释性文字
4. 文章必须包含标题（用 # 一级标题）
5. 字数要在 ${config.wordCount} 字范围内

## 最终检查

输出前，在内部确认以下几点：
- [ ] 没有使用任何 AI 味词汇（检查系统提示中的禁用列表）
- [ ] 所有句子都在 30 字以内
- [ ] 有至少 5 处个人观点或情感表达
- [ ] 没有编造任何数据或案例
- [ ] 中英文之间有空格
- [ ] 使用了「」引号而不是 ""
- [ ] 段落短小，适合手机阅读`;
}

function getAudienceGuidance(audience: GenerateConfig["audience"]): string {
  switch (audience) {
    case "tech":
      return `- 可以使用技术术语，但首次出现时简单解释
- 技术细节要准确，不确定的地方坦诚说明
- 可以聊聊实际开发中的踩坑经验
- 代码示例要可运行、有注释
- 不要居高临下地「科普」，假设读者有基础`;

    case "pm":
      return `- 少用技术术语，多用业务语言
- 关注「为什么」比「怎么做」更重要
- 多用真实产品案例来解释概念
- 可以聊聊需求沟通、团队协作中的真实场景
- 数据和指标用读者能理解的方式呈现`;

    case "startup":
      return `- 关注商业价值和实际回报
- 案例要有具体的数字和结果（仅使用素材提供的）
- 避免空泛的「赋能」「生态」等词
- 务实导向，少讲概念多讲方法
- 考虑资源有限的现实情况`;

    case "general":
      return `- 所有专业概念都要用大白话解释
- 多用类比和生活化的例子
- 不要假设读者有任何专业背景
- 保持轻松有趣的语气
- 重点讲「这跟我有什么关系」`;
  }
}
