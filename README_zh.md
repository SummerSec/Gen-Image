# Image Studio

基于 React + TypeScript + Vite 的 AI 图像生成工作台,采用对话式工作流,接入任意 OpenAI 兼容的图像接口。

English README: [`README.md`](./README.md)

## 项目截图

桌面端：

![桌面端预览](./output/screenshot-final.png)

移动端：

<p align="center">
  <img src="./output/screenshot-mobile.png" alt="移动端预览" width="260" />
</p>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=SummerSec/Gen-Image&type=Date)](https://www.star-history.com/#SummerSec/Gen-Image&Date)

## 功能概览

- **对话式工作台**：中间是对话线程,底部是输入框,右侧为可折叠面板（提示词库 / 历史记录）。
- **提示词库**：通过子模块接入两个上游仓库,缩略图本地化到 `public/prompt-thumbs/**`。点击卡片即可填入提示词并设为参考图。
- **参考图**：支持多选上传、剪贴板粘贴、拖拽放入；生成结果可一键转为参考图；点击可放大预览。发送后参考图会被本次生成消费并清空。
- **多图生成**：单次可生成 1–4 张。
- **局部重绘（Inpainting）**：内置蒙版编辑器,涂抹区域后按提示词重绘。
- **生成计时**：生成过程中显示已用秒数。
- **历史记录**：持久化到浏览器 IndexedDB,可在设置中清空。
- **多套 API 配置**：保存多组 Base URL / 模型 / Key,随时切换。
- **接口模式**：可选 Images API（`/v1/images`）或 Responses API（`/v1/responses` + image_generation 工具）。
- **base64 返回开关**：可在请求体追加 `response_format: b64_json`。
- **CORS 代理**：可选,用于绕过浏览器跨域限制。
- **图片水印**：默认开启（右下角 `gen-img.sumsec.me`）,仅管理员可关闭。
- **浅色 Linear 风格界面**,正文字体为霞鹜文楷（LXGW WenKai）。
- 所有设置持久化到浏览器 `localStorage`。

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Zustand
- OpenAI JS SDK

## 环境要求

- 推荐 Node.js 20+
- Git（用于拉取子模块）
- （可选）GitHub CLI

## 快速开始

```bash
npm install
powershell -ExecutionPolicy Bypass -File scripts/setup-prompt-submodules.ps1
npm run sync:prompts
npm run dev
```

打开 Vite 输出的地址（默认 `http://localhost:5173`）。

首次进入请在 **设置 → API 配置** 中填写 Base URL、模型 ID 和 API Key。

## 环境变量

- `VITE_ADMIN_PASSWORD`：管理员密码。设置 → 接口选项 中输入该密码后,才可关闭图片水印。未配置时水印默认开启且不可关闭。

## 可用脚本

- `npm run dev` —— 启动开发服务器
- `npm run build` —— 类型检查 + 生产构建
- `npm run preview` —— 预览生产构建
- `npm run lint` —— 运行 ESLint
- `npm run sync:prompts` —— 从子模块重新生成提示词数据
- `npm run sync:prompts:update` —— 更新子模块后再重新生成提示词数据

## 提示词同步流程

同步脚本：`scripts/sync-prompts.mjs`

### 数据来源

- `EvoLinkAI`：仅提取 `cases/*_zh-CN.md` 中的简体中文案例
- `freestylefly`：提取 `docs/gallery-part-1.md`、`docs/gallery-part-2.md` 中的案例提示词

### 缩略图策略

- 图片从子模块复制到本地：
  - `public/prompt-thumbs/evolink/**`
  - `public/prompt-thumbs/freestylefly/**`
- 使用命名空间隔离,避免冲突。
- 生成的数据只引用本地路径。

## 目录结构

```text
src/
  components/
    chat/        对话线程与输入框（Conversation、Composer）
    layout/      顶栏、右侧面板
    canvas/      蒙版编辑器（局部重绘）
    settings/    设置弹窗
  data/
    prompts.ts
    prompts.manual.ts
    prompts.generated.ts
  services/      api.ts、idb.ts、watermark.ts
  store/         Zustand 状态
scripts/
  setup-prompt-submodules.ps1
  sync-prompts.mjs
external/
  awesome-gpt-image-2
  awesome-gpt-image-2-api-prompts
public/
  prompt-thumbs/
```

## 说明

- `src/data/prompts.generated.ts` 为自动生成,请勿手动修改。
- 子模块不可用时,应用会回退到 `prompts.manual.ts`。
- 缩略图不显示时,运行 `npm run sync:prompts`。

## 友情链接

感谢 [LINUX DO](https://linux.do/) 朋友们的支持与反馈。
