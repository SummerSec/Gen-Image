import OpenAI from 'openai';
import { useStore } from '../store/useStore';

const RATIO_SIZES: Record<string, { w: number; h: number }> = {
  '1:1': { w: 1024, h: 1024 },
  '3:4': { w: 768, h: 1024 },
  '4:3': { w: 1024, h: 768 },
  '9:16': { w: 576, h: 1024 },
  '16:9': { w: 1024, h: 576 },
};

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

function createClient(apiKey: string, baseUrl: string): OpenAI {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const { useCorsProxy, corsProxyUrl } = useStore.getState();

  return new OpenAI({
    apiKey,
    baseURL: normalizedBaseUrl,
    dangerouslyAllowBrowser: true,
    fetch: (input, init) => {
      if (!useCorsProxy) return fetch(input, init);
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input instanceof Request
              ? input.url
              : String(input);
      return fetch(`${corsProxyUrl}${url}`, init);
    },
  });
}

export async function generateImage(params: GenerateParams): Promise<string> {
  const { prompt, model, aspectRatio, referenceImages, apiKey, baseUrl } = params;
  const size = getSizeForRatio(aspectRatio);

  // Provider-specific extension: reference images via `image` array in body
  if (referenceImages.length > 0) {
    const apiUrl = `${baseUrl.replace(/\/$/, '')}/images/generations`;
    const { useCorsProxy, corsProxyUrl } = useStore.getState();
    const url = useCorsProxy ? `${corsProxyUrl}${apiUrl}` : apiUrl;

    // Prefer b64_json on HTTPS pages to avoid mixed content issues with HTTP image URLs
    const preferBase64 = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const body: Record<string, unknown> = {
      model,
      prompt,
      size,
      response_format: preferBase64 ? 'b64_json' : 'url',
    };

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

    const data = await resp.json();
    const item = data.data[0];

    if (item?.url) {
      return ensureSecureImageUrl(item.url);
    }
    if (item?.b64_json) {
      return `data:image/png;base64,${item.b64_json}`;
    }

    throw new Error('API 未返回图片数据');
  }

  // Standard path: use OpenAI SDK
  // Prefer b64_json on HTTPS pages to avoid mixed content issues with HTTP image URLs
  const preferBase64 = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const client = createClient(apiKey, baseUrl);
  const response = await client.images.generate({
    prompt,
    model,
    size,
    n: 1,
    response_format: preferBase64 ? 'b64_json' : 'url',
  });

  const item = response.data?.[0];
  if (item?.url) {
    return ensureSecureImageUrl(item.url);
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

/**
 * Ensure the image URL can be rendered on the current page.
 * Fallback chain:
 *   1. Return original URL (works if same protocol or page is HTTP)
 *   2. Fetch via CORS proxy → convert to base64 data URL
 *   3. Direct fetch → convert to base64 data URL (last resort)
 */
async function ensureSecureImageUrl(imageUrl: string): Promise<string> {
  // Already safe: data URL or HTTPS link — use directly
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // HTTP image but page is also HTTP — no mixed content issue
  if (typeof window !== 'undefined' && window.location.protocol === 'http:') {
    return imageUrl;
  }

  // HTTP image on HTTPS page — must convert to data URL
  // Step 1: Try CORS proxy (HTTPS proxy avoids mixed content block)
  const { useCorsProxy, corsProxyUrl } = useStore.getState();
  if (useCorsProxy && corsProxyUrl) {
    try {
      const proxyUrl = `${corsProxyUrl}${imageUrl}`;
      const resp = await fetch(proxyUrl);
      if (resp.ok) {
        return await blobToDataUrl(await resp.blob());
      }
    } catch {
      // CORS proxy failed, try next fallback
    }
  }

  // Step 2: Direct fetch (may work if browser/environment allows it)
  try {
    const resp = await fetch(imageUrl);
    if (resp.ok) {
      return await blobToDataUrl(await resp.blob());
    }
  } catch {
    // Direct fetch also failed
  }

  // All fallbacks exhausted — return original URL and let the browser attempt it
  // (will likely be blocked, but at least we tried)
  console.warn('[ensureSecureImageUrl] 无法转换 HTTP 图片，返回原始链接:', imageUrl);
  return imageUrl;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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