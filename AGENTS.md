# Repository Guidelines

## Project Structure & Module Organization
This project is a Next.js App Router app.
- `app/`: routes, layouts, and API handlers (`app/api/*/route.ts`).
- `components/`: UI building blocks for writing, review, and model selection.
- `hooks/`: shared client state (`zustand`) such as `hooks/use-writing-store.ts`.
- `lib/ai/`: provider adapters (`openai`, `anthropic`, `deepseek`) and typed interfaces.
- `lib/prompts/`: generation/review prompt templates.
- `lib/`: shared utilities like URL fetching and class helpers.

Generated folders (`.next/`, `node_modules/`) are build artifacts and should not be edited manually.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: run local development server with Turbopack.
- `npm run build`: produce a production build.
- `npm run start`: serve the production build.
- `npm run lint`: run Next.js lint checks.

Before opening a PR, run: `npm run lint && npm run build`.

## Coding Style & Naming Conventions
- Language: TypeScript with `strict` mode enabled (`tsconfig.json`).
- Style in existing code: 2-space indentation, semicolons, double quotes.
- Components: export PascalCase React components; keep component files in `components/` using kebab-case filenames (for example, `article-preview.tsx`).
- Hooks: prefix with `use` (for example, `useWritingStore`).
- Imports: prefer path alias `@/` over deep relative paths.
- Keep API route handlers focused on request/response flow; place reusable logic in `lib/`.

## Testing Guidelines
No dedicated automated test suite is currently configured. Treat `npm run lint` and `npm run build` as required checks.
- If adding tests, use `*.test.ts` / `*.test.tsx` naming.
- Place tests near source files or under a local `__tests__/` folder.
- For API changes, include at least one reproducible request example in the PR description.

## Commit & Pull Request Guidelines
Local `.git` history is not available in this checkout, so follow a clear, conventional format:
- Commit format: `<type>: <imperative summary>` (for example, `fix: handle empty SSE chunks`).
- Keep commits scoped to one logical change.

PRs should include:
- Problem and solution summary.
- Linked issue/task (if applicable).
- Validation steps and command output notes.
- UI screenshots for visible changes.

## Security & Configuration Tips
- Start from `.env.example`; keep real keys in local environment files only.
- Never commit API keys or provider secrets.
- Avoid logging raw credentials in client or server code.
