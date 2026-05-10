const RATIO_SIZES: Record<string, { w: number; h: number }> = {
  '1:1': { w: 1024, h: 1024 },
  '3:4': { w: 768, h: 1024 },
  '4:3': { w: 1024, h: 768 },
  '9:16': { w: 576, h: 1024 },
  '16:9': { w: 1024, h: 576 },
};

const CORS_PROXY_URL = 'https://proxy.sumsec.me/';

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

interface ImagesGenerationsResponse {
  created: number;
  data: Array<{ url?: string; b64_json?: string }>;
  usage: { total_tokens: number; input_tokens: number; output_tokens: number };
}

export async function generateImage(params: GenerateParams): Promise<string> {
  const { prompt, model, aspectRatio, referenceImages, apiKey, baseUrl } = params;
  const size = getSizeForRatio(aspectRatio);

  console.log('generateImage params:', params);

  const apiUrl = `${baseUrl.replace(/\/$/, '')}/images/generations`;
  const url = withCorsProxy(apiUrl);

  const body: Record<string, unknown> = {
    model,
    prompt,
    size,
    response_format: 'url',
  };

  if (referenceImages.length > 0) {
    const images: string[] = [];
    for (const refUrl of referenceImages) {
      if (refUrl.startsWith('blob:')) {
        images.push(await blobUrlToBase64(refUrl));
      } else if (refUrl.startsWith('data:')) {
        images.push(refUrl);
      } else {
        images.push(refUrl);
      }
    }
    body.image = images;
  }

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    throw new Error(await formatApiError(resp));
  }

  const data: ImagesGenerationsResponse = await resp.json();
  const item = data.data[0];

  if (item?.url) {
    return item.url;
  }
  if (item?.b64_json) {
    return `data:image/png;base64,${item.b64_json}`;
  }

  throw new Error('API 未返回图片数据');
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

function withCorsProxy(url: string): string {
  if (url.startsWith(CORS_PROXY_URL)) {
    return url;
  }

  return `${CORS_PROXY_URL}${url}`;
}

async function formatApiError(resp: Response): Promise<string> {
  const errText = await resp.text().catch(() => '');

  if (resp.status === 524) {
    return 'API 请求失败 (524)：图片生成耗时过长，源站响应超时。请稍后重试，或减少一次生成张数。';
  }

  if (errText.trim().startsWith('<!DOCTYPE html') || errText.includes('<html')) {
    return `API 请求失败 (${resp.status})：服务端返回了 HTML 错误页，请稍后重试。`;
  }

  return `API 请求失败 (${resp.status}): ${errText || 'Unknown error'}`;
}

export function getSizeForRatio(ratio: string): string {
  const r = RATIO_SIZES[ratio];
  if (!r) return '1024x1024';
  return `${r.w}x${r.h}`;
}
