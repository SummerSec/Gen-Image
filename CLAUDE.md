# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

React 19 + TypeScript 6 + Vite 8 + Tailwind CSS v4 + Zustand 5 + OpenAI SDK 6

## Commands

```bash
npm run dev               # Start dev server (http://localhost:5173)
npm run build             # TypeScript check + production build
npm run lint              # ESLint
npm run sync:prompts      # Generate prompts.generated.ts from external submodules
npm run sync:prompts:update  # Update submodules + regenerate prompts
```

After modifying `src/data/prompts.generated.ts`, the build will produce a separate chunk for it — this is intentional code-splitting.

## Architecture

### Layout (3-column desktop, single-column mobile)

```
Topbar (h-16, flex, border-b)
├── LeftPanel (w-[280px], scrollable)
│   ├── PromptCard (textarea + reference images + footer with resolution + 生成 button)
│   ├── Negative prompt input
│   ├── Model select
│   ├── Type grid (4-col: UI/UE/立绘/3D/二次元/写实/特效/场景原画)
│   ├── Aspect ratio grid (5-col: 正方形/竖版/横版/全屏/宽屏)
│   └── Detail intensity slider (柔和—锐利)
├── CanvasArea (flex-1, centered)
│   ├── Image stage (empty placeholder / loading spinner / generated image)
│   ├── Action bar: 生成 button + undo/redo/upload/download/save/share/delete icons
│   └── History thumbnail strip
└── RightPanel (w-[320px] xl:w-[360px])
    ├── Search + source filter (all/EvoLinkAI) + category tabs
    └── 2-column prompt card grid with infinite scroll
```

Mobile (below `lg` breakpoint): bottom tab bar switches between LeftPanel / CanvasArea / RightPanel.

### State Management (Zustand)

`src/store/useStore.ts` — single store with `persist` middleware. Only `apiKey` and `baseUrl` are persisted to localStorage under key `gen-image-settings`. All other state (prompt, model, history, etc.) is session-only.

### API Layer

`src/services/api.ts` uses OpenAI SDK with `dangerouslyAllowBrowser: true`. Two endpoints:
- **Text-to-image**: `POST /gpt/v1/images/generations` (when no reference images)
- **Image edit**: `POST /gpt/v1/chat/completions` (when reference images present, with base64-encoded images in message content)

API base URL and key are configured via the ⚙ Settings modal (Topbar gear icon).

### Prompt Data

`src/data/prompts.ts` is the entry point:
- `getPromptLibrary()` returns current prompts (manual 18 by default, auto-switches to generated after load)
- `hasMorePrompts()` / `loadMorePrompts()` — dynamic `import('./prompts.generated')` for infinite scroll
- `PROMPT_LIBRARY_MANUAL` (18 curated cards with thumbnails) in `src/data/prompts.manual.ts`
- `PROMPT_LIBRARY_GENERATED` (373 auto-generated) in `src/data/prompts.generated.ts`

### Git Submodules

Two prompt repositories as submodules under `external/`:
- `external/awesome-gpt-image-2` (freestylefly, 378 cases)
- `external/awesome-gpt-image-2-api-prompts` (EvoLinkAI, 415 cases)

`scripts/sync-prompts.mjs` parses both repos' markdown and generates `prompts.generated.ts`. Only runnable when submodules are initialized.

### Key Patterns

- **No routing** — single-page app, everything in `App.tsx`
- **Tailwind v4** — uses `@tailwindcss/vite` plugin, no `tailwind.config.js`, CSS-first config via `@theme` in `index.css`
- **Strict TypeScript** — `noUnusedLocals` and `noUnusedParameters` enabled, `verbatimModuleSyntax` for imports
- **Icons** — inline SVGs in components, no icon library dependency
- **CSS scrollbar hiding** — `.scrollbar-hide` utility class
- **Custom events** — LeftPanel's 生成 button dispatches `CustomEvent('trigger-generate')` that CanvasArea listens for
