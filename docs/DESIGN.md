# DESIGN.md — Image Studio (Linear-adapted, dark tool theme)

来源参考：Linear（VoltAgent/awesome-design-md）。本文件是面向本项目「三栏图像生成工作台」的落地适配版。

## 主题与氛围
深色画布让生成图片成为主角；靠「表面层级 + 发丝边框」而非阴影建立层次；薰衣草蓝作为唯一强调色，仅用于主 CTA / 焦点环 / 品牌标。

## 颜色 tokens
```
--accent:        #5e6ad2   /* 主 CTA、焦点、品牌标（克制使用） */
--accent-hover:  #828fff
--accent-focus:  #5e69d1
--canvas:        #010102   /* 页面底色，勿用纯黑 #000 */
--surface-1:     #0f1011   /* 卡片 / 面板 */
--surface-2:     #141516   /* 悬浮 / 选中态 */
--surface-3:     #18191a   /* 下拉 / 子导航 */
--hairline:      #23252a   /* 1px 边框、分隔线 */
--hairline-strong:#34343a
--ink:           #f7f8f8   /* 主文字 */
--ink-muted:     #d0d6e0   /* 次级 */
--ink-subtle:    #8a8f98   /* 三级 / 占位 */
--ink-tertiary:  #62666d   /* 禁用 / 脚注 */
--success:       #27a644
```

## 字体
- 正文/标题：**Inter**（500/600/700），display 用负字距。
- 等宽：**JetBrains Mono**（版本号、ID、参数）。
- 层级：display 600 + 负字距；正文 16px/400；caption 12px；button 14px/500。

## 圆角
按钮 / 输入 `8px`；卡片 `12px`；图片面板 `16px`；状态胶囊 / 头像 `9999px`。
> CTA 用 8px，不要做成胶囊。

## 间距（4px 基准）
4 / 8 / 12 / 16 / 24 / 32 / 48。卡片内边距 24px，按钮 8×14，输入 8×12。

## 组件规则
- **主按钮**：`--accent` 底 + 白字 + 8px 圆角；hover→`--accent-hover`。
- **次按钮**：`--surface-1` 底 + `--ink` + 1px `--hairline`。
- **卡片/面板**：`--surface-1` + 1px `--hairline` + 12px；悬浮升到 `--surface-2`。
- **输入框**：`--surface-1` 底；聚焦 2px `--accent-focus` 焦点环（50% 透明）。
- **顶栏/底栏**：`--canvas` 底，高 56px。
- **标签胶囊**：默认 `--canvas`+`--ink-subtle`，选中 `--surface-2`+`--ink`。

## Do / Don't
- Do：四级表面阶梯做层次；薰衣草蓝克制；display 负字距；图片面板用 16px。
- Don't：纯黑画布；薰衣草蓝当背景/填充；第二个高饱和强调色；CTA 胶囊化；滥用阴影/光晕。
