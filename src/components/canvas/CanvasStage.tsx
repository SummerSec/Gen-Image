import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import MaskEditor from './MaskEditor';

export default function CanvasStage() {
  const messages = useStore((s) => s.messages);
  const libraryPreviewImage = useStore((s) => s.libraryPreviewImage);
  const referenceImages = useStore((s) => s.referenceImages);
  const addReferenceImage = useStore((s) => s.addReferenceImage);
  const removeReferenceImage = useStore((s) => s.removeReferenceImage);
  const setReferenceImages = useStore((s) => s.setReferenceImages);
  const [maskImg, setMaskImg] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const latestImage = useMemo(
    () => [...messages].reverse().find((message) => message.role === 'assistant' && message.image)?.image,
    [messages],
  );

  const download = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'image.png';
    a.click();
  };

  const stageReferenceImage = referenceImages[0] ?? libraryPreviewImage;

  return (
    <main className="studio-stage studio-canvas-grid relative flex min-w-0 flex-1 items-center justify-center overflow-hidden px-5 py-6">
      {latestImage ? (
        <section className="group relative flex h-full w-full items-center justify-center">
          <button type="button" onClick={() => setPreview(latestImage)} className="flex h-full max-h-full max-w-full items-center justify-center" title="点击放大">
            <img src={latestImage} alt="" className="max-h-full max-w-full rounded-[28px] object-contain shadow-[0_42px_120px_rgba(8,10,15,0.28)]" />
          </button>
          <div className="absolute bottom-6 right-6 flex gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <button onClick={() => addReferenceImage(latestImage)} className="h-9 rounded-xl bg-black/70 px-3 text-xs text-white backdrop-blur hover:bg-black/85">转参考图</button>
            <button onClick={() => setMaskImg(latestImage)} className="h-9 rounded-xl bg-black/70 px-3 text-xs text-white backdrop-blur hover:bg-black/85">局部重绘</button>
            <button onClick={() => download(latestImage)} className="h-9 rounded-xl bg-black/70 px-3 text-xs text-white backdrop-blur hover:bg-black/85">下载</button>
          </div>
        </section>
      ) : stageReferenceImage ? (
        <section className="group relative flex h-full max-h-[720px] w-full max-w-5xl overflow-hidden rounded-[34px] border border-[#D7D9DD] bg-[#F4F5F7] text-[#101113] shadow-[0_28px_90px_rgba(16,17,19,0.18)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,17,19,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,17,19,0.045)_1px,transparent_1px)] bg-[size:34px_34px]" />
          <div className="absolute left-6 top-6 z-10 flex h-9 items-center rounded-full border border-white/70 bg-white/75 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A66B2F] shadow-sm backdrop-blur">
            02 · Reference
          </div>
          <button
            type="button"
            onClick={() => setPreview(stageReferenceImage)}
            className="relative z-0 flex h-full w-full items-center justify-center overflow-hidden"
            title="点击放大参考图"
          >
            <img src={stageReferenceImage} alt="" className="h-full w-full object-cover" />
          </button>

          {referenceImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 z-20 flex max-w-[80%] -translate-x-1/2 gap-2 overflow-x-auto rounded-2xl border border-white/60 bg-white/80 p-2 shadow-lg backdrop-blur">
              {referenceImages.map((url, index) => (
                <button
                  key={`${url}-${index}`}
                  type="button"
                  onClick={() => setReferenceImages([url, ...referenceImages.filter((_, i) => i !== index)])}
                  className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border ${index === 0 ? 'border-[#A66B2F]' : 'border-[#D1D4DA]'}`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="absolute bottom-6 right-6 z-20 flex gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <button onClick={() => setPreview(stageReferenceImage)} className="h-9 rounded-xl bg-black/70 px-3 text-xs text-white backdrop-blur hover:bg-black/85">放大</button>
            {referenceImages.length > 0 && (
              <button onClick={() => removeReferenceImage(0)} className="h-9 rounded-xl bg-black/70 px-3 text-xs text-white backdrop-blur hover:bg-black/85">移除</button>
            )}
          </div>
        </section>
      ) : (
        <section className="relative flex h-full max-h-[720px] w-full max-w-5xl items-center justify-center overflow-hidden rounded-[34px] border border-[#D7D9DD] bg-[#F4F5F7] text-[#101113] shadow-[0_28px_90px_rgba(16,17,19,0.18)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,17,19,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,17,19,0.045)_1px,transparent_1px)] bg-[size:34px_34px]" />
          <div className="absolute inset-8 rounded-[28px] border border-[#D1D4DA]" />
          <div className="absolute left-8 top-8 flex h-10 items-center rounded-full border border-[#D1D4DA] bg-white/70 px-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#A66B2F]">
            02 · Canvas
          </div>
          <div className="relative z-10 flex max-w-md flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#101113] text-[#D6A85D] shadow-[0_20px_50px_rgba(16,17,19,0.28)]">
              <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-[#101113]">结果画布</h2>
            <p className="mt-4 text-sm leading-7 text-[#68625B]">左侧选择模板，右侧发送生成指令。生成后的图片会在这里审阅、下载、转参考图或局部重绘。</p>
          </div>
        </section>
      )}

      <MaskEditor open={!!maskImg} imageUrl={maskImg} onClose={() => setMaskImg(null)} />

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6" onClick={() => setPreview(null)}>
          <img src={preview} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
        </div>
      )}
    </main>
  );
}
