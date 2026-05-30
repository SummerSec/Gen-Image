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

  if (useStore.getState().apiMode === 'responses') {
    return generateViaResponses({ prompt, model, size, referenceImages, apiKey, baseUrl });
  }

  // Provider-specific extension: reference images via `image` array in body
  if (referenceImages.length > 0) {
    const apiUrl = `${baseUrl.replace(/\/$/, '')}/images/generations`;
    const { useCorsProxy, corsProxyUrl } = useStore.getState();
    const url = useCorsProxy ? `${corsProxyUrl}${apiUrl}` : apiUrl;

    // Append response_format: b64_json when enabled in settings (not all providers support it)
    const preferBase64 = useStore.getState().responseFormatB64;
    const body: Record<string, unknown> = {
      model,
      prompt,
      size,
      response_format: preferBase64 ? 'b64_json' : 'url',
    };

    const images: string[] = [];
    for (const refUrl of referenceImages) {
      images.push(await toBase64Image(refUrl));
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
  // Append response_format: b64_json when enabled in settings (not all providers support it)
  const preferBase64 = useStore.getState().responseFormatB64;
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

export async function editImage(params: {
  image: Blob;
  mask: Blob;
  prompt: string;
  model: string;
  size: string;
  apiKey: string;
  baseUrl: string;
}): Promise<string> {
  const apiUrl = `${params.baseUrl.replace(/\/$/, '')}/images/edits`;
  const { useCorsProxy, corsProxyUrl } = useStore.getState();
  const url = useCorsProxy ? `${corsProxyUrl}${apiUrl}` : apiUrl;

  const form = new FormData();
  form.append('model', params.model);
  form.append('prompt', params.prompt);
  form.append('image', params.image, 'image.png');
  form.append('mask', params.mask, 'mask.png');
  form.append('size', params.size);
  form.append('n', '1');

  const resp = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${params.apiKey}` },
    body: form,
  });

  if (!resp.ok) {
    throw new Error(await formatApiError(resp));
  }

  const data = await resp.json();
  const item = data.data?.[0];
  if (item?.b64_json) {
    return `data:image/png;base64,${item.b64_json}`;
  }
  if (item?.url) {
    return ensureSecureImageUrl(item.url);
  }
  throw new Error('API 未返回图片数据');
}

// Responses API path: POST /responses with the image_generation tool.
async function generateViaResponses(params: {
  prompt: string; model: string; size: string; referenceImages: string[]; apiKey: string; baseUrl: string;
}): Promise<string> {
  const apiUrl = `${params.baseUrl.replace(/\/$/, '')}/responses`;
  const { useCorsProxy, corsProxyUrl } = useStore.getState();
  const url = useCorsProxy ? `${corsProxyUrl}${apiUrl}` : apiUrl;

  const content: Record<string, unknown>[] = [{ type: 'input_text', text: params.prompt }];
  for (const refUrl of params.referenceImages) {
    content.push({ type: 'input_image', image_url: await toBase64Image(refUrl) });
  }

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${params.apiKey}` },
    body: JSON.stringify({
      model: params.model,
      input: [{ role: 'user', content }],
      tools: [{ type: 'image_generation', size: params.size }],
    }),
  });
  if (!resp.ok) throw new Error(await formatApiError(resp));

  const data = await resp.json();
  const b64 = data.output?.find((o: { type?: string }) => o.type === 'image_generation_call')?.result;
  if (b64) return `data:image/png;base64,${b64}`;
  throw new Error('Responses API 未返回图片数据');
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

// Convert any reference image (blob:/relative/http) to a base64 data URL; data: passes through.
async function toBase64Image(url: string): Promise<string> {
  if (url.startsWith('data:')) return url;
  try {
    return await blobUrlToBase64(url);
  } catch {
    return url; // fallback to original on failure (e.g. cross-origin CORS)
  }
}

/**
 * Ensure the image URL can be rendered on the current page.
 * Proxy is used when:
 *   - The image host is an IP address (not a domain name), regardless of protocol
 *   - The image is HTTP and the page is HTTPS (mixed content)
 * Fallback chain:
 *   1. Use self-hosted /api/img-proxy (Vercel serverless function)
 *   2. Fetch via external CORS proxy → convert to base64 data URL
 */
async function ensureSecureImageUrl(imageUrl: string): Promise<string> {
  // data URL — always safe
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // Determine if the host is an IP address
  const isIpHost = /^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(imageUrl);

  // Determine if there's a mixed content issue (HTTP image on HTTPS page)
  const isMixedContent =
    imageUrl.startsWith('http://') &&
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:';

  // If host is a domain and no mixed content issue — use directly
  if (!isIpHost && !isMixedContent) {
    return imageUrl;
  }

  // Need proxy: either IP-based host or mixed content
  // Step 1: Self-hosted image proxy (same origin, no CORS/mixed content issues)
  try {
    const proxyUrl = `/api/img-proxy?url=${encodeURIComponent(imageUrl)}`;
    const resp = await fetch(proxyUrl);
    if (resp.ok) {
      return await blobToDataUrl(await resp.blob());
    }
  } catch {
    // Self-hosted proxy failed
  }

  // Step 2: Try external CORS proxy
  const { useCorsProxy, corsProxyUrl } = useStore.getState();
  if (useCorsProxy && corsProxyUrl) {
    try {
      const proxyUrl = `${corsProxyUrl}${imageUrl}`;
      const resp = await fetch(proxyUrl);
      if (resp.ok) {
        return await blobToDataUrl(await resp.blob());
      }
    } catch {
      // CORS proxy failed
    }
  }

  // All fallbacks exhausted — return original URL
  console.warn('[ensureSecureImageUrl] 无法转换图片，返回原始链接:', imageUrl);
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