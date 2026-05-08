import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_FILE = path.join(ROOT, 'src', 'data', 'prompts.generated.ts');
const LOCAL_THUMB_ROOT = path.join(ROOT, 'public', 'prompt-thumbs');
const EVOLINK_THUMB_ROOT = path.join(LOCAL_THUMB_ROOT, 'evolink');
const FREESTYLE_THUMB_ROOT = path.join(LOCAL_THUMB_ROOT, 'freestylefly');

const EVOLINK_REPO = path.join(ROOT, 'external', 'awesome-gpt-image-2-api-prompts');
const FREESTYLE_REPO = path.join(ROOT, 'external', 'awesome-gpt-image-2');

const EVOLINK_REPO_URL = 'https://github.com/EvoLinkAI/awesome-gpt-image-2-API-and-Prompts';
const FREESTYLE_REPO_URL = 'https://github.com/freestylefly/awesome-gpt-image-2';
const EVOLINK_LOGO = '/prompt-thumbs/evolink/logo.png';
const FREESTYLE_FALLBACK = '/prompt-thumbs/freestylefly/case1.jpg';
const EVOLINK_RAW_PREFIX =
  'https://raw.githubusercontent.com/EvoLinkAI/awesome-gpt-image-2-API-and-Prompts/main/';
const FREESTYLE_IMAGE_EXTS = ['jpg', 'png', 'webp', 'jpeg'];

function exists(filePath) {
  return fs.existsSync(filePath);
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function normalizePrompt(input) {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyIfExists(sourcePath, targetPath) {
  if (!exists(sourcePath)) return false;
  ensureDir(path.dirname(targetPath));
  fs.copyFileSync(sourcePath, targetPath);
  return true;
}

function normalizeToPosix(p) {
  return p.split(path.sep).join('/');
}

function prepareLocalAssets() {
  if (exists(LOCAL_THUMB_ROOT)) {
    fs.rmSync(LOCAL_THUMB_ROOT, { recursive: true, force: true });
  }
  ensureDir(EVOLINK_THUMB_ROOT);
  ensureDir(FREESTYLE_THUMB_ROOT);

  const logoSource = path.join(EVOLINK_REPO, 'images', 'logo.png');
  const logoTarget = path.join(EVOLINK_THUMB_ROOT, 'logo.png');
  copyIfExists(logoSource, logoTarget);

  const fallbackSource = path.join(FREESTYLE_REPO, 'data', 'images', 'case1.jpg');
  const fallbackTarget = path.join(FREESTYLE_THUMB_ROOT, 'case1.jpg');
  copyIfExists(fallbackSource, fallbackTarget);
}

function resolveLocalThumbnail(caseBlock) {
  const imageRegex = /<img\s+src="([^"]+)"/;
  const imageMatch = caseBlock.match(imageRegex);
  if (!imageMatch?.[1]) return EVOLINK_LOGO;

  const src = imageMatch[1].trim();
  if (!src.startsWith(EVOLINK_RAW_PREFIX)) return EVOLINK_LOGO;

  const relative = src.slice(EVOLINK_RAW_PREFIX.length); // e.g. images/ui_case1/output.jpg
  const sourcePath = path.join(EVOLINK_REPO, ...relative.split('/'));
  const targetPath = path.join(EVOLINK_THUMB_ROOT, ...relative.split('/').slice(1)); // remove "images/"

  const copied = copyIfExists(sourcePath, targetPath);
  if (!copied) return EVOLINK_LOGO;

  const webRelative = normalizeToPosix(path.relative(path.join(ROOT, 'public'), targetPath));
  return `/${webRelative}`;
}

function mapFreestyleCategory(label) {
  if (label.includes('UI与界面')) return 'ui';
  if (label.includes('图表与信息可视化')) return 'scene';
  if (label.includes('海报与排版')) return 'vfx';
  if (label.includes('商品与电商')) return '3d';
  if (label.includes('品牌与标志')) return 'vfx';
  if (label.includes('建筑与空间')) return 'scene';
  if (label.includes('摄影与写实')) return 'realistic';
  if (label.includes('插画与艺术')) return 'anime';
  if (label.includes('人物与角色')) return 'illustration-standing';
  if (label.includes('场景与叙事')) return 'scene';
  if (label.includes('历史与古风题材')) return 'anime';
  if (label.includes('文档与出版物')) return 'ui';
  return 'scene';
}

function getFreestyleCaseCategoryMap() {
  const galleryPath = path.join(FREESTYLE_REPO, 'docs', 'gallery.md');
  if (!exists(galleryPath)) return new Map();

  const content = readText(galleryPath);
  const map = new Map();
  const sectionRegex = /^###\s+.*?([^\n·]+)\s*·\s*\d+\s*cases\s*([\s\S]*?)(?=^###\s+|^##\s+|\Z)/gm;

  let sectionMatch;
  while ((sectionMatch = sectionRegex.exec(content)) !== null) {
    const label = sectionMatch[1].trim();
    const block = sectionMatch[2] ?? '';
    const category = mapFreestyleCategory(label);
    const idRegex = /例\s*(\d+)/g;
    let idMatch;
    while ((idMatch = idRegex.exec(block)) !== null) {
      map.set(Number(idMatch[1]), category);
    }
  }
  return map;
}

function resolveFreestyleCaseThumbnail(caseId) {
  for (const ext of FREESTYLE_IMAGE_EXTS) {
    const sourceName = `case${caseId}.${ext}`;
    const sourcePath = path.join(FREESTYLE_REPO, 'data', 'images', sourceName);
    if (!exists(sourcePath)) continue;
    const targetName = `case-${caseId}.${ext}`;
    const targetPath = path.join(FREESTYLE_THUMB_ROOT, targetName);
    const copied = copyIfExists(sourcePath, targetPath);
    if (copied) return `/prompt-thumbs/freestylefly/${targetName}`;
  }
  return FREESTYLE_FALLBACK;
}

function inferCategory(sectionOrTitle) {
  const t = sectionOrTitle.toLowerCase();
  if (t.includes('ui') || t.includes('界面')) return 'ui';
  if (t.includes('social') || t.includes('mockup') || t.includes('分镜')) return 'ue';
  if (t.includes('角色') || t.includes('character')) return 'illustration-standing';
  if (t.includes('3d')) return '3d';
  if (t.includes('插画') || t.includes('动漫') || t.includes('古风') || t.includes('anime')) return 'anime';
  if (t.includes('摄影') || t.includes('portrait') || t.includes('写实') || t.includes('photo')) return 'realistic';
  if (t.includes('海报') || t.includes('ad') || t.includes('特效') || t.includes('brand')) return 'vfx';
  return 'scene';
}

function parseEvoCases() {
  const casesDir = path.join(EVOLINK_REPO, 'cases');
  if (!exists(casesDir)) {
    console.log(`[sync-prompts] evolink cases dir not found: ${casesDir}`);
    return [];
  }

  const files = fs
    .readdirSync(casesDir)
    .filter((name) => name.endsWith('_zh-CN.md'))
    .sort();

  const cards = [];
  const caseHeaderRegex = /^###\s+Case\s+\d+:\s+\[(.+?)\]/gm;
  const codeBlockRegex = /```(?:[a-zA-Z0-9_-]+)?\r?\n([\s\S]*?)```/g;
  for (const fileName of files) {
    const filePath = path.join(casesDir, fileName);
    const content = readText(filePath);
    const sectionTitle = fileName.replace(/\.md$/, '');

    const headers = [];
    let headerMatch;
    while ((headerMatch = caseHeaderRegex.exec(content)) !== null) {
      headers.push({
        title: headerMatch[1].trim(),
        start: headerMatch.index,
        end: content.length,
      });
    }
    for (let i = 0; i < headers.length - 1; i += 1) {
      headers[i].end = headers[i + 1].start;
    }

    for (const header of headers) {
      const caseBlock = content.slice(header.start, header.end);
      const promptBlocks = [];
      let codeMatch;
      while ((codeMatch = codeBlockRegex.exec(caseBlock)) !== null) {
        const p = normalizePrompt(codeMatch[1]);
        if (p) promptBlocks.push(p);
      }

      if (promptBlocks.length === 0) continue;
      const mergedPrompt = normalizePrompt(promptBlocks.join('\n\n'));
      const thumbnail = resolveLocalThumbnail(caseBlock);

      cards.push({
        title: header.title,
        category: inferCategory(`${sectionTitle} ${header.title}`),
        prompt: mergedPrompt,
        thumbnail,
        source: 'EvoLinkAI',
        sourceUrl: EVOLINK_REPO_URL,
      });
    }
  }

  return cards;
}

function parseFreestyleTemplates() {
  const partFiles = [
    path.join(FREESTYLE_REPO, 'docs', 'gallery-part-1.md'),
    path.join(FREESTYLE_REPO, 'docs', 'gallery-part-2.md'),
  ];
  if (!partFiles.every((p) => exists(p))) return [];

  const caseCategoryMap = getFreestyleCaseCategoryMap();
  const cards = [];
  const caseHeaderRegex = /^###\s+例\s*(\d+)\s*[：:]\s*(.+)$/gm;
  const codeBlockRegex = /```(?:[a-zA-Z0-9_-]+)?\r?\n([\s\S]*?)```/g;

  for (const filePath of partFiles) {
    const content = readText(filePath);
    const headers = [];
    let headerMatch;
    while ((headerMatch = caseHeaderRegex.exec(content)) !== null) {
      headers.push({
        caseId: Number(headerMatch[1]),
        title: headerMatch[2].trim(),
        start: headerMatch.index,
        end: content.length,
      });
    }
    for (let i = 0; i < headers.length - 1; i += 1) {
      headers[i].end = headers[i + 1].start;
    }

    for (const header of headers) {
      const caseBlock = content.slice(header.start, header.end);
      const promptBlocks = [];
      let codeMatch;
      while ((codeMatch = codeBlockRegex.exec(caseBlock)) !== null) {
        const p = normalizePrompt(codeMatch[1]);
        if (p) promptBlocks.push(p);
      }
      if (promptBlocks.length === 0) continue;

      const prompt = normalizePrompt(promptBlocks.join('\n\n'));
      const category = caseCategoryMap.get(header.caseId) ?? inferCategory(header.title);

      cards.push({
        title: `例 ${header.caseId}：${header.title}`,
        category,
        prompt,
        thumbnail: resolveFreestyleCaseThumbnail(header.caseId),
        source: 'freestylefly',
        sourceUrl: `${FREESTYLE_REPO_URL}/blob/main/docs/${path.basename(filePath)}#case-${header.caseId}`,
      });
    }
  }

  return cards;
}

function dedupeAndLimit(cards) {
  const seen = new Set();
  const result = [];
  for (const card of cards) {
    const key = `${card.source}|${card.title}|${card.prompt.slice(0, 80)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(card);
  }
  return result;
}

function toTsFile(cards) {
  const withId = cards.map((c, idx) => ({ id: idx + 1, ...c }));
  return `/* eslint-disable */
// Auto-generated by scripts/sync-prompts.mjs
// Do not edit this file manually.

export interface PromptCard {
  id: number;
  title: string;
  category: string;
  prompt: string;
  thumbnail: string;
  source: string;
  sourceUrl?: string;
}

export const PROMPT_LIBRARY_GENERATED: PromptCard[] = ${JSON.stringify(withId, null, 2)} as PromptCard[];
`;
}

function main() {
  prepareLocalAssets();
  const freestyle = parseFreestyleTemplates();
  const evolink = parseEvoCases();
  const merged = dedupeAndLimit([...freestyle, ...evolink]);
  if (merged.length === 0) {
    console.log('[sync-prompts] No source data found. Skip generating prompts.');
    console.log('[sync-prompts] Expected submodule paths:');
    console.log('  - external/awesome-gpt-image-2');
    console.log('  - external/awesome-gpt-image-2-api-prompts');
    process.exit(0);
  }

  fs.writeFileSync(OUT_FILE, toTsFile(merged), 'utf8');
  console.log(`[sync-prompts] Generated ${merged.length} prompts -> src/data/prompts.generated.ts`);
}

main();
