# Vibe Writing

AI 写作与改稿工具，支持多模型生成、自动三遍审校，以及“发送修改意见后立即改稿”。

## 功能特性

- 多种输入方式：URL 抓取、Markdown/TXT 上传、直接粘贴素材。
- 一键写作：点击“开始写作”后自动执行三遍审校（内容 -> 风格 -> 细节）。
- 即时改稿：在“修改意见对话”输入意见并发送，系统直接改写当前文章，无需再次点击“开始写作”。
- Markdown 编辑器：支持自动排版（标题语法修复、段落拆分、间距优化）。
- 实时预览：编辑区与预览区同步展示。
- 本地 Key 管理：API Key 仅保存在浏览器本地存储。

## 模型支持

- OpenAI: `gpt-4o`, `gpt-4o-mini`
- Anthropic: `claude-sonnet-4-5-20250514`
- DeepSeek: `deepseek-chat`, `deepseek-reasoner`
- GLM (Zhipu): `glm-4.7`
  - 使用专属 Coding API 端点：`https://open.bigmodel.cn/api/coding/paas/v4`
- MiniMax: `MiniMax-M1`, `MiniMax-Text-01`
- Qwen: `qwen-plus`, `qwen-turbo`

## 快速开始

```bash
npm install
npm run dev
```

打开：`http://localhost:3000`

生产构建：

```bash
npm run build
npm run start
```

## 环境变量

复制 `.env.example` 并按需填写（也可在页面中直接配置 API Key）：

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `DEEPSEEK_API_KEY`
- `GLM_API_KEY`
- `MINIMAX_API_KEY`
- `QWEN_API_KEY`

> 注意：不要提交 `.env` 到仓库。

## 使用流程

1. 输入素材（URL / 上传 / 直接输入）。
2. 选择模型与写作配置。
3. 点击“开始写作”，系统生成并自动完成三遍审校。
4. 如需继续优化，在“修改意见对话”输入意见并发送，系统即时改稿。

## 项目结构

```text
app/                 # 页面与 API 路由
  api/               # generate/review/revise/fetch-url
components/          # UI 组件
hooks/               # Zustand 状态
lib/ai/              # 多模型 provider 适配
lib/prompts/         # 生成/审校/改写提示词
```

## 安全说明

- API Key 仅保存在浏览器本地（localStorage）。
- `.gitignore` 已忽略 `.env` 与 `.env.*`（保留 `.env.example`）。
