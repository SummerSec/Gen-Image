import OpenAI from 'openai';

const RESOLUTION_SIZES: Record<string, string> = {
  '1k': '1024x1024',
  '2k': '2048x2048',
  '4k': '4096x4096',
};

const RATIO_SIZES: Record<string, { w: number; h: number }> = {
  '1:1': { w: 1024, h: 1024 },
  '3:4': { w: 768, h: 1024 },
  '4:3': { w: 1024, h: 768 },
  '9:16': { w: 576, h: 1024 },
  '16:9': { w: 1024, h: 576 },
};

function getClient(apiKey: string, baseUrl: string): OpenAI {
  return new OpenAI({
    apiKey,
    baseURL: baseUrl.replace(/\/$/, ''),
    dangerouslyAllowBrowser: true,
  });
}

export interface GenerateParams {
  prompt: string;
  negativePrompt?: string;
  model: string;
  resolution: string;
  aspectRatio: string;
  style?: string;
  cfgScale: number;
  referenceImages: string[];
  apiKey: string;
  baseUrl: string;
}

export async function generateImage(params: GenerateParams): Promise<string> {
  const { prompt, model, aspectRatio, referenceImages, apiKey, baseUrl } = params;
  const size = RESOLUTION_SIZES[params.resolution] || '1024x1024';

  console.log('generateImage params:', params);
  const client = getClient(apiKey, baseUrl);

  if (referenceImages.length > 0) {
    // Image-to-image / edit mode
    return generateWithReference(client, prompt, model, size, referenceImages, aspectRatio, params.style);
  }

  // Text-to-image: POST /gpt/v1/images/generations
  try {
    const resp = (await client.images.generate({
      model,
      prompt,
      n: 1,
      size,
      response_format: 'b64_json',
    } as unknown as OpenAI.Images.ImageGenerateParams)) as { data: Array<{ b64_json?: string; url?: string }> };

    const item = resp.data[0];
    if (item?.b64_json) {
      return `data:image/png;base64,${item.b64_json}`;
    }
    if (item?.url) {
      return item.url;
    }
    throw new Error('API 未返回图片数据');
  } catch (err) {
    console.error('生成失败:', err);
    throw err;
  }
}

async function generateWithReference(
  client: OpenAI,
  prompt: string,
  model: string,
  _size: string,
  referenceImages: string[],
  _aspectRatio: string,
  _style?: string
): Promise<string> {
  // Image edit with reference: uses chat completions endpoint
  const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];

  for (const refUrl of referenceImages) {
    // Convert to base64 if it's a blob URL
    if (refUrl.startsWith('blob:')) {
      const base64 = await blobUrlToBase64(refUrl);
      content.push({
        type: 'image_url',
        image_url: { url: base64 },
      });
    } else if (refUrl.startsWith('data:')) {
      content.push({
        type: 'image_url',
        image_url: { url: refUrl },
      });
    }
  }

  content.push({ type: 'text', text: prompt });

  const resp = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content }],
  });

  const msg = resp.choices[0]?.message?.content;
  if (!msg) throw new Error('API 未返回内容');

  // Parse base64 image from markdown: ![image](data:image/png;base64,...)
  const base64Match = msg.match(/!\[.*?\]\((data:image\/[^;]+;base64,[^)]+)\)/);
  if (base64Match) {
    return base64Match[1];
  }

  // Try raw base64
  if (msg.startsWith('data:image/')) {
    return msg;
  }

  throw new Error('无法解析返回的图片数据');
}

async function blobUrlToBase64(blobUrl: string): Promise<string> {
  const resp = await fetch(blobUrl);
  const blob = await resp.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function getSizeForRatio(ratio: string): string {
  const r = RATIO_SIZES[ratio];
  if (!r) return '1024x1024';
  return `${r.w}x${r.h}`;
}
