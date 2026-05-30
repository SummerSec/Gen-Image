import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import { editImage, getSizeForRatio } from '../../services/api';
import { applyWatermark } from '../../services/watermark';

interface Props {
  open: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

// Visual mask editor: user paints the area to regenerate (inpainting).
export default function MaskEditor({ open, imageUrl, onClose }: Props) {
  const baseRef = useRef<HTMLCanvasElement>(null);
  const paintRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [brush, setBrush] = useState(40);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      for (const c of [baseRef.current, paintRef.current]) {
        if (!c) continue;
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
      }
      baseRef.current?.getContext('2d')?.drawImage(img, 0, 0);
    };
    img.onerror = () => setError('图片无法加载（可能跨域），请改用本地/生成图片');
    img.src = imageUrl;
  }, [open, imageUrl]);

  if (!open || !imageUrl) return null;

  const pos = (e: React.PointerEvent) => {
    const c = paintRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  };

  const paint = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = paintRef.current!.getContext('2d')!;
    const { x, y } = pos(e);
    ctx.fillStyle = 'rgba(239,68,68,0.5)';
    ctx.beginPath();
    ctx.arc(x, y, brush / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const clear = () => paintRef.current?.getContext('2d')?.clearRect(0, 0, paintRef.current.width, paintRef.current.height);

  const buildMask = (): Promise<Blob> => {
    const paint = paintRef.current!;
    const mask = document.createElement('canvas');
    mask.width = paint.width;
    mask.height = paint.height;
    const ctx = mask.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, mask.width, mask.height);
    const painted = paint.getContext('2d')!.getImageData(0, 0, paint.width, paint.height).data;
    const out = ctx.getImageData(0, 0, mask.width, mask.height);
    for (let i = 3; i < painted.length; i += 4) {
      if (painted[i] > 10) out.data[i] = 0; // painted → transparent → editable
    }
    ctx.putImageData(out, 0, 0);
    return new Promise((res) => mask.toBlob((b) => res(b!), 'image/png'));
  };

  const toBlob = (c: HTMLCanvasElement): Promise<Blob> =>
    new Promise((res) => c.toBlob((b) => res(b!), 'image/png'));

  const handleApply = async () => {
    const { prompt, model, apiKey, baseUrl, aspectRatio, watermarkEnabled, setGeneratedImage, addHistory } =
      useStore.getState();
    if (!prompt.trim()) return setError('请先在左侧填写提示词，描述要替换的内容');
    if (!apiKey.trim()) return setError('请先配置 API Key');
    setBusy(true);
    setError(null);
    try {
      const [image, mask] = await Promise.all([toBlob(baseRef.current!), buildMask()]);
      let result = await editImage({ image, mask, prompt, model, size: getSizeForRatio(aspectRatio), apiKey, baseUrl });
      if (watermarkEnabled) result = await applyWatermark(result);
      setGeneratedImage(result);
      addHistory({ id: `${Date.now()}-edit`, url: result, prompt, model, timestamp: Date.now() });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '局部重绘失败');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex flex-col p-4 lg:p-6">
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#23252a] bg-[#0f1011] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#23252a] px-5 py-3">
          <div>
            <h2 className="text-base font-semibold text-[#f7f8f8]">局部重绘</h2>
            <p className="mt-0.5 text-xs text-[#8a8f98]">涂抹要重新生成的区域，提示词描述替换内容</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full border border-[#23252a] text-[#8a8f98] hover:text-[#f7f8f8]">×</button>
        </div>

        <div className="flex-1 min-h-0 overflow-auto bg-[#0f1011] p-4 flex items-center justify-center">
          <div className="relative inline-block max-h-full max-w-full">
            <canvas ref={baseRef} className="block max-h-[60vh] max-w-full" />
            <canvas
              ref={paintRef}
              className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
              onPointerDown={(e) => { drawing.current = true; paint(e); }}
              onPointerMove={paint}
              onPointerUp={() => (drawing.current = false)}
              onPointerLeave={() => (drawing.current = false)}
            />
          </div>
        </div>

        {error && <p className="px-5 py-2 text-xs text-red-500">{error}</p>}

        <div className="flex items-center gap-3 border-t border-[#23252a] px-5 py-3">
          <label className="flex items-center gap-2 text-xs text-[#8a8f98]">
            笔刷
            <input type="range" min={10} max={120} value={brush} onChange={(e) => setBrush(+e.target.value)} />
          </label>
          <button onClick={clear} className="h-8 rounded-full border border-[#23252a] px-3 text-xs text-[#8a8f98] hover:text-[#f7f8f8]">清除涂抹</button>
          <div className="flex-1" />
          <button
            onClick={handleApply}
            disabled={busy}
            className="h-9 rounded-full bg-[#5e6ad2] px-6 text-sm font-medium text-white hover:bg-[#828fff] disabled:opacity-50"
          >
            {busy ? '重绘中...' : '生成'}
          </button>
        </div>
      </div>
    </div>
  );
}
