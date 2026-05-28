# Image Studio

AI image generation workspace built with React + TypeScript + Vite.

中文文档：[`README_zh.md`](./README_zh.md)

## Screenshots

Desktop:

![Desktop Preview](./output/screenshot-final.png)

Mobile:

<p align="center">
  <img src="./output/screenshot-mobile.png" alt="Mobile Preview" width="260" />
</p>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=SummerSec/Gen-Image&type=Date)](https://www.star-history.com/#SummerSec/Gen-Image&Date)

## Features

- Prompt library from two upstream repositories (submodules):
  - `freestylefly/awesome-gpt-image-2`
  - `EvoLinkAI/awesome-gpt-image-2-API-and-Prompts`
- Localized prompt thumbnails copied into this project (`public/prompt-thumbs/**`)
- Prompt click behavior:
  - Fill prompt textarea
  - Load matching thumbnail into center preview
- Multi-image generation per prompt (`1-4` requests, one request per image)
- Reference image upload supports multi-select in one action
- Preview supports zoom in/out and reset
- API settings persisted in browser `localStorage`

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Zustand
- OpenAI JS SDK

## Requirements

- Node.js 20+ recommended
- Git (for submodules)
- (Optional) GitHub CLI for repository automation

## Quick Start

```bash
npm install
powershell -ExecutionPolicy Bypass -File scripts/setup-prompt-submodules.ps1
npm run sync:prompts
npm run dev
```

Open the URL printed by Vite (default `http://localhost:5173`).

## Available Scripts

- `npm run dev` - start dev server
- `npm run build` - type-check + production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint
- `npm run sync:prompts` - regenerate prompt data from submodules
- `npm run sync:prompts:update` - update submodules then regenerate prompt data

## Prompt Sync Workflow

Prompt sync script: `scripts/sync-prompts.mjs`

### Data Sources

- `EvoLinkAI`: extracts only Simplified Chinese cases from `cases/*_zh-CN.md`
- `freestylefly`: extracts case prompts from:
  - `docs/gallery-part-1.md`
  - `docs/gallery-part-2.md`
  - (does not use templates page)

### Thumbnail Strategy

- Images are copied from submodules to local public assets:
  - `public/prompt-thumbs/evolink/**`
  - `public/prompt-thumbs/freestylefly/**`
- Namespaces are isolated to avoid collisions.
- Generated prompt data references local paths only.

## Project Structure

```text
src/
  components/
  data/
    prompts.ts
    prompts.manual.ts
    prompts.generated.ts
  services/
  store/
scripts/
  setup-prompt-submodules.ps1
  sync-prompts.mjs
external/
  awesome-gpt-image-2
  awesome-gpt-image-2-api-prompts
public/
  prompt-thumbs/
```

## Notes

- `src/data/prompts.generated.ts` is auto-generated. Do not edit manually.
- If submodules are unavailable, app falls back to `prompts.manual.ts`.
- If prompt thumbnails fail to show, run:

```bash
npm run sync:prompts
```

## Friendship Link

Thanks for the support and feedback from the friends at [LINUX DO](https://linux.do/). 

