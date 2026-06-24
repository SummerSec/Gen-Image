import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { generateImage } from '../../services/api';
import { applyWatermark } from '../../services/watermark';
import { RATIO_OPTIONS, RESOLUTION_OPTIONS } from '../../data/options';
import { CopyIcon, PlusIcon } from '../common/Icons';
import { copyText } from '../../utils/clipboard';

// Unified composer: prompt + params + reference images + send (single-shot or iterative).
export default function Composer() {
  const prompt = useStore((s) => s.prompt);
  const setPrompt = useStore((s) => s.setPrompt);
  const aspectRatio = useStore((s) => s.aspectRatio);
  const setAspectRatio = useStore((s) => s.setAspectRatio);
  const resolution = useStore((s) => s.resolution);
  const setResolution = useStore((s) => s.setResolution);
  const generateCount = useStore((s) => s.generateCount);
  const setGenerateCount = useStore((s) => s.setGenerateCount);
  const referenceImages = useStore((s) => s.referenceImages);
  const addReferenceImage = useStore((s) => s.addReferenceImage);
  const removeReferenceImage = useStore((s) => s.removeReferenceImage);
  const isGenerating = useStore((s) => s.isGenerating);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const addFiles = (files: File[]) =>
    files.filter((f) => f.type.startsWith('image/')).forEach((f) => addReferenceImage(URL.createObjectURL(f)));

  const copyCurrentPrompt = async () => {
    const text = prompt.trim();
    if (!text) return;
    await copyText(text);
    setCopiedPrompt(true);
    window.setTimeout(() => setCopiedPrompt(false), 1200);
  };

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const fs = Array.from(e.clipboardData?.files ?? []);
      if (fs.some((f) => f.type.startsWith('image/'))) addFiles(fs);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = async () => {
    const text = prompt.trim();
    const st = useStore.getState();
    if (!text || st.isGenerating) return;
    if (!st.apiKey.trim()) {
      st.addMessage({ id: `${Date.now()}-e`, role: 'assistant', text: '请先在设置中配置 API Key（点击顶部 ⚙ 按钮）' });
      return;
    }
    st.addMessage({ id: `${Date.now()}-u`, role: 'user', text });
    setPrompt('');
    st.setIsGenerating(true);

    const ratio = RATIO_OPTIONS.find((r) => r.id === st.aspectRatio);
    const resLabel = RESOLUTION_OPTIONS.find((r) => r.id === st.resolution)?.label;
    const parts = [resLabel, ratio ? `${ratio.label}比例${ratio.desc}` : undefined].filter(Boolean);
    const fullPrompt = (parts.length ? `请生成${parts.join('、')}的图片。` : '') + text;
    // iterate on last result when no explicit reference is provided
    const lastImg = [...st.messages].reverse().find((m) => m.role === 'assistant' && m.image)?.image;
    const refs = st.referenceImages.length ? st.referenceImages : lastImg ? [lastImg] : [];
    st.setReferenceImages([]); // consume references once sent

    try {
      await Promise.all(
        Array.from({ length: st.generateCount }, async (_, i) => {
          const id = `${Date.now()}-a${i}`;
          st.addMessage({ id, role: 'assistant', pending: true });
          try {
            let url = await generateImage({
              prompt: fullPrompt, model: st.model, resolution: st.resolution, aspectRatio: st.aspectRatio,
              style: st.style, cfgScale: st.cfgScale, referenceImages: refs, apiKey: st.apiKey, baseUrl: st.baseUrl,
            });
            if (st.watermarkEnabled) url = await applyWatermark(url);
            st.updateMessage(id, { image: url, pending: false });
            st.addHistory({ id: `${id}-h`, url, prompt: text, model: st.model, timestamp: Date.now() });
          } catch (err) {
            st.updateMessage(id, { pending: false, text: err instanceof Error ? err.message : '生成失败' });
          }
        }),
      );
    } finally {
      st.setIsGenerating(false);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(Array.from(e.dataTransfer.files)); }}
      className={`mx-auto w-full max-w-3xl rounded-xl border bg-white/95 backdrop-blur studio-surface-shadow transition-all focus-within:border-[#9EA5E6] focus-within:ring-2 focus-within:ring-[#5e6ad2]/15 ${dragOver ? 'border-[#5e6ad2] ring-2 ring-[#5e6ad2]/20' : 'border-[#E6E8EE]'}`}
    >
      {referenceImages.length > 0 && (
        <div className="flex gap-2 p-3 pb-0 overflow-x-auto scrollbar-hide">
          {referenceImages.map((url, i) => (
            <div key={i} className="relative w-12 h-12 rounded-lg border border-[#E6E8EE] flex-shrink-0 overflow-hidden">
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
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void send(); } }}
        placeholder="描述你想生成的图像，Ctrl/⌘+Enter 发送（可粘贴/拖拽参考图，右侧词库点选填入）"
        className="w-full min-h-[88px] max-h-48 resize-none bg-transparent border-none outline-none focus-visible:outline-none px-4 py-3 text-sm text-[#18181B] placeholder-[#A1A1AA] leading-6"
      />

      <div className="flex flex-wrap items-center gap-2 border-t border-[#EEF0F4] bg-[#FAFAFB] px-3 py-2.5">
        <label className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-[12px] text-[#71717A] cursor-pointer hover:bg-white hover:text-[#18181B] whitespace-nowrap">
          <PlusIcon className="w-3.5 h-3.5 flex-shrink-0" />参考图
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addFiles(Array.from(e.target.files ?? [])); e.target.value = ''; }} />
        </label>
        <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="h-8 rounded-lg border border-[#E6E8EE] bg-white px-2 text-[12px] text-[#3F3F46] outline-none cursor-pointer hover:border-[#BFC4CF]">
          {RATIO_OPTIONS.map((r) => <option key={r.id} value={r.id}>{r.label} {r.desc}</option>)}
        </select>
        <select value={resolution} onChange={(e) => setResolution(e.target.value)} className="h-8 rounded-lg border border-[#E6E8EE] bg-white px-2 text-[12px] text-[#3F3F46] outline-none cursor-pointer hover:border-[#BFC4CF]">
          {RESOLUTION_OPTIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
        <select value={generateCount} onChange={(e) => setGenerateCount(parseInt(e.target.value, 10))} className="h-8 rounded-lg border border-[#E6E8EE] bg-white px-2 text-[12px] text-[#3F3F46] outline-none cursor-pointer hover:border-[#BFC4CF]">
          {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} 张</option>)}
        </select>
        <button
          type="button"
          onClick={copyCurrentPrompt}
          disabled={!prompt.trim()}
          className="h-8 px-2.5 rounded-lg border border-[#E6E8EE] bg-white text-[12px] text-[#71717A] hover:text-[#18181B] hover:border-[#BFC4CF] disabled:opacity-50 disabled:hover:text-[#71717A] disabled:hover:border-[#E6E8EE] inline-flex items-center gap-1"
          title="复制当前提示词"
        >
          <CopyIcon className="w-3.5 h-3.5" />
          {copiedPrompt ? '已复制' : '复制'}
        </button>
        <button onClick={send} disabled={isGenerating || !prompt.trim()} className="ml-auto h-9 px-5 rounded-lg bg-[#5e6ad2] text-white text-sm font-medium shadow-sm hover:bg-[#4F58C9] disabled:opacity-50 whitespace-nowrap">
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
