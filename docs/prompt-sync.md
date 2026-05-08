# 提示词子模块与自动更新

## 目标

通过 `git submodule` 引入两个提示词仓库，并在本地生成 `src/data/prompts.generated.ts`。同步时会把案例缩略图复制到当前项目 `public` 目录，前端只引用本地图片。

## 仓库来源

- `freestylefly/awesome-gpt-image-2`
- `EvoLinkAI/awesome-gpt-image-2-API-and-Prompts`

## 一次性初始化

在仓库根目录执行：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-prompt-submodules.ps1
```

如果你偏好手动命令：

```bash
git submodule add https://github.com/EvoLinkAI/awesome-gpt-image-2-API-and-Prompts external/awesome-gpt-image-2-api-prompts
git submodule add https://github.com/freestylefly/awesome-gpt-image-2 external/awesome-gpt-image-2
git submodule update --init --recursive
```

## 同步提示词

```bash
npm run sync:prompts
```

该命令会读取子模块内容并生成：

- `src/data/prompts.generated.ts`

当前提取策略：

- `EvoLinkAI`: 仅从 `cases/*_zh-CN.md` 抽取简体中文 Case Prompt
- `freestylefly`: 从 `docs/gallery-part-1.md` 与 `docs/gallery-part-2.md` 抽取案例提示词（不读取模板页）
- 缩略图：
  - `EvoLinkAI` 复制到 `public/prompt-thumbs/evolink/**`
  - `freestylefly` 复制到 `public/prompt-thumbs/freestylefly/**`
  - 两者目录隔离，避免命名冲突

## 更新策略

拉取上游并重建本地提示词：

```bash
npm run sync:prompts:update
```

等价于：

1. `git submodule update --init --remote --recursive`
2. `node scripts/sync-prompts.mjs`

## 前端读取策略

`src/data/prompts.ts` 会优先读取 `PROMPT_LIBRARY_GENERATED`，如果为空则回退到 `prompts.manual.ts`，保证任意环境可运行。
