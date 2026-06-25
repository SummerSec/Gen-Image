import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { RATIO_OPTIONS, RESOLUTION_OPTIONS } from '../../data/options';
import { PlusIcon } from '../common/Icons';
import { useImageGeneration } from '../../hooks/useImageGeneration';

interface Props {
  variant?: 'dock' | 'panel' | 'chat';
}

export default function Composer({ variant = 'dock' }: Props) {
  const { prompt, setPrompt, isGenerating, send } = useImageGeneration();
  const aspectRatio = useStore((s) => s.aspectRatio);
  const setAspectRatio = useStore((s) => s.setAspectRatio);
  const resolution = useStore((s) => s.resolution);
  const setResolution = useStore((s) => s.setResolution);
  const generateCount = useStore((s) => s.generateCount);
  const setGenerateCount = useStore((s) => s.setGenerateCount);
  const referenceImages = useStore((s) => s.referenceImages);
  const addReferenceImage = useStore((s) => s.addReferenceImage);
  const removeReferenceImage = useStore((s) => s.removeReferenceImage);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const addFiles = (files: File[]) =>
    files.filter((f) => f.type.startsWith('image/')).forEach((f) => addReferenceImage(URL.createObjectURL(f)));

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const fs = Array.from(e.clipboardData?.files ?? []);
      if (fs.some((f) => f.type.startsWith('image/'))) addFiles(fs);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPanel = variant === 'panel';
  const isChat = variant === 'chat';

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(Array.from(e.dataTransfer.files)); }}
      className={`${isPanel ? 'h-full studio-command-shadow' : isChat ? '' : 'studio-command-shadow'} w-full overflow-hidden rounded-[22px] border backdrop-blur-xl transition-all focus-within:border-[#D6A85D]/60 focus-within:ring-2 focus-within:ring-[#D6A85D]/15 ${dragOver ? 'border-[#D6A85D] ring-2 ring-[#D6A85D]/20' : isPanel ? 'border-white/10 bg-[#1C1D20]/92' : 'border-white/10 bg-[#18191C]/88'}`}
    >
      {referenceImages.length > 0 && (
        <div className="flex gap-2 p-3 pb-0 overflow-x-auto scrollbar-hide">
          {referenceImages.map((url, i) => (
            <div key={i} className="relative w-12 h-12 rounded-xl border border-white/12 flex-shrink-0 overflow-hidden">
              <button type="button" onClick={() => setPreview(url)} className="block w-full h-full" title="点击放大">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
              <button onClick={() => removeReferenceImage(i)} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-md bg-black/60 text-white text-[10px] leading-none">×</button>
            </div>
          ))}
        </div>
      )}

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' || e.shiftKey) return;
          e.preventDefault();
          void send();
        }}
        placeholder="描述你想生成的图像，Enter 发送，Shift+Enter 换行（可粘贴/拖拽参考图，右侧词库点选填入）"
        className={`${isPanel ? 'min-h-[260px]' : isChat ? 'min-h-[108px]' : 'min-h-[74px]'} w-full max-h-72 resize-none bg-transparent border-none outline-none focus-visible:outline-none px-5 py-4 text-sm leading-7 text-white placeholder-[#8C867D]`}
      />

      <div className={`${isPanel ? 'grid grid-cols-2' : 'flex flex-wrap items-center'} gap-2 border-t border-white/8 bg-[#121214]/82 px-3 py-3`}>
        <label className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12px] cursor-pointer whitespace-nowrap text-[#B9B0A5] hover:bg-white/7 hover:text-white">
          <PlusIcon className="w-3.5 h-3.5 flex-shrink-0" />参考图
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addFiles(Array.from(e.target.files ?? [])); e.target.value = ''; }} />
        </label>
        <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="h-9 rounded-lg border border-white/10 bg-[#242528] px-2.5 text-[12px] text-[#E8E1D6] outline-none cursor-pointer hover:border-white/20">
          {RATIO_OPTIONS.map((r) => <option key={r.id} value={r.id}>{r.label} {r.desc}</option>)}
        </select>
        <select value={resolution} onChange={(e) => setResolution(e.target.value)} className="h-9 rounded-lg border border-white/10 bg-[#242528] px-2.5 text-[12px] text-[#E8E1D6] outline-none cursor-pointer hover:border-white/20">
          {RESOLUTION_OPTIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
        <select value={generateCount} onChange={(e) => setGenerateCount(parseInt(e.target.value, 10))} className="h-9 rounded-lg border border-white/10 bg-[#242528] px-2.5 text-[12px] text-[#E8E1D6] outline-none cursor-pointer hover:border-white/20">
          {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} 张</option>)}
        </select>
        <button onClick={send} disabled={isGenerating || !prompt.trim()} className={`${isPanel ? 'col-span-2 w-full' : 'ml-auto'} h-10 px-6 rounded-lg bg-[#D6A85D] text-sm font-semibold text-[#16110A] shadow-sm disabled:opacity-50 whitespace-nowrap transition-colors hover:bg-[#E7BF7A]`}>
          {isGenerating ? '生成中…' : '发送'}
        </button>
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6" onClick={() => setPreview(null)}>
          <img src={preview} alt="" className="max-h-full max-w-full object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
}
