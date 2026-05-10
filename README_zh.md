# Image Studio

一个基于 React + TypeScript + Vite 的 AI 图像生成工作台。

English README: [`README.md`](./README.md)

## 项目截图

桌面端：

![桌面端预览](./output/screenshot-final.png)

移动端：

<p align="center">
  <img src="./output/screenshot-mobile.png" alt="移动端预览" width="260" />
</p>

## 功能概览

- 通过子模块接入两个提示词仓库：
  - `freestylefly/awesome-gpt-image-2`
  - `EvoLinkAI/awesome-gpt-image-2-API-and-Prompts`
- 提示词缩略图本地化到项目内（`public/prompt-thumbs/**`）
- 点击提示词卡片时：
  - 自动写入提示词输入框
  - 自动加载对应图片到中间预览区
- 支持一次生成多张图（`1-4` 张，严格一张一请求）
- 参考图支持一次多选上传
- 中间预览支持放大/缩小/重置
- API 设置持久化到浏览器 `localStorage`

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Zustand
- OpenAI JavaScript SDK

## 环境要求

- 建议 Node.js 20+
- Git（用于子模块）
- （可选）GitHub CLI（用于仓库自动化）

## 快速开始

```bash
npm install
powershell -ExecutionPolicy Bypass -File scripts/setup-prompt-submodules.ps1
npm run sync:prompts
npm run dev
```

启动后访问 Vite 输出地址（默认 `http://localhost:5173`）。

## 常用命令

- `npm run dev`：启动开发服务器
- `npm run build`：类型检查 + 生产构建
- `npm run preview`：预览生产构建
- `npm run lint`：运行 ESLint
- `npm run sync:prompts`：基于子模块重新生成提示词数据
- `npm run sync:prompts:update`：更新子模块后重新生成提示词数据

## 提示词同步说明

同步脚本：`scripts/sync-prompts.mjs`

### 数据来源策略

- `EvoLinkAI`：只抽取 `cases/*_zh-CN.md`（简体中文案例）
- `freestylefly`：从以下画廊案例中抽取（不读模板页）：
  - `docs/gallery-part-1.md`
  - `docs/gallery-part-2.md`

### 图片处理策略

- 同步时将子模块图片复制到本地：
  - `public/prompt-thumbs/evolink/**`
  - `public/prompt-thumbs/freestylefly/**`
- 两个来源使用不同目录，避免同名覆盖冲突。
- 最终生成数据只引用本地路径，不依赖远程 raw 链接。

## 目录结构

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

## 注意事项

- `src/data/prompts.generated.ts` 为自动生成文件，请勿手改。
- 子模块缺失时会自动回退到 `prompts.manual.ts`。
- 如果提示词图片显示异常，先执行：

```bash
npm run sync:prompts
```
